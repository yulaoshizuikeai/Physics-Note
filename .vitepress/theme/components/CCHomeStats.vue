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
/* Stats wrap: 32px (4×8dp) gap below action buttons */
.cc-stats-wrap {
  margin-top: 32px;
  width: 100%;
}

/* Stats pill bar */
.cc-stats-inner {
  display: flex;
  align-items: stretch;
  gap: 0;
  max-width: 592px;  /* 22 cols × 8dp + gutters — aligns with tagline max-width */
  width: 100%;
  background: color-mix(in srgb, var(--vp-c-brand-1) 4.5%, var(--vp-c-bg-soft));
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-radius: 16px;  /* 2×8dp */
  overflow: hidden;
}

.cc-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;    /* 2×8dp vertical, minimal horizontal */
  gap: 4px;             /* 4dp between number and label */
  position: relative;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

/* Divider between cells */
.cc-stat-item + .cc-stat-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 25%;
  height: 50%;
  width: 1px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent);
}

.cc-stat-item:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}

/* Number: display-small — 24px / 800 weight */
.cc-stat-number {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
}

.cc-stat-unit {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  vertical-align: baseline;
}

/* Label: label-small — 11.5px / 500 weight */
.cc-stat-label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  letter-spacing: 0.015em;
}

/* Dark mode */
.dark .cc-stats-inner {
  background: color-mix(in srgb, var(--vp-c-brand-1) 7%, var(--vp-c-bg-soft));
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent);
}

/* Mobile: 2×2 grid */
@media (max-width: 640px) {
  .cc-stats-inner {
    flex-wrap: wrap;
    border-radius: 12px;
    max-width: 100%;
  }

  .cc-stat-item {
    flex: 1 1 calc(50% - 1px);
    padding: 14px 6px;
    gap: 3px;
  }

  /* Wrap-start: remove left divider for 3rd item */
  .cc-stat-item:nth-child(3)::before {
    display: none;
  }

  /* Top divider for 2nd row */
  .cc-stat-item:nth-child(3),
  .cc-stat-item:nth-child(4) {
    border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  }

  .cc-stat-number {
    font-size: 20px;
  }

  .cc-stat-label {
    font-size: 10.5px;
  }
}
</style>
