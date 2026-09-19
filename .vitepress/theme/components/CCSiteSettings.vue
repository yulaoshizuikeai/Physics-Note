<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from "vue";

import type { SiteFontFamily } from "../composables/useSiteSettings";

import {
  useAiApiConfig,
  AI_API_PRESETS,
  DEFAULT_AI_SYSTEM_PROMPT,
  type AiApiPreset,
} from "../composables/useAiApiConfig";
import { useSiteSettings } from "../composables/useSiteSettings";

const props = defineProps<{
  screenMenu?: boolean;
  embedded?: boolean;
  defaultTab?: "display" | "ai";
}>();

const { settings, updateSiteSettings, resetSiteSettings } = useSiteSettings();
const { config, updateAiApiConfig, resetAiApiConfig, testAiApiConnection } = useAiApiConfig();

const isOpen = shallowRef(props.embedded || false);
const activeTab = shallowRef<"display" | "ai">(
  props.defaultTab || (props.embedded ? "ai" : "display"),
);
const dialogRef = useTemplateRef<HTMLDivElement>("dialog");
const showApiKey = shallowRef(false);
const showAdvancedConfig = shallowRef(false);
const testState = shallowRef<{ testing: boolean; message: string; success?: boolean } | null>(null);

const openDialog = async () => {
  if (props.embedded) return;
  isOpen.value = true;
  if (typeof document !== "undefined") document.body.classList.add("cc-settings-modal-open");
  await nextTick();
  dialogRef.value?.focus();
};

const closeDialog = () => {
  if (props.embedded) return;
  isOpen.value = false;
  if (typeof document !== "undefined") document.body.classList.remove("cc-settings-modal-open");
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) closeDialog();
};

const updateBooleanSetting = (
  key: "showContributors" | "showOutline" | "showComments",
  event: Event,
) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  updateSiteSettings(key, target.checked);
};

const updateFontFamily = (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  updateSiteSettings("fontFamily", target.value as SiteFontFamily);
};

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

const handleReset = () => {
  if (activeTab.value === "display") {
    resetSiteSettings();
  } else {
    resetAiApiConfig();
  }
};

onMounted(() => {
  if (typeof window !== "undefined") window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  if (typeof document !== "undefined") document.body.classList.remove("cc-settings-modal-open");
  if (typeof window !== "undefined") window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <button
    v-if="!embedded"
    class="cc-settings-trigger"
    :class="{ 'cc-settings-trigger--screen': screenMenu }"
    type="button"
    aria-label="打开站点与 AI 配置"
    title="偏好与 AI 接口配置"
    @click="openDialog"
  >
    <svg class="cc-settings-trigger__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.46.49.82.93 1H21a2 2 0 0 1 0 4h-.09c-.47.18-.82.54-1.51 1Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span v-if="screenMenu" class="cc-settings-trigger__label">偏好设置</span>
  </button>

  <Teleport to="body" :disabled="embedded">
    <div
      v-if="isOpen || embedded"
      class="cc-settings-modal"
      :class="{ 'is-embedded': embedded }"
      @click.self="closeDialog"
    >
      <div
        ref="dialog"
        class="cc-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-settings-title"
        tabindex="-1"
      >
        <!-- 头部：分栏切换与关闭按钮 -->
        <header class="cc-settings-dialog__header">
          <div class="cc-tabs-bar">
            <button
              type="button"
              class="cc-tab-item"
              :class="{ 'is-active': activeTab === 'display' }"
              @click="activeTab = 'display'"
            >
              界面显示
            </button>
            <button
              type="button"
              class="cc-tab-item"
              :class="{ 'is-active': activeTab === 'ai' }"
              @click="activeTab = 'ai'"
            >
              AI 模型与接口
              <span v-if="config.enabled" class="cc-tab-dot"></span>
            </button>
          </div>
          <button
            v-if="!embedded"
            class="cc-settings-dialog__close"
            type="button"
            aria-label="关闭偏好配置"
            title="关闭"
            @click="closeDialog"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M18 6 6 18M6 6l12 12"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        <div class="cc-settings-dialog__body">
          <!-- 标签页 1：界面显示 -->
          <div v-if="activeTab === 'display'" class="cc-tab-pane">
            <label class="cc-settings-option">
              <span class="cc-settings-option__text">显示「贡献者名单」</span>
              <span class="cc-switch">
                <input
                  class="cc-switch__input"
                  type="checkbox"
                  :checked="settings.showContributors"
                  @change="updateBooleanSetting('showContributors', $event)"
                />
                <span class="cc-switch__track">
                  <span class="cc-switch__thumb"></span>
                </span>
              </span>
            </label>

            <label class="cc-settings-option">
              <span class="cc-settings-option__text">显示「右侧大纲」</span>
              <span class="cc-switch">
                <input
                  class="cc-switch__input"
                  type="checkbox"
                  :checked="settings.showOutline"
                  @change="updateBooleanSetting('showOutline', $event)"
                />
                <span class="cc-switch__track">
                  <span class="cc-switch__thumb"></span>
                </span>
              </span>
            </label>

            <label class="cc-settings-option">
              <span class="cc-settings-option__text">显示「评论区」</span>
              <span class="cc-switch">
                <input
                  class="cc-switch__input"
                  type="checkbox"
                  :checked="settings.showComments"
                  @change="updateBooleanSetting('showComments', $event)"
                />
                <span class="cc-switch__track">
                  <span class="cc-switch__thumb"></span>
                </span>
              </span>
            </label>

            <label class="cc-settings-select">
              <span class="cc-settings-select__label">字体样式</span>
              <select
                class="cc-settings-select__control"
                :value="settings.fontFamily"
                @change="updateFontFamily"
              >
                <option value="default">默认无衬线</option>
                <option value="serif">优雅衬线体</option>
              </select>
            </label>
          </div>

          <!-- 标签页 2：AI 模型与接口配置 -->
          <div v-else-if="activeTab === 'ai'" class="cc-tab-pane cc-ai-pane">
            <label class="cc-settings-option cc-ai-master-toggle">
              <div class="cc-option-info">
                <span class="cc-settings-option__text">启用自定义 API 接口</span>
                <span class="cc-option-desc"
                  >接入私有 OpenAI 兼容通用 (OAI 格式 / NVIDIA NIM / OneAPI / DeepSeek) 或 Claude
                  等</span
                >
              </div>
              <span class="cc-switch">
                <input
                  class="cc-switch__input"
                  type="checkbox"
                  :checked="config.enabled"
                  @change="
                    updateAiApiConfig({
                      enabled: ($event.target as HTMLInputElement).checked,
                    })
                  "
                />
                <span class="cc-switch__track">
                  <span class="cc-switch__thumb"></span>
                </span>
              </span>
            </label>

            <!-- 快捷预设按钮组 -->
            <div class="cc-presets-box">
              <span class="cc-section-caption">快速预设模型提供商:</span>
              <div class="cc-preset-chips-list">
                <button
                  v-for="p in AI_API_PRESETS"
                  :key="p.id"
                  type="button"
                  class="cc-preset-btn"
                  :class="{ 'is-selected': isPresetSelected(p) }"
                  @click="applyPreset(p)"
                >
                  <span>{{ p.name }}</span>
                  <span v-if="p.badge" class="cc-preset-tag">{{ p.badge }}</span>
                </button>
              </div>
            </div>

            <!-- 自定义表单（仅在启用自定义 API 时展示） -->
            <div v-if="config.enabled" class="cc-ai-fields">
              <div class="cc-form-group">
                <label class="cc-form-label">接口协议 (Protocol)</label>
                <select
                  class="cc-form-control"
                  :value="config.protocol"
                  @change="
                    updateAiApiConfig({
                      protocol: ($event.target as HTMLSelectElement).value as any,
                    })
                  "
                >
                  <option value="openai">
                    OpenAI 兼容通用协议 (OAI 规范 / NVIDIA NIM / OneAPI / DeepSeek / 官方)
                  </option>
                  <option value="anthropic">Anthropic 协议 (Claude 3.5 Sonnet 等)</option>
                  <option value="worker">Cloudflare 边缘原生 Worker SSE</option>
                </select>
              </div>

              <div class="cc-form-group">
                <label class="cc-form-label">接口端点 (Endpoint URL)</label>
                <input
                  type="text"
                  class="cc-form-control"
                  :value="config.endpoint"
                  placeholder="例如: https://api.openai.com/v1 或 https://integrate.api.nvidia.com/v1"
                  @input="
                    updateAiApiConfig({
                      endpoint: ($event.target as HTMLInputElement).value.trim(),
                    })
                  "
                />
                <span class="cc-form-hint"
                  >OAI 格式兼容：支持 Base URL (如 https://.../v1) 或完整端点，自动智能补全
                  /chat/completions</span
                >
              </div>

              <div class="cc-form-group">
                <label class="cc-form-label">API 密钥 (API Key)</label>
                <div class="cc-password-box">
                  <input
                    :type="showApiKey ? 'text' : 'password'"
                    class="cc-form-control cc-password-input"
                    :value="config.apiKey"
                    placeholder="输入您的私有 API Key (例如 sk-... 或 nvapi-...)"
                    @input="
                      updateAiApiConfig({
                        apiKey: ($event.target as HTMLInputElement).value.trim(),
                      })
                    "
                  />
                  <button
                    type="button"
                    class="cc-btn-eye"
                    :title="showApiKey ? '隐藏密钥' : '显示明文'"
                    @click="showApiKey = !showApiKey"
                  >
                    {{ showApiKey ? "隐" : "显" }}
                  </button>
                </div>
                <span class="cc-form-hint">安全保障：密钥仅存放于浏览器本地 localStorage</span>
              </div>

              <div class="cc-form-group">
                <label class="cc-form-label">模型标识 (Model Name)</label>
                <input
                  type="text"
                  class="cc-form-control"
                  :value="config.model"
                  placeholder="例如: gpt-4o-mini, meta/llama-3.3-70b-instruct, deepseek-chat"
                  @input="
                    updateAiApiConfig({
                      model: ($event.target as HTMLInputElement).value.trim(),
                    })
                  "
                />
              </div>

              <div class="cc-advanced-toggle" @click="showAdvancedConfig = !showAdvancedConfig">
                <span>{{
                  showAdvancedConfig
                    ? "▼ 收起高级设置 (生成温度与系统提示词)"
                    : "▶ 展开高级设置 (生成温度与系统提示词)"
                }}</span>
              </div>

              <div v-if="showAdvancedConfig" class="cc-advanced-panel">
                <div class="cc-form-group">
                  <div class="cc-label-with-val">
                    <label class="cc-form-label">生成温度 (Temperature)</label>
                    <span class="cc-val-badge">{{ config.temperature ?? 0.3 }}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    class="cc-range-input"
                    :value="config.temperature ?? 0.3"
                    @input="
                      updateAiApiConfig({
                        temperature: parseFloat(($event.target as HTMLInputElement).value),
                      })
                    "
                  />
                </div>

                <div class="cc-form-group">
                  <div class="cc-label-with-val">
                    <label class="cc-form-label">自定义系统提示词 (强制 LaTeX 输出约束)</label>
                    <button
                      type="button"
                      class="cc-btn-link"
                      @click="updateAiApiConfig({ systemPrompt: DEFAULT_AI_SYSTEM_PROMPT })"
                    >
                      恢复默认提示词
                    </button>
                  </div>
                  <textarea
                    class="cc-form-control cc-textarea"
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

            <!-- 连接连通性测试 -->
            <div class="cc-test-row">
              <div
                v-if="testState"
                class="cc-test-status"
                :class="{ 'is-ok': testState.success, 'is-fail': !testState.success }"
              >
                <span v-if="testState.testing" class="cc-inline-spinner"></span>
                <span>{{ testState.message }}</span>
              </div>
              <button
                type="button"
                class="cc-test-button"
                :disabled="testState?.testing"
                @click="runConnectionTest"
              >
                {{ testState?.testing ? "测试中..." : "测试连接" }}
              </button>
            </div>
          </div>
        </div>

        <footer class="cc-settings-dialog__footer">
          <button class="cc-settings-reset" type="button" @click="handleReset">
            {{ activeTab === "ai" ? "重置为默认模型" : "恢复默认" }}
          </button>
          <button v-if="!embedded" class="cc-settings-done" type="button" @click="closeDialog">
            完成
          </button>
          <span v-else class="cc-saved-hint">✓ 配置已实时持久化保存至本地</span>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cc-settings-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: var(--vp-nav-height);
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.cc-settings-trigger:hover {
  color: var(--vp-c-brand-1);
}

.cc-settings-trigger--screen {
  justify-content: flex-start;
  width: 100%;
  height: 40px;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.cc-settings-trigger__icon {
  width: 18px;
  height: 18px;
}

.cc-settings-trigger__label {
  font-size: 14px;
  font-weight: 600;
}

.cc-settings-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);
}

.cc-settings-dialog {
  width: min(520px, 100%);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: var(--vp-shadow-4);
  color: var(--vp-c-text-1);
  outline: none;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.cc-settings-dialog__header,
.cc-settings-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
}

.cc-settings-dialog__header {
  border-bottom: 1px solid var(--vp-c-divider);
}

.cc-settings-dialog__footer {
  border-top: 1px solid var(--vp-c-divider);
}

/* 分栏选项卡 */
.cc-tabs-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--vp-c-bg-alt);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.cc-tab-item {
  position: relative;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cc-tab-item.is-active {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.cc-tab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
}

.cc-settings-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--vp-c-text-2);
  transition: all 0.15s ease;
}

.cc-settings-dialog__close:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.cc-settings-dialog__close svg {
  width: 18px;
  height: 18px;
}

.cc-settings-dialog__body {
  padding: 18px;
  overflow-y: auto;
}

.cc-tab-pane {
  display: grid;
  gap: 14px;
}

.cc-settings-option,
.cc-settings-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
  cursor: pointer;
}

.cc-settings-option__text,
.cc-settings-select__label {
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.4;
}

.cc-option-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cc-option-desc {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}

.cc-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 26px;
  cursor: pointer;
  flex-shrink: 0;
}

.cc-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.cc-switch__track {
  position: relative;
  display: block;
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  background-color: var(--vp-c-divider);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.cc-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.cc-switch__input:checked + .cc-switch__track {
  background-color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.cc-switch__input:checked + .cc-switch__track .cc-switch__thumb {
  transform: translateX(20px);
}

.cc-settings-select__control {
  min-width: 120px;
  height: 38px;
  padding: 0 24px 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 13.5px;
}

/* AI 配置面板样式 */
.cc-presets-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.cc-section-caption {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cc-preset-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cc-preset-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cc-preset-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.cc-preset-btn.is-selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.cc-preset-tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.cc-ai-fields {
  display: grid;
  gap: 12px;
}

.cc-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cc-form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.cc-form-control {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}

.cc-form-control:focus {
  border-color: var(--vp-c-brand-1);
}

.cc-password-box {
  position: relative;
  display: flex;
  align-items: center;
}

.cc-password-input {
  padding-right: 36px;
}

.cc-btn-eye {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
  opacity: 0.7;
}

.cc-btn-eye:hover {
  opacity: 1;
}

.cc-form-hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.cc-test-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--vp-c-divider);
}

.cc-test-status {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-text-2);
}

.cc-test-status.is-ok {
  color: var(--vp-c-success-1, #10b981);
}

.cc-test-status.is-fail {
  color: var(--vp-c-danger-1, #b9423b);
}

.cc-test-button {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  cursor: pointer;
  transition: all 0.15s;
}

.cc-test-button:hover:not(:disabled) {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}

.cc-test-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cc-inline-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: cc-spin 0.6s linear infinite;
}

@keyframes cc-spin {
  to {
    transform: rotate(360deg);
  }
}

.cc-settings-reset,
.cc-settings-done {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 40px;
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.cc-settings-reset {
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}

.cc-settings-done {
  color: var(--vp-button-brand-text);
  background: var(--vp-button-brand-bg);
}

.cc-settings-reset:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-2);
}

.cc-saved-hint {
  font-size: 12.5px;
  color: var(--vp-c-success-1, #10b981);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.cc-advanced-toggle {
  font-size: 12px;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  padding: 4px 0;
  user-select: none;
  font-weight: 500;
}

.cc-advanced-toggle:hover {
  text-decoration: underline;
}

.cc-advanced-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--vp-c-bg-alt);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
}

.cc-label-with-val {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cc-val-badge {
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.cc-btn-link {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  font-size: 11.5px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.cc-btn-link:hover {
  color: var(--vp-c-brand-2);
}

.cc-range-input {
  width: 100%;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}

.cc-textarea {
  height: auto;
  min-height: 80px;
  padding: 8px 12px;
  resize: vertical;
  line-height: 1.5;
}

/* 嵌入页面模式 (全屏偏好设置页支持) */
.cc-settings-modal.is-embedded {
  position: static;
  inset: auto;
  z-index: auto;
  display: block;
  padding: 0;
  background: transparent;
}

.cc-settings-modal.is-embedded .cc-settings-dialog {
  width: 100%;
  max-width: 100%;
  max-height: none;
  box-shadow: none;
  border: 1px solid var(--vp-c-divider);
}

@media (max-width: 640px) {
  .cc-settings-modal {
    align-items: flex-end;
    padding: 12px;
  }
}
</style>
