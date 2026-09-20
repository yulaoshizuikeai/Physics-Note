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

// 知识库系统 Prompt 与高能效控字约束
const SYSTEM_PROMPT = `你是高中物理知识库站点的智能文档检索与教学推导专家。你的职责是依据给定的【参考文档片段】，为用户提供概念严谨、推导规范、直击考点、客观无废话的高考物理权威解答。

### 回答规范与高能效控字原则：
1. 严禁寒暄与废话：严禁输出任何开场白（如“您好”、“根据参考片段”、“很高兴回答”）或结束语套话（如“希望对您有所帮助”、“综上所述”），首句直接给出核心答案。
2. 结构紧凑精炼：全文建议控制在 300 字以内，采用结构化排版：
   - 【核心结论/公式】：首要呈现物理结论与核心公式。若涉及方案、接法或性质对比，优先使用紧凑的 Markdown 表格排版。
   - 【关键依据与推导】：简述物理定律依据与关键推导步骤，拒绝冗长背景铺垫。
   - 【高考避坑要点】：指出 1~2 条极易混淆或失分的物理陷阱。
3. 严格基于事实：所有回答必须 100% 能够从提供的【参考文档片段】中找到支撑。片段中未提及的内容，坚决不进行推测、猜测或臆造。若参考片段不足以完整解答，如实告知：“根据现有知识库文档，未检索到该知识点的完整说明”，切勿自行编造。
4. 物理公式与数学符号规范 (强制 LaTeX 输出)：
   - 所有物理量符号、变量、数值单位、物理公式、定理定律及推导过程（例如 $E = U + Ir$、$F = ma$、$Bqv = m\\frac{v^2}{R}$、$U_{\\text{端}} = E - Ir$ 等），必须且只能使用规范的标准 LaTeX 语法输出，严禁输出普通纯文本拼接的公式。
   - 【行内公式】：必须统一使用单美元符号包围，格式为 $公式内容$（例如：根据闭合电路欧姆定律 $I = \\frac{E}{R + r}$）。严禁使用 \\( \\)。
   - 【块级/独立推导公式】：重要的核心公式、定理表达式或多行推导必须独占一行，统一使用双美元符号包围，格式为：
$$
公式内容
$$
     严禁使用 \\[ \\]。
   - 公式中角标、分式、根号必须规范闭合（如 $v_0$、$\\Delta t$、$\\frac{a}{b}$、$\\sqrt{2gh}$）。
5. 溯源说明：在回答末尾列出所参考的文档标题。
6. 语言风格：结构层次分明，使用清晰的 Markdown 标题与要点排版。`;

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

    // 路由限定：只接受 /api/search、/api/proxy 或根路径 POST
    if (
      url.pathname !== "/api/search" &&
      url.pathname !== "/api/proxy" &&
      url.pathname !== "/"
    ) {
      return new Response(JSON.stringify({ error: "Not Found. Use POST /api/search or POST /api/proxy" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // --- /api/proxy：通用 OpenAI 兼容流式代理（解决 CORS 限制）---
    // 请求体: { endpoint, apiKey, payload }
    // payload 将原样转发至 endpoint，适配 NVIDIA NIM / 任意 OpenAI 兼容接口
    if (url.pathname === "/api/proxy") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed. Use POST" }), {
          status: 405,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }

      let proxyBody;
      try {
        proxyBody = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON request body" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }

      const { endpoint: targetEndpoint, apiKey: proxyApiKey, payload } = proxyBody;
      if (!targetEndpoint || typeof targetEndpoint !== "string") {
        return new Response(JSON.stringify({ error: "Missing required field: endpoint" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }

      const proxyHeaders = { "Content-Type": "application/json" };
      if (proxyApiKey) {
        proxyHeaders["Authorization"] = `Bearer ${proxyApiKey}`;
      }

      let upstreamRes;
      try {
        upstreamRes = await fetch(targetEndpoint, {
          method: "POST",
          headers: proxyHeaders,
          body: JSON.stringify(payload || {}),
        });
      } catch (fetchErr) {
        return new Response(
          JSON.stringify({ error: `Failed to reach upstream: ${fetchErr.message}` }),
          { status: 502, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
        );
      }

      // 原样透传响应体（含流式 SSE），仅添加 CORS 头
      const proxyRespHeaders = {
        ...CORS_HEADERS,
        "Content-Type": upstreamRes.headers.get("Content-Type") || "application/json",
      };

      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        headers: proxyRespHeaders,
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
            snippet: (m.metadata?.text || "").slice(0, 300),
            score: Math.round(m.score * 1000) / 1000,
          }));

          // 立即推送 sources 事件
          await sendSSEEvent(writer, encoder, "sources", { sources });

          // 若仅请求知识切片（如配合客户端自定义大模型 RAG），直接发送完成事件并结束，跳过边缘模型生成
          if (reqBody.searchOnly === true) {
            await sendSSEEvent(writer, encoder, "done", {});
            return;
          }

          // --- 组装上下文与 System Prompt ---
          const contextBlocks = validMatches.map((m, index) => {
            const title = m.metadata?.title || `文档 ${index + 1}`;
            const text = m.metadata?.text || "";
            return `【参考片段 ${index + 1}】《${title}》\n${text}`;
          });

          const contextContent = contextBlocks.join("\n\n---\n\n");
          const userPrompt = `【参考文档片段】：\n${contextContent}\n\n【用户问题】：\n${query}`;

          // --- 轨道 2：LLM 流式问答 (首字 TTFT <= 600ms) ---
          // 优先使用当前官方主流的 Llama 3.1 8B (FP8 精准量化低神经元消耗版)
          let aiStream;
          try {
            aiStream = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
              max_tokens: 600,
              stream: true,
            });
          } catch (modelErr) {
            // 降级使用超轻量多语言 Llama 3.2 3B
            aiStream = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
              max_tokens: 600,
              stream: true,
            });
          }

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
