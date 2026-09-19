import { reactive, readonly } from "vue";

export type AiApiProtocol = "worker" | "openai" | "anthropic";

export interface AiApiConfig {
  enabled: boolean;
  protocol: AiApiProtocol;
  endpoint: string;
  apiKey: string;
  model: string;
  temperature: number;
  systemPrompt: string;
}

export interface AiApiPreset {
  id: string;
  name: string;
  badge: string;
  protocol: AiApiProtocol;
  endpoint: string;
  model: string;
  description: string;
}

export const AI_API_PRESETS: AiApiPreset[] = [
  {
    id: "worker",
    name: "Cloudflare 边缘知识库 (默认)",
    badge: "推荐",
    protocol: "worker",
    endpoint: "https://physics-knowledge-search.harlan0804.workers.dev/api/search",
    model: "Llama 3.1 8B (Vectorize RAG)",
    description: "毫秒级向量召回 + 边缘 Llama 3.1 模型，无需自带 API Key，免翻墙可用",
  },
  {
    id: "deepseek",
    name: "DeepSeek (深度求索)",
    badge: "超强推导",
    protocol: "openai",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
    description: "理科推导极强，深度优化数学物理公式与 LaTeX 排版",
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    badge: "主流国际",
    protocol: "openai",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    description: "支持 gpt-4o, gpt-4o-mini 等官方或兼容的反代中转接口",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    badge: "自然语言",
    protocol: "anthropic",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-sonnet-20241022",
    description: "严密的逻辑推理与长上下文解析，支持 Claude 3.5 系列",
  },
  {
    id: "ollama",
    name: "Ollama (本地自建离线模型)",
    badge: "完全隐私",
    protocol: "openai",
    endpoint: "http://localhost:11434/v1/chat/completions",
    model: "llama3.1:8b",
    description: "本地运行无网络消耗，数据 100% 留在本机",
  },
  {
    id: "siliconflow",
    name: "SiliconFlow (硅基流动)",
    badge: "国内高速",
    protocol: "openai",
    endpoint: "https://api.siliconflow.cn/v1/chat/completions",
    model: "Qwen/Qwen2.5-7B-Instruct",
    description: "国内超高速推理，支持通义千问 Qwen、DeepSeek 等",
  },
];

export const DEFAULT_AI_SYSTEM_PROMPT = `你是高中物理知识库与高考备考辅导专家。你的职责是依据物理学科核心素养，为用户提供概念严谨、推导规范、客观无废话的高考物理权威解答。
请严格遵守以下物理与数学排版规范：
1. 物理公式与数学符号规范 (强制 LaTeX 输出)：
   - 所有物理量符号、变量、数值单位、物理公式、定理定律及推导过程（例如 $E = U + Ir$、$F = ma$、$Bqv = m\\frac{v^2}{R}$、$U_{\\text{端}} = E - Ir$ 等），必须且只能使用规范的标准 LaTeX 语法输出，严禁输出普通纯文本拼接的公式。
   - 【行内公式】：必须统一使用单美元符号包围，格式为 $公式内容$（例如：根据闭合电路欧姆定律 $I = \\frac{E}{R + r}$）。严禁使用 \\( \\)。
   - 【块级/独立推导公式】：重要的核心公式、定理表达式或多行推导必须独占一行，统一使用双美元符号包围，格式为：
$$
公式内容
$$
     严禁使用 \\[ \\]。
   - 公式中角标、分式、根号必须规范闭合（如 $v_0$、$\\Delta t$、$\\frac{a}{b}$、$\\sqrt{2gh}$）。
2. 逻辑分明：结构层次清晰，区分核心结论、受力与过程推演、易错防坑陷阱。
3. 语言风格：客观精炼，使用 Markdown 格式排版。`;

export const DEFAULT_AI_API_CONFIG: AiApiConfig = {
  enabled: false,
  protocol: "worker",
  endpoint: "https://physics-knowledge-search.harlan0804.workers.dev/api/search",
  apiKey: "",
  model: "Llama 3.1 8B (Vectorize RAG)",
  temperature: 0.3,
  systemPrompt: DEFAULT_AI_SYSTEM_PROMPT,
};

const STORAGE_KEY = "cc-ai-api-config";

const configState = reactive<AiApiConfig>({ ...DEFAULT_AI_API_CONFIG });
let isLoaded = false;

const persistConfig = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configState));
  } catch (err) {
    console.error("[useAiApiConfig] Failed to save config to localStorage", err);
  }
};

export const loadAiApiConfig = () => {
  if (isLoaded || typeof window === "undefined") return;
  isLoaded = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        if (typeof parsed.enabled === "boolean") configState.enabled = parsed.enabled;
        if (["worker", "openai", "anthropic"].includes(parsed.protocol)) {
          configState.protocol = parsed.protocol;
        }
        if (typeof parsed.endpoint === "string") configState.endpoint = parsed.endpoint;
        if (typeof parsed.apiKey === "string") configState.apiKey = parsed.apiKey;
        if (typeof parsed.model === "string") configState.model = parsed.model;
        if (typeof parsed.temperature === "number") configState.temperature = parsed.temperature;
        if (typeof parsed.systemPrompt === "string") configState.systemPrompt = parsed.systemPrompt;
      }
    }
  } catch (err) {
    console.error("[useAiApiConfig] Failed to parse config from localStorage", err);
  }
};

export const updateAiApiConfig = (patch: Partial<AiApiConfig>) => {
  Object.assign(configState, patch);
  persistConfig();
};

export const resetAiApiConfig = () => {
  Object.assign(configState, DEFAULT_AI_API_CONFIG);
  persistConfig();
};

/**
 * 测试自定义 API 连接连通性与密钥有效性
 */
export const testAiApiConnection = async (
  config: AiApiConfig,
): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
  const startTime = Date.now();

  try {
    if (config.protocol === "worker") {
      const res = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "ping" }),
      });
      const latencyMs = Date.now() - startTime;
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return { success: true, message: `连接成功 (耗时 ${latencyMs}ms)`, latencyMs };
    }

    if (config.protocol === "openai") {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (config.apiKey) {
        headers["Authorization"] = `Bearer ${config.apiKey}`;
      }

      const res = await fetch(config.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model || "deepseek-chat",
          messages: [{ role: "user", content: "请只回复两个字：收到" }],
          max_tokens: 10,
          temperature: 0.1,
          stream: false,
        }),
      });

      const latencyMs = Date.now() - startTime;
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${res.status} (${res.statusText})`;
        throw new Error(msg);
      }
      return { success: true, message: `OpenAI 兼容接口连通正常 (耗时 ${latencyMs}ms)`, latencyMs };
    }

    if (config.protocol === "anthropic") {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      };

      const res = await fetch(config.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model || "claude-3-5-sonnet-20241022",
          messages: [{ role: "user", content: "请只回复两个字：收到" }],
          max_tokens: 10,
          temperature: 0.1,
        }),
      });

      const latencyMs = Date.now() - startTime;
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${res.status} (${res.statusText})`;
        throw new Error(msg);
      }
      return {
        success: true,
        message: `Anthropic 接口连通正常 (耗时 ${latencyMs}ms)`,
        latencyMs,
      };
    }

    return { success: false, message: "未知的协议类型" };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "连接失败，请检查 URL、API Key 或跨域 CORS 设置",
    };
  }
};

export interface StreamChatCallbacks {
  onSources?: (sources: Array<{ title: string; url: string; score: number }>) => void;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

/**
 * 统一执行流式 AI 问答请求（根据协议分发）
 */
export const streamAiChat = async (
  query: string,
  config: AiApiConfig,
  callbacks: StreamChatCallbacks,
  signal?: AbortSignal,
): Promise<void> => {
  // 如果未启用自定义 API，或者协议是 worker，则走默认 Cloudflare 边缘工作流
  if (!config.enabled || config.protocol === "worker") {
    const res = await fetch(config.endpoint || DEFAULT_AI_API_CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    if (!res.body) throw new Error("No readable stream received");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const eventBlocks = buffer.split("\n\n");
      buffer = eventBlocks.pop() || "";

      for (const block of eventBlocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        const lines = trimmed.split("\n");
        let eventType = "message";
        let dataText = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line.replace(/^event:\s*/, "").trim();
          } else if (line.startsWith("data:")) {
            dataText += line.replace(/^data:\s*/, "").trim();
          }
        }

        if (!dataText) continue;

        let parsedData: any = {};
        try {
          parsedData = JSON.parse(dataText);
        } catch {
          parsedData = { text: dataText };
        }

        if (eventType === "sources") {
          callbacks.onSources?.(parsedData.sources || []);
        } else if (eventType === "delta") {
          if (parsedData.text) callbacks.onDelta(parsedData.text);
        } else if (eventType === "done") {
          callbacks.onDone();
        } else if (eventType === "error") {
          callbacks.onError(new Error(parsedData.message || "边缘服务处理出现异常"));
        }
      }
    }
    return;
  }

  // 自定义协议：先尝试从默认边缘向量检索获取知识库切片（增强 RAG，失败或超时则优雅降级为纯模型）
  let contextSnippet = "";
  try {
    const ragController = new AbortController();
    const timer = setTimeout(() => ragController.abort(), 2500);
    if (signal) {
      signal.addEventListener("abort", () => ragController.abort(), { once: true });
    }

    const ragRes = await fetch(DEFAULT_AI_API_CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, searchOnly: true }),
      signal: ragController.signal,
    });

    clearTimeout(timer);

    if (ragRes.ok && ragRes.body) {
      const reader = ragRes.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";
        for (const b of blocks) {
          if (b.includes("event: sources")) {
            const m = b.match(/data:\s*(.+)/);
            if (m && m[1]) {
              try {
                const sData = JSON.parse(m[1]);
                if (sData.sources?.length) {
                  callbacks.onSources?.(sData.sources);
                  contextSnippet = `【高考物理知识库参考文档资料】：\n${sData.sources
                    .map(
                      (s: any, idx: number) =>
                        `[${idx + 1}] 《${s.title}》 (${s.url}):\n${s.snippet || "相关核心考点与物理公式"}`,
                    )
                    .join("\n\n")}\n\n`;
                }
              } catch {}
            }
          }
        }
        // 获得 sources 后即可提前中断边缘 Worker，改由用户自定义大模型生成
        if (contextSnippet) {
          reader.cancel();
          break;
        }
      }
    }
  } catch {
    // 忽略 RAG 检索异常或超时，优雅降级为纯模型直接推导
  }

  const userContent = `${contextSnippet}【用户问题】：\n${query}`;

  // OpenAI 兼容流式协议
  if (config.protocol === "openai") {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }

    const res = await fetch(config.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model || "deepseek-chat",
        messages: [
          { role: "system", content: config.systemPrompt || DEFAULT_AI_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        temperature: config.temperature ?? 0.3,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
    }

    if (!res.body) throw new Error("No readable stream received from OpenAI endpoint");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const dataStr = trimmed.replace(/^data:\s*/, "").trim();
        if (dataStr === "[DONE]") {
          callbacks.onDone();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          const deltaContent = parsed.choices?.[0]?.delta?.content;
          const reasoningContent = parsed.choices?.[0]?.delta?.reasoning_content;
          if (deltaContent) {
            callbacks.onDelta(deltaContent);
          } else if (reasoningContent) {
            // 兼容 DeepSeek Reasoner (R1) 思考过程流
            callbacks.onDelta(reasoningContent);
          }
        } catch {}
      }
    }
    callbacks.onDone();
    return;
  }

  // Anthropic Claude 协议
  if (config.protocol === "anthropic") {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    };

    const res = await fetch(config.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model || "claude-3-5-sonnet-20241022",
        system: config.systemPrompt || DEFAULT_AI_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
        max_tokens: 3000,
        temperature: config.temperature ?? 0.3,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
    }

    if (!res.body) throw new Error("No readable stream received from Anthropic endpoint");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const dataStr = trimmed.replace(/^data:\s*/, "").trim();

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            callbacks.onDelta(parsed.delta.text);
          } else if (parsed.type === "message_stop") {
            callbacks.onDone();
            return;
          } else if (parsed.type === "error") {
            callbacks.onError(new Error(parsed.error?.message || "Anthropic 接口调用异常"));
            return;
          }
        } catch {}
      }
    }
    callbacks.onDone();
  }
};

export const useAiApiConfig = () => {
  loadAiApiConfig();

  return {
    config: readonly(configState),
    rawConfig: configState,
    updateAiApiConfig,
    resetAiApiConfig,
    testAiApiConnection,
    streamAiChat,
  };
};
