<script setup lang="ts">
import { onMounted } from "vue";

// 隐式增加浏览量（静默统计，零数字展示）
onMounted(() => {
  if (typeof window === "undefined") return;
  const existing = document.getElementById("cc-busuanzi-script");
  if (existing) existing.remove();
  const script = document.createElement("script");
  script.id = "cc-busuanzi-script";
  script.src = "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
  script.referrerPolicy = "no-referrer-when-downgrade";
  script.async = true;
  document.head.appendChild(script);
});
</script>

<template>
  <div class="hero-sparkline-wrap" aria-hidden="true">
    <div class="hero-sparkline-card">
      <svg
        class="sparkline-svg"
        viewBox="0 0 240 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- 面积渐变 -->
          <linearGradient id="sparkline-area" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#5672CD" stop-opacity="0.32" />
            <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
          </linearGradient>

          <!-- 折线流光渐变 -->
          <linearGradient id="sparkline-stroke" x1="0" y1="20" x2="240" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#5672CD" stop-opacity="0.6" />
            <stop offset="45%" stop-color="#38bdf8" />
            <stop offset="85%" stop-color="#818cf8" />
            <stop offset="100%" stop-color="#60a5fa" />
          </linearGradient>

          <!-- 辉光滤镜 -->
          <filter id="sparkline-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- 阴影/面积填充 -->
        <path
          d="M 4 36 C 28 35, 42 39, 68 28 C 94 17, 112 30, 138 20 C 164 10, 184 22, 208 12 C 224 5, 232 7, 236 4 L 236 44 L 4 44 Z"
          fill="url(#sparkline-area)"
          class="sparkline-fill"
        />

        <!-- 高级感平滑折线 -->
        <path
          d="M 4 36 C 28 35, 42 39, 68 28 C 94 17, 112 30, 138 20 C 164 10, 184 22, 208 12 C 224 5, 232 7, 236 4"
          stroke="url(#sparkline-stroke)"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="sparkline-line"
          filter="url(#sparkline-glow)"
        />

        <!-- 终点脉冲发光光子粒子 (零数字，纯视觉律动) -->
        <circle cx="236" cy="4" r="7" fill="#38bdf8" opacity="0.25" class="beacon-halo" />
        <circle cx="236" cy="4" r="3.2" fill="#ffffff" class="beacon-dot" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.hero-sparkline-wrap {
  display: flex;
  align-items: center;
  margin-top: 24px;
}

.hero-sparkline-card {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: color-mix(in srgb, var(--vp-c-brand-1, #5672CD) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1, #5672CD) 16%, transparent);
  border-radius: 9999px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px -6px rgba(86, 114, 205, 0.15);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.hero-sparkline-card:hover {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--vp-c-brand-1, #5672CD) 9%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1, #5672CD) 32%, transparent);
  box-shadow: 0 8px 28px -4px rgba(86, 114, 205, 0.28);
}

.sparkline-svg {
  width: 220px;
  height: 40px;
  display: block;
}

.sparkline-line {
  stroke-dasharray: 450;
  stroke-dashoffset: 450;
  animation: sparkline-draw 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.sparkline-fill {
  opacity: 0;
  animation: sparkline-fade 1.2s ease-out 0.8s forwards;
}

.beacon-halo {
  animation: beacon-pulse 2.2s ease-in-out infinite;
  transform-origin: 236px 4px;
}

.beacon-dot {
  filter: drop-shadow(0 0 4px #38bdf8);
}

@keyframes sparkline-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes sparkline-fade {
  to {
    opacity: 1;
  }
}

@keyframes beacon-pulse {
  0%, 100% {
    transform: scale(0.85);
    opacity: 0.15;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.45;
  }
}

@media (max-width: 640px) {
  .hero-sparkline-wrap {
    justify-content: center;
    margin-top: 20px;
  }
  .sparkline-svg {
    width: 190px;
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sparkline-line,
  .sparkline-fill,
  .beacon-halo {
    animation: none;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}
</style>
