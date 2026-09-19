<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";

const props = defineProps<{
  mode?: "floating" | "embedded";
}>();

const WORKER_ENDPOINT = "https://physics-knowledge-search.harlan0804.workers.dev/api/search";

// 弹窗状态与数据
const isOpen = ref(props.mode === "embedded");
const query = ref("");
const isSearching = ref(false);
const sources = ref<Array<{ title: string; url: string; score: number }>>([]);
const aiText = ref("");
const statusText = ref("等待提问");
const statusCode = ref<"ready" | "searching" | "generating" | "done" | "error">("ready");
const errorMessage = ref("");
let abortController: AbortController | null = null;

// 预设高频高考物理问题
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

const formatMarkdown = (text: string) => {
  if (!text) return "";
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 标题
  html = html.replace(/^###\s+(.+)$/gm, "<h4 class='ai-h4'>$1</h4>");
  html = html.replace(/^##\s+(.+)$/gm, "<h3 class='ai-h3'>$1</h3>");
  // 加粗
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // 行内代码
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // 列表
  html = html.replace(/^\*\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  return html;
};

// 执行双轨搜索与问答
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
  statusText.value = "正在检索知识库 (Vectorize)...";

  abortController = new AbortController();

  try {
    const res = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
      signal: abortController.signal,
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
          sources.value = parsedData.sources || [];
          statusCode.value = "generating";
          statusText.value = sources.value.length
            ? `已召回 ${sources.value.length} 篇相关文档，AI 总结中...`
            : "知识库中未检索到高相关内容";
        } else if (eventType === "delta") {
          if (parsedData.text) {
            aiText.value += parsedData.text;
          }
        } else if (eventType === "done") {
          statusCode.value = "done";
          statusText.value = "解答完成";
        } else if (eventType === "error") {
          statusCode.value = "error";
          statusText.value = "服务异常";
          errorMessage.value = parsedData.message || "请求发生错误";
        }
      }
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      statusText.value = "已取消";
    } else {
      statusCode.value = "error";
      statusText.value = "请求失败";
      errorMessage.value = err.message || "网络异常，请重试";
    }
  } finally {
    isSearching.value = false;
    abortController = null;
  }
};

// -------------------------------------------------------------
// 深度融合：拦截与增强 VitePress 原生搜索弹窗 (.VPLocalSearchBox)
// -------------------------------------------------------------
let observer: MutationObserver | null = null;

const setupVitePressSearchIntegration = () => {
  if (typeof window === "undefined") return;

  observer = new MutationObserver(() => {
    const searchModal = document.querySelector(".VPLocalSearchBox");
    if (!searchModal) return;

    const shell = searchModal.querySelector(".shell");
    const searchBar = searchModal.querySelector(".search-bar");
    const searchInput = searchModal.querySelector<HTMLInputElement>("#localsearch-input");
    const actions = searchModal.querySelector(".search-actions");

    if (!shell || !searchBar || !searchInput || !actions) return;

    // 1. 在 search-actions 中注入“🤖 问 AI”快捷按钮（避免重复注入）
    if (!actions.querySelector(".vp-ai-search-btn")) {
      const aiBtn = document.createElement("button");
      aiBtn.type = "button";
      aiBtn.className = "vp-ai-search-btn";
      aiBtn.title = "唤起 AI 智能问答系统";
      aiBtn.innerHTML = `<span>⚡ 问 AI</span>`;
      aiBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentQ = searchInput.value.trim();
        openModal(currentQ);
      };
      actions.prepend(aiBtn);
    }

    // 2. 在 search-bar 下方注入快捷 AI 提示横幅
    if (!shell.querySelector(".vp-ai-banner")) {
      const banner = document.createElement("div");
      banner.className = "vp-ai-banner";
      banner.innerHTML = `
        <div class="vp-ai-banner-content">
          <span class="ai-sparkle">✨</span>
          <span class="ai-hint">需要深度概念推导或实验原理解答？</span>
          <button class="ai-banner-action">点击让 AI 解答</button>
        </div>
      `;
      banner.querySelector(".ai-banner-action")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(searchInput.value.trim());
      });
      // 插入到 searchBar 后面
      searchBar.insertAdjacentElement("afterend", banner);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

onMounted(() => {
  setupVitePressSearchIntegration();
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

// 暴露全局触发方法供导航或其他组件使用
if (typeof window !== "undefined") {
  (window as any).__OPEN_AI_SEARCH__ = openModal;
}
</script>

<template>
  <div>
    <!-- 1. 全局悬浮触发按钮 (仅在非嵌入模式下展示) -->
    <button
      v-if="mode !== 'embedded'"
      class="ai-floating-trigger"
      title="高考物理 AI 智能问答 (Cloudflare 双轨检索)"
      @click="openModal()"
    >
      <span class="trigger-icon">⚡</span>
      <span class="trigger-text">AI 问答</span>
    </button>

    <!-- 2. AI 问答弹窗 (或者全屏/嵌入模式卡片) -->
    <Teleport to="body" :disabled="mode === 'embedded'">
      <div
        v-if="isOpen || mode === 'embedded'"
        class="ai-search-overlay"
        :class="{ 'is-embedded': mode === 'embedded' }"
        @click.self="closeModal"
      >
        <div class="ai-modal-card">
          <!-- 头部 -->
          <div class="ai-modal-header">
            <div class="ai-brand">
              <span class="ai-chip">Cloudflare Edge AI</span>
              <h2 class="ai-title">高考物理知识库 · 双轨流式问答</h2>
            </div>
            <button
              v-if="mode !== 'embedded'"
              class="ai-close-btn"
              title="关闭"
              @click="closeModal"
            >
              ✕
            </button>
          </div>

          <!-- 输入区 -->
          <div class="ai-input-wrap">
            <input
              v-model="query"
              type="text"
              class="ai-search-input"
              placeholder="输入物理问题（如：伏安法测电阻为什么区分内接法和外接法、电池电动势测定原理）..."
              @keydown.enter="executeSearch"
            />
            <button
              class="ai-submit-btn"
              :disabled="isSearching || !query.trim()"
              @click="executeSearch"
            >
              <span v-if="isSearching" class="ai-spinner"></span>
              <span>{{ isSearching ? "生成中" : "提问" }}</span>
            </button>
          </div>

          <!-- 推荐问题标签 -->
          <div class="ai-preset-list">
            <span class="preset-title">💡 推荐考点:</span>
            <button
              v-for="q in presetQuestions"
              :key="q"
              class="ai-preset-tag"
              @click="setQueryAndSearch(q)"
            >
              {{ q }}
            </button>
          </div>

          <!-- 状态提示栏 -->
          <div class="ai-status-row">
            <div class="ai-status-badge" :class="`status-${statusCode}`">
              <span class="status-dot"></span>
              <span>{{ statusText }}</span>
            </div>
            <span v-if="sources.length" class="ai-meta-info">
              召回 {{ sources.length }} 条向量切片
            </span>
          </div>

          <!-- 错误提醒 -->
          <div v-if="errorMessage" class="ai-error-box">⚠️ {{ errorMessage }}</div>

          <!-- 双轨结果展示区 -->
          <div class="ai-body-grid">
            <!-- 轨道 1：相关参考文档 -->
            <div class="ai-track-sources">
              <div class="track-header">⚡ 相关参考文档</div>
              <div v-if="sources.length === 0" class="track-empty">
                {{ isSearching ? "正在检索向量库..." : "暂无召回参考文档" }}
              </div>
              <div v-else class="sources-cards">
                <a
                  v-for="(doc, idx) in sources"
                  :key="idx"
                  :href="doc.url || '#'"
                  class="source-item"
                  target="_blank"
                >
                  <div class="source-item-title">{{ doc.title }}</div>
                  <div class="source-item-footer">
                    <span>#{{ idx + 1 }}</span>
                    <span class="score-pill">
                      {{ Math.round((doc.score || 0) * 100) }}% 相似度
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <!-- 轨道 2：AI 智能流式总结 -->
            <div class="ai-track-answer">
              <div class="track-header">🤖 AI 智能总结 (Llama 3.1 8B)</div>
              <div class="answer-box">
                <div v-if="aiText" class="answer-markdown" v-html="formatMarkdown(aiText)"></div>
                <div v-else-if="isSearching" class="answer-placeholder">
                  <span class="ai-spinner"></span>
                  <span style="margin-left: 8px">AI 正在研读参考文档并组织思路...</span>
                </div>
                <div v-else class="answer-empty">
                  输入物理问题后，大模型将严格基于知识库为您生成客观解答。
                </div>
                <span v-if="isSearching" class="typewriter-cursor"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* 悬浮按钮 */
.ai-floating-trigger {
  position: fixed;
  right: 24px;
  bottom: 84px;
  z-index: 99;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-floating-trigger:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}

/* 遮罩与弹窗 */
.ai-search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 29, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ai-search-overlay.is-embedded {
  position: static;
  background: transparent;
  backdrop-filter: none;
  padding: 0;
  margin-top: 24px;
}

.ai-modal-card {
  width: 100%;
  max-width: 860px;
  max-height: 88vh;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  color: #f1f5f9;
}

.is-embedded .ai-modal-card {
  max-height: none;
  box-shadow: none;
  background: rgba(15, 23, 42, 0.6);
}

.ai-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-chip {
  font-size: 11px;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 2px 8px;
  border-radius: 9999px;
  width: fit-content;
}

.ai-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
}

.ai-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.ai-close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* 输入栏 */
.ai-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 8px 6px 16px;
  border-radius: 12px;
}

.ai-input-wrap:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.ai-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 15px;
  outline: none;
}

.ai-submit-btn {
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ai-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 预设提问标签 */
.ai-preset-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.preset-title {
  color: #94a3b8;
}

.ai-preset-tag {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.ai-preset-tag:hover {
  border-color: #38bdf8;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

/* 状态 */
.ai-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.ai-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11.5px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-ready {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}
.status-searching {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}
.status-generating {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}
.status-done {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}
.status-error {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.ai-meta-info {
  color: #64748b;
}

.ai-error-box {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
}

/* 双轨网格 */
.ai-body-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  min-height: 280px;
}

@media (max-width: 768px) {
  .ai-body-grid {
    grid-template-columns: 1fr;
  }
}

.track-header {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
}

.sources-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-item {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.15s;
}

.source-item:hover {
  border-color: #38bdf8;
  background: rgba(30, 41, 59, 0.9);
}

.source-item-title {
  font-size: 12.5px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.4;
}

.source-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
}

.score-pill {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.track-empty,
.answer-empty {
  color: #64748b;
  font-size: 13px;
  padding: 24px 0;
  text-align: center;
}

.answer-box {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 16px;
  min-height: 240px;
  font-size: 14.5px;
  line-height: 1.7;
  color: #e2e8f0;
}

.answer-markdown :deep(.ai-h3) {
  color: #38bdf8;
  font-size: 15px;
  margin: 12px 0 6px;
}

.answer-markdown :deep(.ai-h4) {
  color: #818cf8;
  font-size: 14px;
  margin: 8px 0 4px;
}

.answer-markdown :deep(code) {
  background: rgba(15, 23, 42, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: #7dd3fc;
}

.typewriter-cursor {
  display: inline-block;
  width: 7px;
  height: 15px;
  background-color: #38bdf8;
  vertical-align: text-bottom;
  margin-left: 3px;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.ai-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<!-- 全局注入到 VitePress 搜索弹窗的样式 -->
<style>
.vp-ai-search-btn {
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: #ffffff;
  border: none;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 6px;
  transition: opacity 0.15s;
}

.vp-ai-search-btn:hover {
  opacity: 0.9;
}

.vp-ai-banner {
  margin: 8px 12px 0;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 8px;
  padding: 6px 12px;
}

.vp-ai-banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #cbd5e1;
}

.ai-sparkle {
  color: #38bdf8;
}

.ai-banner-action {
  margin-left: auto;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.ai-banner-action:hover {
  background: rgba(56, 189, 248, 0.25);
}
</style>
