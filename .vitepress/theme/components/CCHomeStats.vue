<template>
  <div class="cc-stats-wrap" aria-label="知识库数据概览">
    <div class="cc-stats-inner">
      <div
        v-for="(stat, i) in stats"
        :key="i"
        class="cc-stat-item"
      >
        <span class="cc-stat-number" :aria-label="stat.number + stat.unit">
          {{ stat.number }}<span class="cc-stat-unit">{{ stat.unit }}</span>
        </span>
        <span class="cc-stat-label">{{ stat.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const stats = [
  { number: "19", unit: "", label: "大考试专题" },
  { number: "100", unit: "+", label: "幅矢量 SVG 图解" },
  { number: "50", unit: "", label: "大黄金结论" },
  { number: "6", unit: "", label: "个交互动态仿真" },
] as const;
</script>

<style scoped>
.cc-stats-wrap {
  margin-top: 28px;
  width: 100%;
}

.cc-stats-inner {
  display: flex;
  align-items: stretch;
  gap: 0;
  max-width: 640px;
  width: 100%;
  background: color-mix(in srgb, var(--vp-c-brand-1) 4%, var(--vp-c-bg-soft));
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent);
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cc-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 8px;
  gap: 3px;
  position: relative;
  transition: background-color 0.2s ease;
}

.cc-stat-item + .cc-stat-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
}

.cc-stat-item:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 7%, transparent);
}

.cc-stat-number {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.025em;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
}

.cc-stat-unit {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.cc-stat-label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  letter-spacing: 0.01em;
}

/* Dark mode */
.dark .cc-stats-inner {
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, var(--vp-c-bg-soft));
}

/* Mobile: compact layout */
@media (max-width: 640px) {
  .cc-stats-inner {
    flex-wrap: wrap;
    border-radius: 12px;
  }

  .cc-stat-item {
    flex: 1 1 calc(50% - 1px);
    padding: 12px 6px;
  }

  /* Remove left divider for the 3rd item (new row start) */
  .cc-stat-item:nth-child(3)::before {
    display: none;
  }

  /* Add top divider for 3rd and 4th items */
  .cc-stat-item:nth-child(3),
  .cc-stat-item:nth-child(4) {
    border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent);
  }

  .cc-stat-number {
    font-size: 20px;
  }

  .cc-stat-label {
    font-size: 11px;
  }
}
</style>
