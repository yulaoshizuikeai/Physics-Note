<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";

const { page } = useData();

// 只有在文档页面才显示打印/导出按钮
const isDocPage = computed(() => (page.value.frontmatter?.layout ?? "doc") === "doc");

const handlePrint = () => {
  if (typeof window !== "undefined") {
    window.print();
  }
};
</script>

<template>
  <div class="CCPdfDownloadButton">
    <button
      v-if="isDocPage"
      type="button"
      class="CCPdfDownloadButtonBtn"
      title="通过浏览器原生打印功能另存为 A4 矢量 PDF"
      @click="handlePrint"
    >
      <span class="CCPdfDownloadButtonBtnLabel">打印 / 导出本页</span>
      <span class="CCPdfDownloadButtonBtnHint">PDF</span>
    </button>
  </div>
</template>

<style scoped>
.CCPdfDownloadButton {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.CCPdfDownloadButtonBtn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  transition:
    border-color 0.25s,
    background-color 0.25s,
    color 0.25s;
  cursor: pointer;
  font-family: inherit;
}

.CCPdfDownloadButtonBtn:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft-hover);
  color: var(--vp-c-text-1);
}

.CCPdfDownloadButtonBtnLabel {
  font-weight: 600;
}

.CCPdfDownloadButtonBtnHint {
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-bg-elv) 70%, transparent);
}

@media (max-width: 640px) {
  .CCPdfDownloadButton {
    width: 100%;
  }

  .CCPdfDownloadButtonBtn {
    justify-content: center;
    flex: 1 1 100%;
    min-width: 0;
  }
}
</style>
