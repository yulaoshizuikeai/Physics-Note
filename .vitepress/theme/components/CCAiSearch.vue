<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";

import {
  useAiApiConfig,
  AI_API_PRESETS,
  DEFAULT_AI_SYSTEM_PROMPT,
  type AiApiPreset,
} from "../composables/useAiApiConfig";
import { renderAiMarkdown } from "../utils/aiMarkdown";

const props = defineProps<{
  mode?: "floating" | "embedded";
}>();

// 自定义 API 配置与状态管理
const { config, updateAiApiConfig, resetAiApiConfig, testAiApiConnection, streamAiChat } =
  useAiApiConfig();
const showConfigPanel = ref(false);
const showApiKey = ref(false);
const showAdvancedConfig = ref(false);
const testState = ref<{ testing: boolean; message: string; success?: boolean } | null>(null);

const applyPreset = (preset: AiApiPreset) => {
  if (preset.id === "worker") {
    updateAiApiConfig({
      enabled: false,
      protocol: "worker",
      endpoint: preset.endpoint,
      model: preset.model,
    });
  } else {
    updateAiApiConfig({
      enabled: true,
      protocol: preset.protocol,
      endpoint: preset.endpoint,
      model: preset.model,
    });
  }
};

const isPresetSelected = (p: AiApiPreset) => {
  if (p.id === "worker") return !config.enabled || config.protocol === "worker";
  return config.enabled && config.protocol === p.protocol && config.endpoint === p.endpoint;
};

const runConnectionTest = async () => {
  testState.value = { testing: true, message: "正在测试连接..." };
  const res = await testAiApiConnection(config);
  testState.value = { testing: false, message: res.message, success: res.success };
};

// 弹窗状态与数据
const isOpen = ref(props.mode === "embedded");
const query = ref("");
const isSearching = ref(false);
const sources = ref<Array<{ title: string; url: string; score: number }>>([]);
const aiText = ref("");
const statusText = ref("等待输入问题");
const statusCode = ref<"ready" | "searching" | "generating" | "done" | "error">("ready");
const errorMessage = ref("");
let abortController: AbortController | null = null;

// 预设高频高考物理考点
const presetQuestions = [
  "电池电动势内阻的测量相关实验的原理是什么",
  "伏安法测电阻为什么要区分内接法和外接法",
  "小灯泡伏安特性曲线为什么会向下弯曲",
  "动生电动势与感生电动势的区别是什么",
  "测定金属电阻率时为什么要用电流表外接法",
];

const openModal = (initialQuery?: string) => {
  isOpen.value = true;
  if (initialQuery) {
    query.value = initialQuery;
    nextTick(() => executeSearch());
  }
};

const closeModal = () => {
  if (props.mode === "embedded") return;
  isOpen.value = false;
  if (isSearching.value && abortController) {
    abortController.abort();
    isSearching.value = false;
  }
};

const setQueryAndSearch = (q: string) => {
  query.value = q;
  executeSearch();
};

// 执行双轨搜索与流式问答
const executeSearch = async () => {
  const q = query.value.trim();
  if (!q) return;

  if (isSearching.value && abortController) {
    abortController.abort();
  }

  isSearching.value = true;
  sources.value = [];
  aiText.value = "";
  errorMessage.value = "";
  statusCode.value = "searching";
  statusText.value = config.enabled
    ? `正在连接模型 (${config.model})...`
    : "正在检索知识库 (Vectorize)...";

  abortController = new AbortController();

  try {
    await streamAiChat(
      q,
      config,
      {
        onSources: (retrievedSources) => {
          sources.value = retrievedSources;
          statusCode.value = "generating";
          statusText.value = retrievedSources.length
            ? `已精准召回 ${retrievedSources.length} 篇参考文档，AI 智能推导中...`
            : "知识库中未检索到高相关切片，模型直接推导中...";
        },
        onDelta: (text) => {
          aiText.value += text;
          statusCode.value = "generating";
          statusText.value = config.enabled
            ? `大模型 (${config.model}) 正在严密推导...`
            : "边缘物理大模型正在严密推导...";
        },
        onDone: () => {
          statusCode.value = "done";
          statusText.value = "解答生成完毕";
        },
        onError: (err) => {
          statusCode.value = "error";
          statusText.value = "服务异常";
          errorMessage.value = err.message || "处理出现异常";
        },
      },
      abortController.signal,
    );
  } catch (err: any) {
    if (err.name === "AbortError") {
      statusText.value = "提问已取消";
    } else {
      statusCode.value = "error";
      statusText.value = "网络请求失败";
      errorMessage.value = err.message || "网络异常，请检查网络或 API 配置";
    }
  } finally {
    isSearching.value = false;
    abortController = null;
  }
};

// ---------------------------------------------------------------------
// 深度无缝融合：对 VitePress 原生搜索弹窗 (.VPLocalSearchBox) 的温润新极简主义增强
// ---------------------------------------------------------------------
let searchObserver: MutationObserver | null = null;
let activeLocalSearchAbort: AbortController | null = null;

const setupVitePressSearchEnhancement = () => {
  if (typeof window === "undefined") return;

  searchObserver = new MutationObserver(() => {
    const searchModal = document.querySelector(".VPLocalSearchBox");
    if (!searchModal) return;

    const shell = searchModal.querySelector(".shell");
    const searchBar = searchModal.querySelector(".search-bar");
    const searchInput = searchModal.querySelector<HTMLInputElement>("#localsearch-input");
    // 桌面端操作容器位于输入框右侧（排除移动端左侧的 .search-actions.before）
    const allActions = searchModal.querySelectorAll(".search-actions");
    const actions =
      searchModal.querySelector(".search-bar > .search-actions:not(.before)") ||
      (allActions.length > 1 ? allActions[allActions.length - 1] : allActions[0]);

    if (!shell || !searchBar || !searchInput) return;

    // 1. 注入温润物理钴蓝风格的“⚡ 问 AI”快捷按钮
    if (actions && !actions.querySelector(".vp-ai-neo-btn")) {
      const aiBtn = document.createElement("button");
      aiBtn.type = "button";
      aiBtn.className = "vp-ai-neo-btn";
      aiBtn.title = "针对当前输入向高中物理 AI 提问 (Shift + Enter)";
      aiBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span>问 AI</span>
      `;

      aiBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerModalAiAnswer(searchInput.value.trim(), shell);
      };
      actions.prepend(aiBtn);
    }

    // 2. 注入快捷提问提示条 (在搜索输入下方即时提示向 AI 提问)
    let promptBar = shell.querySelector<HTMLElement>(".vp-ai-prompt-bar");
    if (!promptBar) {
      promptBar = document.createElement("div");
      promptBar.className = "vp-ai-prompt-bar";
      promptBar.style.display = "none";
      promptBar.innerHTML = `
        <div class="vp-ai-prompt-left">
          <span class="vp-ai-prompt-icon">›</span>
          <span class="vp-ai-prompt-text">向高考物理 AI 提问</span>
        </div>
        <button type="button" class="vp-ai-prompt-btn">流式解答 ↵</button>
      `;
      promptBar.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerModalAiAnswer(searchInput.value.trim(), shell);
      };
      searchBar.insertAdjacentElement("afterend", promptBar);
    }

    // 3. 监听搜索框输入与回车快捷键
    if (!searchInput.dataset.hasAiListener) {
      searchInput.dataset.hasAiListener = "true";

      const updatePrompt = () => {
        const val = searchInput.value.trim();
        const pBar = shell.querySelector<HTMLElement>(".vp-ai-prompt-bar");
        const aCard = shell.querySelector<HTMLElement>(".vp-modal-ai-card");
        if (!pBar) return;
        if (!val || (aCard && aCard.style.display !== "none")) {
          pBar.style.display = "none";
        } else {
          pBar.style.display = "flex";
          const textEl = pBar.querySelector(".vp-ai-prompt-text");
          if (textEl) {
            const escaped = val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            textEl.innerHTML = `向物理知识库 AI 提问：“<strong>${escaped}</strong>”`;
          }
        }
      };

      searchInput.addEventListener("input", updatePrompt);

      searchInput.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          const selectedItem = searchModal.querySelector(".result.selected");
          // 若按下 Shift/Ctrl 或者是长句提问或本地无选中项，直接走 AI
          if (e.shiftKey || e.ctrlKey || !selectedItem || searchInput.value.trim().length >= 8) {
            const val = searchInput.value.trim();
            if (val) {
              e.preventDefault();
              e.stopPropagation();
              triggerModalAiAnswer(val, shell);
            }
          }
        }
      });
    }

    // 4. 注入底部快捷键提示
    const shortcuts = searchModal.querySelector(".search-keyboard-shortcuts");
    if (shortcuts && !shortcuts.querySelector(".vp-ai-kbd-hint")) {
      const hint = document.createElement("span");
      hint.className = "vp-ai-kbd-hint";
      hint.innerHTML = `<kbd>Shift</kbd><kbd>↵</kbd> 问 AI`;
      shortcuts.appendChild(hint);
    }

    // 5. 注入常驻 AI 智能问答卡片容器 (若尚未存在)
    let aiCard = shell.querySelector<HTMLElement>(".vp-modal-ai-card");
    if (!aiCard) {
      aiCard = document.createElement("div");
      aiCard.className = "vp-modal-ai-card";
      aiCard.style.display = "none";
      aiCard.innerHTML = `
        <div class="vp-ai-card-header">
          <div class="vp-ai-header-left">
            <span class="vp-ai-pill">高考物理知识库 · AI 深度解答</span>
            <span class="vp-ai-status">等待提问</span>
          </div>
          <div class="vp-ai-header-right">
            <a href="/ai-search" class="vp-ai-fullscreen-link" target="_blank" title="以独立全屏模式打开深度推导">全屏问答 ↗</a>
            <button type="button" class="vp-ai-card-close" title="收起 AI 解答">✕</button>
          </div>
        </div>
        <div class="vp-ai-sources-bar" style="display: none;"></div>
        <div class="vp-ai-answer-body"></div>
      `;

      aiCard.querySelector(".vp-ai-card-close")?.addEventListener("click", () => {
        if (aiCard) aiCard.style.display = "none";
        if (activeLocalSearchAbort) {
          activeLocalSearchAbort.abort();
          activeLocalSearchAbort = null;
        }
        const pBar = shell.querySelector<HTMLElement>(".vp-ai-prompt-bar");
        if (pBar && searchInput.value.trim()) {
          pBar.style.display = "flex";
        }
      });

      // 放置在 search-bar / prompt-bar 与 results 之间
      if (promptBar) {
        promptBar.insertAdjacentElement("afterend", aiCard);
      } else {
        searchBar.insertAdjacentElement("afterend", aiCard);
      }
    }
  });

  searchObserver.observe(document.body, { childList: true, subtree: true });
};

// 在搜索弹窗内部直接执行流式 AI 问答
const triggerModalAiAnswer = async (q: string, shell: Element) => {
  if (!q) return;

  const aiCard = shell.querySelector<HTMLElement>(".vp-modal-ai-card");
  const promptBar = shell.querySelector<HTMLElement>(".vp-ai-prompt-bar");
  if (promptBar) promptBar.style.display = "none";
  if (!aiCard) return;

  const statusEl = aiCard.querySelector<HTMLElement>(".vp-ai-status");
  const sourcesBar = aiCard.querySelector<HTMLElement>(".vp-ai-sources-bar");
  const answerBody = aiCard.querySelector<HTMLElement>(".vp-ai-answer-body");
  const fsLink = aiCard.querySelector<HTMLAnchorElement>(".vp-ai-fullscreen-link");
  if (fsLink) {
    fsLink.href = `/ai-search?q=${encodeURIComponent(q)}`;
  }

  aiCard.style.display = "flex";
  if (statusEl) statusEl.textContent = "正在检索知识库 (Vectorize)...";
  if (sourcesBar) {
    sourcesBar.style.display = "none";
    sourcesBar.innerHTML = "";
  }
  if (answerBody) {
    answerBody.innerHTML = `<span class="vp-ai-loading-spinner"></span> 正在阅读知识库文献并严密推导...`;
  }

  if (activeLocalSearchAbort) {
    activeLocalSearchAbort.abort();
  }
  activeLocalSearchAbort = new AbortController();

  let accumulated = "";

  try {
    await streamAiChat(
      q,
      config,
      {
        onSources: (retrievedSources) => {
          if (statusEl) {
            statusEl.textContent = retrievedSources.length
              ? `已精准召回 ${retrievedSources.length} 篇参考文档`
              : "知识库未检索到高相关内容";
          }
          if (sourcesBar && retrievedSources.length) {
            sourcesBar.style.display = "flex";
            sourcesBar.innerHTML = retrievedSources
              .map(
                (s: any) => `
                <a href="${s.url}" class="vp-ai-source-chip" target="_blank" title="${s.title}">
                  <span>${s.title}</span>
                  <span class="vp-ai-score">${Math.round(s.score * 100)}%</span>
                </a>
              `,
              )
              .join("");
          }
        },
        onDelta: (text) => {
          accumulated += text;
          if (answerBody) {
            answerBody.innerHTML =
              renderAiMarkdown(accumulated) + '<span class="vp-ai-cursor"></span>';
          }
        },
        onDone: () => {
          if (statusEl) statusEl.textContent = "解答推导完毕";
          const cursor = answerBody?.querySelector(".vp-ai-cursor");
          if (cursor) cursor.remove();
        },
        onError: (err) => {
          if (statusEl) statusEl.textContent = "服务异常";
          if (answerBody) {
            answerBody.innerHTML = `<span style="color: var(--vp-c-danger-1, #b9423b);">${err.message || "请求失败"}</span>`;
          }
        },
      },
      activeLocalSearchAbort.signal,
    );
  } catch (err: any) {
    if (err.name !== "AbortError") {
      if (statusEl) statusEl.textContent = "请求失败";
      if (answerBody) {
        answerBody.innerHTML = `<span style="color: var(--vp-c-danger-1, #b9423b);">无法连接到 AI 服务，请检查网络或 API 配置。</span>`;
      }
    }
  } finally {
    activeLocalSearchAbort = null;
  }
};

onMounted(() => {
  setupVitePressSearchEnhancement();

  // 支持 URL 参数 ?q=... 自动开启提问
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    if (qParam && (props.mode === "embedded" || window.location.pathname.includes("ai-search"))) {
      query.value = qParam;
      nextTick(() => {
        executeSearch();
      });
    }
  }
});

onBeforeUnmount(() => {
  if (searchObserver) {
    searchObserver.disconnect();
    searchObserver = null;
  }
  if (activeLocalSearchAbort) {
    activeLocalSearchAbort.abort();
    activeLocalSearchAbort = null;
  }
});

// 暴露全局触发器
if (typeof window !== "undefined") {
  (window as any).__OPEN_AI_SEARCH__ = openModal;
}
</script>

<template>
  <div class="cc-ai-search-root">
    <!-- 1. 全局温润浮窗按钮 (右下角常驻，与 BackToTop 保持 100% 严谨一致的 44px 圆形 Warm Neo-Minimalism 风格) -->
    <button
      v-if="mode !== 'embedded'"
      class="cc-ai-floating-btn"
      type="button"
      aria-label="高考物理 AI 知识库智能问答"
      title="高考物理 AI 智能问答 (双轨检索与文献溯源)"
      @click="openModal()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    </button>

    <!-- 2. AI 智能问答工作台 (独立弹窗或嵌入页面模式) -->
    <Teleport to="body" :disabled="mode === 'embedded'">
      <Transition name="neo-fade">
        <div
          v-if="isOpen || mode === 'embedded'"
          class="neo-ai-backdrop"
          :class="{ 'is-embedded': mode === 'embedded' }"
          @click.self="closeModal"
        >
          <div class="neo-ai-panel">
            <!-- 面板顶栏 -->
            <div class="neo-ai-header">
              <div class="neo-ai-title-wrap">
                <div class="neo-ai-badges-row">
                  <span class="neo-ai-badge" :class="{ 'is-custom': config.enabled }">
                    {{
                      config.enabled
                        ? `自定义大模型: ${config.model}`
                        : "Cloudflare 边缘向量检索 (Vectorize)"
                    }}
                  </span>
                  <button
                    type="button"
                    class="neo-ai-config-toggle"
                    :class="{ 'is-active': showConfigPanel, 'is-custom': config.enabled }"
                    title="自定义大模型 API 接口配置 (DeepSeek, OpenAI, Claude, 本地 Ollama)"
                    @click="showConfigPanel = !showConfigPanel"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path
                        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.46.49.82.93 1H21a2 2 0 0 1 0 4h-.09c-.47.18-.82.54-1.51 1Z"
                      ></path>
                    </svg>
                    <span>{{ showConfigPanel ? "收起设置" : "自定义 API" }}</span>
                  </button>
                </div>
                <h2 class="neo-ai-heading">高考物理知识库 · 双轨流式问答</h2>
                <p class="neo-ai-sub">
                  {{
                    config.enabled
                      ? `已启用用户自选 ${config.model} 大模型，结合知识库精准文献进行严密物理推导`
                      : "毫秒级向量召回 (Vectorize) + 边缘大模型严格防幻觉推导 (LaTeX 深度排版)"
                  }}
                </p>
              </div>
              <button
                v-if="mode !== 'embedded'"
                class="neo-ai-close"
                type="button"
                aria-label="关闭问答"
                title="关闭 (Esc)"
                @click="closeModal"
              >
                ✕
              </button>
            </div>

            <!-- 自定义 API 抽屉设置面板 -->
            <Transition name="neo-slide">
              <div v-if="showConfigPanel" class="neo-ai-config-drawer">
                <div class="config-drawer-top">
                  <div class="drawer-title-box">
                    <span class="drawer-title">自定义大模型与 API 接口</span>
                    <span class="drawer-subtitle">
                      纯本地浏览器存储 (localStorage)，API Key 绝不上报
                    </span>
                  </div>
                  <label class="config-toggle-switch">
                    <span class="switch-label-text">{{
                      config.enabled ? "已启用自定义 API" : "默认边缘网关"
                    }}</span>
                    <input
                      type="checkbox"
                      :checked="config.enabled"
                      @change="
                        updateAiApiConfig({
                          enabled: ($event.target as HTMLInputElement).checked,
                        })
                      "
                    />
                    <span class="switch-slider"></span>
                  </label>
                </div>

                <!-- 预设快速填入 -->
                <div class="config-presets-group">
                  <span class="preset-label-text">快速预设:</span>
                  <button
                    v-for="p in AI_API_PRESETS"
                    :key="p.id"
                    type="button"
                    class="preset-select-chip"
                    :class="{ 'is-selected': isPresetSelected(p) }"
                    @click="applyPreset(p)"
                  >
                    <span>{{ p.name }}</span>
                    <span v-if="p.badge" class="preset-chip-badge">{{ p.badge }}</span>
                  </button>
                </div>

                <!-- 详细参数表单 -->
                <div v-if="config.enabled" class="config-form-grid">
                  <div class="config-form-item">
                    <label class="item-label">接口协议</label>
                    <select
                      class="item-select"
                      :value="config.protocol"
                      @change="
                        updateAiApiConfig({
                          protocol: ($event.target as HTMLSelectElement).value as any,
                        })
                      "
                    >
                      <option value="openai">
                        OpenAI 兼容协议 (DeepSeek, GPT, Ollama, 硅基流动等)
                      </option>
                      <option value="anthropic">Anthropic 协议 (Claude 3.5 Sonnet 等)</option>
                      <option value="worker">Cloudflare 边缘原生 Worker SSE</option>
                    </select>
                  </div>

                  <div class="config-form-item">
                    <label class="item-label">接口端点 (Endpoint URL)</label>
                    <input
                      type="text"
                      class="item-input"
                      :value="config.endpoint"
                      placeholder="例如: https://api.deepseek.com/v1/chat/completions"
                      @input="
                        updateAiApiConfig({
                          endpoint: ($event.target as HTMLInputElement).value.trim(),
                        })
                      "
                    />
                  </div>

                  <div class="config-form-item">
                    <label class="item-label">API 密钥 (API Key)</label>
                    <div class="input-password-box">
                      <input
                        :type="showApiKey ? 'text' : 'password'"
                        class="item-input"
                        :value="config.apiKey"
                        placeholder="输入您的私有 API Key (例如 sk-...)"
                        @input="
                          updateAiApiConfig({
                            apiKey: ($event.target as HTMLInputElement).value.trim(),
                          })
                        "
                      />
                      <button
                        type="button"
                        class="btn-pwd-eye"
                        :title="showApiKey ? '隐藏密钥' : '明文显示'"
                        @click="showApiKey = !showApiKey"
                      >
                        {{ showApiKey ? "隐" : "显" }}
                      </button>
                    </div>
                  </div>

                  <div class="config-form-item">
                    <label class="item-label">模型标识 (Model)</label>
                    <input
                      type="text"
                      class="item-input"
                      :value="config.model"
                      placeholder="例如: deepseek-chat, gpt-4o-mini, claude-3-5-sonnet-20241022"
                      @input="
                        updateAiApiConfig({
                          model: ($event.target as HTMLInputElement).value.trim(),
                        })
                      "
                    />
                  </div>

                  <div
                    class="config-advanced-toggle"
                    @click="showAdvancedConfig = !showAdvancedConfig"
                  >
                    <span>{{
                      showAdvancedConfig
                        ? "▼ 收起高级设置 (温度与系统提示词)"
                        : "▶ 展开高级设置 (温度与系统提示词)"
                    }}</span>
                  </div>

                  <div v-if="showAdvancedConfig" class="config-advanced-panel">
                    <div class="config-form-item">
                      <div class="label-with-val">
                        <label class="item-label">生成温度 (Temperature)</label>
                        <span class="range-val">{{ config.temperature ?? 0.3 }}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        class="item-range"
                        :value="config.temperature ?? 0.3"
                        @input="
                          updateAiApiConfig({
                            temperature: parseFloat(($event.target as HTMLInputElement).value),
                          })
                        "
                      />
                    </div>

                    <div class="config-form-item">
                      <div class="label-with-val">
                        <label class="item-label">自定义系统提示词 (强制 LaTeX 输出约束)</label>
                        <button
                          type="button"
                          class="btn-reset-prompt"
                          title="重置为知识库标准提示词"
                          @click="updateAiApiConfig({ systemPrompt: DEFAULT_AI_SYSTEM_PROMPT })"
                        >
                          重置提示词
                        </button>
                      </div>
                      <textarea
                        class="item-textarea"
                        rows="4"
                        :value="config.systemPrompt"
                        placeholder="输入系统提示词 System Prompt..."
                        @input="
                          updateAiApiConfig({
                            systemPrompt: ($event.target as HTMLTextAreaElement).value,
                          })
                        "
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- 底部操作与连通性测试 -->
                <div class="config-drawer-bottom">
                  <div
                    v-if="testState"
                    class="test-status-pill"
                    :class="{ 'is-ok': testState.success, 'is-fail': !testState.success }"
                  >
                    <span v-if="testState.testing" class="neo-spinner"></span>
                    <span>{{ testState.message }}</span>
                  </div>
                  <div class="btn-actions-group">
                    <button
                      type="button"
                      class="btn-config-test"
                      :disabled="testState?.testing"
                      @click="runConnectionTest"
                    >
                      {{ testState?.testing ? "测试中..." : "测试连接" }}
                    </button>
                    <button type="button" class="btn-config-reset" @click="resetAiApiConfig">
                      恢复默认
                    </button>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- 搜索提问栏 -->
            <div class="neo-ai-input-box">
              <span class="input-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                v-model="query"
                type="text"
                class="neo-input"
                placeholder="输入物理问题（例如：电池电动势内阻的测量实验原理、伏安法内外接误差）..."
                @keydown.enter="executeSearch"
              />
              <button
                class="neo-btn-ask"
                :disabled="isSearching || !query.trim()"
                @click="executeSearch"
              >
                <span v-if="isSearching" class="neo-spinner"></span>
                <span>{{ isSearching ? "思考中" : "提问" }}</span>
              </button>
            </div>

            <!-- 推荐高频问题 -->
            <div class="neo-ai-presets">
              <span class="preset-hint">推荐考点:</span>
              <button
                v-for="q in presetQuestions"
                :key="q"
                type="button"
                class="neo-preset-chip"
                @click="setQueryAndSearch(q)"
              >
                {{ q }}
              </button>
            </div>

            <!-- 状态信息条 -->
            <div class="neo-status-bar">
              <div class="status-indicator" :class="`state-${statusCode}`">
                <span class="indicator-dot"></span>
                <span>{{ statusText }}</span>
              </div>
              <span v-if="sources.length" class="sources-count">
                已匹配 {{ sources.length }} 个知识切片
              </span>
            </div>

            <!-- 异常警告 -->
            <div v-if="errorMessage" class="neo-error-alert">{{ errorMessage }}</div>

            <!-- 双轨内容区 -->
            <div class="neo-dual-track">
              <!-- 轨道 1：相关参考文档 -->
              <div class="track-card track-sources">
                <div class="track-caption">相关参考文档</div>
                <div v-if="sources.length === 0" class="track-placeholder">
                  {{ isSearching ? "正在检索 Vectorize 向量索引..." : "暂无参考文档" }}
                </div>
                <div v-else class="sources-list">
                  <a
                    v-for="(doc, idx) in sources"
                    :key="idx"
                    :href="doc.url || '#'"
                    class="source-anchor"
                    target="_blank"
                  >
                    <span class="source-name">{{ doc.title }}</span>
                    <div class="source-foot">
                      <span class="source-idx">参考 #{{ idx + 1 }}</span>
                      <span class="source-match"
                        >{{ Math.round((doc.score || 0) * 100) }}% 相似度</span
                      >
                    </div>
                  </a>
                </div>
              </div>

              <!-- 轨道 2：AI 智能流式总结 -->
              <div class="track-card track-summary">
                <div class="track-caption">AI 智能总结 (严格基于事实)</div>
                <div class="summary-container">
                  <div v-if="aiText" class="summary-prose" v-html="renderAiMarkdown(aiText)"></div>
                  <div v-else-if="isSearching" class="summary-placeholder">
                    <span class="neo-spinner"></span>
                    <span style="margin-left: 10px">物理知识库模型正在阅读文献并严密推导...</span>
                  </div>
                  <div v-else class="summary-empty">
                    输入物理考点或实验问题，AI 将严格基于 19
                    大体系物理笔记为您生成客观、无废话的解析。
                  </div>
                  <span v-if="isSearching" class="neo-cursor"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ------------------------------------------------------------
   Warm Neo-Minimalism 风格悬浮胶囊按钮
   ------------------------------------------------------------ */
.cc-ai-floating-btn {
  position: fixed;
  bottom: 78px;
  right: 24px;
  z-index: 50;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-border);
  box-shadow: var(--vp-shadow-card, 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.cc-ai-floating-btn:hover {
  transform: scale(1.05);
  color: var(--vp-c-brand-1);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 50%, var(--vp-c-border));
  box-shadow: var(--vp-shadow-3, 0 4px 16px rgba(0, 0, 0, 0.12));
}

.cc-ai-floating-btn:active {
  transform: scale(0.95);
}

.cc-ai-floating-btn svg {
  color: inherit;
}

@media (max-width: 768px) {
  .cc-ai-floating-btn {
    bottom: 72px;
    right: 16px;
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }
}

/* ------------------------------------------------------------
   Neo-Minimalism 模态遮罩与面板 (温润纸本白 / 深玄灰自适应)
   ------------------------------------------------------------ */
.neo-ai-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.neo-ai-backdrop.is-embedded {
  position: static;
  background: transparent;
  backdrop-filter: none;
  padding: 0;
  margin: 16px 0;
}

.neo-ai-panel {
  width: 100%;
  max-width: 880px;
  max-height: 86vh;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  box-shadow: var(--vp-shadow-5, 0 12px 28px rgba(0, 0, 0, 0.08));
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base);
}

.is-embedded .neo-ai-panel {
  max-height: none;
  box-shadow: var(--vp-shadow-card);
  background: var(--vp-c-bg-soft);
}

/* 顶栏 */
.neo-ai-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.neo-ai-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.neo-ai-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
  font-family: var(--vp-font-family-mono);
}

.neo-ai-badges-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.neo-ai-badge.is-custom {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.neo-ai-config-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.neo-ai-config-toggle:hover,
.neo-ai-config-toggle.is-active {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.neo-ai-config-drawer {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.config-drawer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.drawer-title-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.drawer-subtitle {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}

.config-toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.switch-label-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.config-toggle-switch input {
  display: none;
}

.switch-slider {
  position: relative;
  width: 38px;
  height: 20px;
  background-color: var(--vp-c-divider);
  border-radius: 9999px;
  transition: background-color 0.2s;
}

.switch-slider::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.config-toggle-switch input:checked + .switch-slider {
  background-color: var(--vp-c-brand-1);
}

.config-toggle-switch input:checked + .switch-slider::before {
  transform: translateX(18px);
}

.config-presets-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
}

.preset-label-text {
  color: var(--vp-c-text-3);
  font-size: 11.5px;
}

.preset-select-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-select-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.preset-select-chip.is-selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.preset-chip-badge {
  font-size: 9.5px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.config-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px 14px;
}

.config-form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--vp-c-text-3);
}

.item-input,
.item-select {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12.5px;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}

.item-input:focus,
.item-select:focus {
  border-color: var(--vp-c-brand-1);
}

.input-password-box {
  position: relative;
  display: flex;
  align-items: center;
}

.input-password-box .item-input {
  width: 100%;
  padding-right: 32px;
}

.btn-pwd-eye {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  opacity: 0.7;
}

.btn-pwd-eye:hover {
  opacity: 1;
}

.config-advanced-toggle {
  grid-column: 1 / -1;
  font-size: 11.5px;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  padding: 4px 0;
  user-select: none;
  font-weight: 500;
}

.config-advanced-toggle:hover {
  text-decoration: underline;
}

.config-advanced-panel {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--vp-c-bg);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  padding: 10px;
}

.label-with-val {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.range-val {
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.btn-reset-prompt {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.btn-reset-prompt:hover {
  color: var(--vp-c-brand-2);
}

.item-range {
  width: 100%;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}

.item-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
  line-height: 1.5;
  font-family: inherit;
  resize: vertical;
  outline: none;
}

.item-textarea:focus {
  border-color: var(--vp-c-brand-1);
}

.config-drawer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid var(--vp-c-divider);
}

.test-status-pill {
  font-size: 11.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-text-2);
}

.test-status-pill.is-ok {
  color: var(--vp-c-success-1, #10b981);
}

.test-status-pill.is-fail {
  color: var(--vp-c-danger-1, #b9423b);
}

.btn-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.btn-config-test,
.btn-config-reset {
  font-size: 11.5px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-config-test {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}

.btn-config-test:hover:not(:disabled) {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}

.btn-config-test:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-config-reset {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-3);
}

.btn-config-reset:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-3);
}

.neo-slide-enter-active,
.neo-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.neo-slide-enter-from,
.neo-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.neo-ai-heading {
  font-size: 19px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0;
  letter-spacing: -0.02em;
}

.neo-ai-sub {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  margin: 0;
}

.neo-ai-close {
  background: transparent;
  border: none;
  color: var(--vp-c-text-3);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.neo-ai-close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

/* 输入框 */
.neo-ai-input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  padding: 6px 8px 6px 14px;
  border-radius: 10px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.neo-ai-input-box:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.input-icon {
  color: var(--vp-c-text-3);
  display: flex;
}

.neo-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--vp-c-text-1);
  font-size: 15px;
  outline: none;
  font-family: inherit;
}

.neo-input::placeholder {
  color: var(--vp-c-text-3);
}

.neo-btn-ask {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition:
    background-color 0.15s,
    opacity 0.15s;
}

.neo-btn-ask:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.neo-btn-ask:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 预设考点标签 */
.neo-ai-presets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.preset-hint {
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.neo-preset-chip {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.neo-preset-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

/* 状态条 */
.neo-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 500;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.state-ready {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
}
.state-searching {
  background: var(--vp-c-warning-soft, rgba(194, 120, 3, 0.1));
  color: var(--vp-c-warning-1, #c27803);
}
.state-generating {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.state-done {
  background: var(--vp-c-success-soft, rgba(52, 211, 153, 0.1));
  color: var(--vp-c-success-1, #10b981);
}
.state-error {
  background: var(--vp-c-danger-soft, rgba(185, 66, 59, 0.1));
  color: var(--vp-c-danger-1, #b9423b);
}

.sources-count {
  color: var(--vp-c-text-3);
  font-size: 11.5px;
}

.neo-error-alert {
  background: var(--vp-c-danger-soft, rgba(185, 66, 59, 0.1));
  border: 1px solid var(--vp-c-danger-1, #b9423b);
  color: var(--vp-c-danger-1, #b9423b);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12.5px;
}

/* 双轨区域 */
.neo-dual-track {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  min-height: 280px;
}

@media (max-width: 768px) {
  .neo-dual-track {
    grid-template-columns: 1fr;
  }
}

.track-caption {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.track-card {
  display: flex;
  flex-direction: column;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-anchor {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 10px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.15s ease;
}

.source-anchor:hover {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-soft) 40%, var(--vp-c-bg-soft));
  transform: translateY(-1px);
}

.source-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.source-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.source-match {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
}

.track-placeholder,
.summary-empty {
  color: var(--vp-c-text-3);
  font-size: 13px;
  padding: 32px 16px;
  text-align: center;
}

.summary-container {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  padding: 16px;
  min-height: 240px;
  font-size: 14.5px;
  line-height: 1.8;
  color: var(--vp-c-text-1);
}

.summary-prose :deep(.ai-doc-h3) {
  color: var(--vp-c-brand-1);
  font-size: 15px;
  font-weight: 650;
  margin: 14px 0 6px;
}

.summary-prose :deep(.ai-doc-h4) {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
  margin: 10px 0 4px;
}

.summary-prose :deep(.ai-code) {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-brand-1);
}

.summary-prose :deep(strong) {
  color: var(--vp-c-brand-1);
  font-weight: 650;
}

.summary-prose :deep(ul),
.summary-prose :deep(ol) {
  padding-left: 20px;
  margin: 6px 0;
}

.summary-prose :deep(.ai-math-display) {
  margin: 12px 0;
  padding: 10px 14px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow-x: auto;
  text-align: center;
}

.summary-prose :deep(.ai-math-inline) {
  display: inline-block;
  vertical-align: baseline;
  margin: 0 2px;
}

.summary-prose :deep(.ai-code-block) {
  margin: 10px 0;
  padding: 10px 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow-x: auto;
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  line-height: 1.5;
}

.summary-prose :deep(.ai-blockquote) {
  margin: 8px 0;
  padding: 6px 12px;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  border-radius: 0 6px 6px 0;
  color: var(--vp-c-text-2);
}

.summary-prose :deep(.ai-doc-p) {
  margin: 6px 0;
}

.summary-prose :deep(.katex) {
  font-size: 1.05em;
  color: var(--vp-c-text-1);
}

.neo-cursor {
  display: inline-block;
  width: 6px;
  height: 15px;
  background-color: var(--vp-c-brand-1);
  vertical-align: text-bottom;
  margin-left: 3px;
  animation: neo-blink 0.8s infinite;
}

@keyframes neo-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.neo-spinner {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: neo-spin 0.6s linear infinite;
}

@keyframes neo-spin {
  to {
    transform: rotate(360deg);
  }
}

.neo-fade-enter-active,
.neo-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.neo-fade-enter-from,
.neo-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>

<!-- ------------------------------------------------------------
     全局注入到 VitePress 原生搜索弹窗 (.VPLocalSearchBox) 的温润设计
     ------------------------------------------------------------ -->
<style>
.vp-ai-neo-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 6px;
  font-family: var(--vp-font-family-base);
  transition: all 0.15s ease;
}

.vp-ai-neo-btn:hover {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.vp-modal-ai-card {
  margin: 10px 14px 4px;
  background: var(--vp-c-bg-soft);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, var(--vp-c-border));
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--vp-shadow-card);
  animation: neo-slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes neo-slide-down {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.vp-ai-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vp-ai-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vp-ai-pill {
  font-size: 11.5px;
  font-weight: 650;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 2px 8px;
  border-radius: 4px;
}

.vp-ai-status {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.vp-ai-card-close {
  background: transparent;
  border: none;
  color: var(--vp-c-text-3);
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.vp-ai-card-close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.vp-ai-sources-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.vp-ai-source-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-1);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.15s ease;
}

.vp-ai-source-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.vp-ai-score {
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
}

.vp-ai-answer-body {
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--vp-c-text-1);
  max-height: 280px;
  overflow-y: auto;
}

.vp-ai-answer-body strong {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.vp-ai-answer-body ul,
.vp-ai-answer-body ol {
  padding-left: 20px;
  margin: 6px 0;
}

.vp-ai-answer-body .ai-doc-h3 {
  font-size: 14px;
  color: var(--vp-c-brand-1);
  margin: 10px 0 4px;
  font-weight: 650;
}

.vp-ai-answer-body .ai-code {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
}

.vp-ai-answer-body .ai-math-display {
  margin: 10px 0;
  padding: 8px 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  overflow-x: auto;
  text-align: center;
}

.vp-ai-answer-body .ai-math-inline {
  display: inline-block;
  vertical-align: baseline;
  margin: 0 2px;
}

.vp-ai-answer-body .ai-code-block {
  margin: 8px 0;
  padding: 8px 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
}

.vp-ai-answer-body .katex {
  font-size: 1.05em;
}

.vp-ai-cursor {
  display: inline-block;
  width: 6px;
  height: 14px;
  background-color: var(--vp-c-brand-1);
  vertical-align: text-bottom;
  margin-left: 2px;
  animation: neo-blink 0.8s infinite;
}

.vp-ai-loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: neo-spin 0.6s linear infinite;
  vertical-align: middle;
}

/* 搜索栏下方快捷建议栏 */
.vp-ai-prompt-bar {
  margin: 8px 14px 2px;
  background: var(--vp-c-bg-soft);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 25%, var(--vp-c-border));
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.15s ease;
  animation: neo-slide-down 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.vp-ai-prompt-bar:hover {
  background: color-mix(in srgb, var(--vp-c-brand-soft) 40%, var(--vp-c-bg-soft));
  border-color: var(--vp-c-brand-1);
}

.vp-ai-prompt-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-ai-prompt-icon {
  color: var(--vp-c-brand-1);
  font-weight: bold;
}

.vp-ai-prompt-text strong {
  color: var(--vp-c-brand-1);
}

.vp-ai-prompt-btn {
  flex-shrink: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.vp-ai-prompt-bar:hover .vp-ai-prompt-btn {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}

.vp-ai-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vp-ai-fullscreen-link {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.vp-ai-fullscreen-link:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.vp-ai-kbd-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  color: var(--vp-c-brand-1);
  font-weight: 500;
}
</style>
