/**
 * Cloudflare Worker: 边缘“双轨并行”AI 知识库搜索与流式问答服务
 *
 * 核心技术栈：
 * - 运行时：Cloudflare Workers (ES Module)
 * - 向量数据库：Cloudflare Vectorize (docs-index, metric: cosine)
 * - Embedding 模型：@cf/baai/bge-base-en-v1.5 (768 维)
 * - LLM 问答模型：@cf/meta/llama-3-8b-instruct (stream: true)
 * - 传输协议：HTTP POST + Server-Sent Events (SSE) 双轨输出
 */

// 跨域通用头配置
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// 知识库系统 Prompt 与防幻觉约束
const SYSTEM_PROMPT = `你是当前知识库站点的智能文档检索助理。你的职责是依据给定的【参考文档片段】，为用户提供精确、客观、无废话的解答。

### 规则准则：
1. 严格基于事实：所有回答必须 100% 能够从提供的【参考文档片段】中找到支撑。片段中未提及的内容，坚决不进行推测、猜测或臆造。
2. 拒绝幻觉：如果参考片段中的信息不足以完整解答问题，请如实告知：“根据现有文档，未找到完整说明”，切勿自行补全。
3. 溯源说明：若有步骤或结论，在回答末尾列出文档标题作为参考。
4. 语言一致：用户使用中文提问，回答必须使用中文；结构清晰，可用 Markdown 格式。`;

/**
 * 辅助函数：向 SSE 写入标准事件行
 */
async function sendSSEEvent(writer, encoder, event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  await writer.write(encoder.encode(message));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. 处理 OPTIONS 跨域预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 路由限定：只接受 /api/search 或根路径 POST
    if (url.pathname !== "/api/search" && url.pathname !== "/") {
      return new Response(JSON.stringify({ error: "Not Found. Use POST /api/search" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed. Use POST" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // 2. 输入校验
    let reqBody;
    try {
      reqBody = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const rawQuery = reqBody?.query;
    if (typeof rawQuery !== "string" || rawQuery.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required and cannot be empty" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        },
      );
    }

    const query = rawQuery.trim();

    // 检查所需绑定
    if (!env.AI || !env.VECTORIZE) {
      return new Response(
        JSON.stringify({
          error:
            "Cloudflare Workers AI or Vectorize binding is missing. Please check wrangler.toml.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        },
      );
    }

    // 3. 构建 TransformStream 接管响应流
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // 在后台异步执行双轨流水线，使 HTTP 首包（含 SSE 协议头）即时抵达客户端
    ctx.waitUntil(
      (async () => {
        try {
          // --- 步骤 A：向量化用户 Query ---
          const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
            text: [query],
          });

          const queryVector = embeddingResponse?.data?.[0];
          if (!queryVector || !Array.isArray(queryVector)) {
            throw new Error("Failed to generate embedding vector from Workers AI.");
          }

          // --- 步骤 B：检索 Vectorize 向量索引 ---
          const vectorResults = await env.VECTORIZE.query(queryVector, {
            topK: 4,
            returnMetadata: "all",
          });

          const matches = vectorResults?.matches || [];

          // 相似度截断阈值过滤：score >= 0.65
          const validMatches = matches.filter(
            (m) => typeof m.score === "number" && m.score >= 0.65,
          );

          // --- 边界处理：未检索到高相关有效文档 ---
          if (validMatches.length === 0) {
            // 1. 推送空的 sources 列表
            await sendSSEEvent(writer, encoder, "sources", { sources: [] });
            // 2. 推送友好提示文本
            await sendSSEEvent(writer, encoder, "delta", {
              text: "知识库中未检索到与该问题高相关的内容，请更换关键词",
            });
            // 3. 结束流并关闭连接，严禁调用大模型
            await sendSSEEvent(writer, encoder, "done", {});
            return;
          }

          // --- 轨道 1：文档快速召回 (目标耗时 <= 300ms) ---
          const sources = validMatches.map((m) => ({
            title: m.metadata?.title || "知识库文档",
            url: m.metadata?.url || "",
            score: Math.round(m.score * 1000) / 1000,
          }));

          // 立即推送 sources 事件
          await sendSSEEvent(writer, encoder, "sources", { sources });

          // --- 组装上下文与 System Prompt ---
          const contextBlocks = validMatches.map((m, index) => {
            const title = m.metadata?.title || `文档 ${index + 1}`;
            const text = m.metadata?.text || "";
            return `【参考片段 ${index + 1}】《${title}》\n${text}`;
          });

          const contextContent = contextBlocks.join("\n\n---\n\n");
          const userPrompt = `【参考文档片段】：\n${contextContent}\n\n【用户问题】：\n${query}`;

          // --- 轨道 2：LLM 流式问答 (首字 TTFT <= 600ms) ---
          const aiStream = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 1024,
            stream: true,
          });

          // 解析 Workers AI 原生 SSE 响应流，转换为统一契约的 delta 事件
          const reader = aiStream.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            // 保留最后一个可能未闭合的行碎片
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data:")) continue;

              const dataStr = trimmed.replace(/^data:\s*/, "");
              if (dataStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.response) {
                  await sendSSEEvent(writer, encoder, "delta", {
                    text: parsed.response,
                  });
                }
              } catch {
                // 忽略非 JSON 片段
              }
            }
          }

          // 处理缓冲区中剩余数据
          if (buffer.trim().startsWith("data:")) {
            const dataStr = buffer.trim().replace(/^data:\s*/, "");
            if (dataStr && dataStr !== "[DONE]") {
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.response) {
                  await sendSSEEvent(writer, encoder, "delta", {
                    text: parsed.response,
                  });
                }
              } catch {}
            }
          }

          // 正常推送结束事件
          await sendSSEEvent(writer, encoder, "done", {});
        } catch (err) {
          // 异常分支：推送 error 事件
          try {
            await sendSSEEvent(writer, encoder, "error", {
              message: err.message || "内部处理出现异常",
            });
          } catch {}
        } finally {
          // 无论成功还是失败，均确保关闭流管道，避免 Worker 挂起
          try {
            await writer.close();
          } catch {}
        }
      })(),
    );

    // 立即向客户端返回 SSE 响应流
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...CORS_HEADERS,
      },
    });
  },
};
