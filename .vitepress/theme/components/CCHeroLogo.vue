<script setup lang="ts">
import { ref, computed } from "vue";

const containerRef = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const rotateX = ref(0);
const rotateY = ref(0);
const sheenX = ref(50);
const sheenY = ref(50);
const isPressed = ref(false);

const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // 3D perspective rotation (max +/- 14 degrees)
  rotateY.value = Number(((x - centerX) / centerX * 14).toFixed(2));
  rotateX.value = Number(((centerY - y) / centerY * 14).toFixed(2));

  // Dynamic light sheen position in percent
  sheenX.value = Number((x / rect.width * 100).toFixed(1));
  sheenY.value = Number((y / rect.height * 100).toFixed(1));
};

const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
  rotateX.value = 0;
  rotateY.value = 0;
  sheenX.value = 35;
  sheenY.value = 25;
  isPressed.value = false;
};

const handleMouseDown = () => {
  isPressed.value = true;
};

const handleMouseUp = () => {
  isPressed.value = false;
};

const cardTransform = computed(() => {
  if (!isHovered.value) {
    return "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }
  const scale = isPressed.value ? 0.98 : 1.06;
  return `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale3d(${scale}, ${scale}, ${scale})`;
});
</script>

<template>
  <div
    ref="containerRef"
    class="cc-hero-logo-wrapper"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <div
      class="cc-hero-logo-card"
      :class="{ 'is-hovered': isHovered, 'is-pressed': isPressed }"
      :style="{ transform: cardTransform }"
    >
      <!-- Dynamic Interactive Liquid Specular Glare -->
      <div
        class="cc-glass-glare"
        :style="{
          background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.45) 0%, rgba(56, 189, 248, 0.2) 30%, transparent 65%)`
        }"
      />

      <!-- Embedded SVG with high-resolution vector fidelity -->
      <svg
        class="cc-hero-svg"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Liquid Glass Ambient Shadow -->
          <filter id="hero-glass-shadow" x="-15%" y="-15%" width="135%" height="140%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#090d16" flood-opacity="0.38" />
            <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0284c7" flood-opacity="0.25" />
          </filter>

          <!-- Neon Glow for Orbits -->
          <filter id="hero-neon-glow" x="-40%" y="-40%" width="180%" height="180%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="5.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Core Glow -->
          <filter id="hero-nucleus-glow" x="-60%" y="-60%" width="220%" height="220%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="9" result="blur1" />
            <feGaussianBlur stdDeviation="3" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="hero-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>

          <!-- Translucent Liquid Glass Fill -->
          <linearGradient id="hero-liquid-surface" x1="24" y1="24" x2="296" y2="296" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
            <stop offset="28%" stop-color="#f0f9ff" stop-opacity="0.24" />
            <stop offset="68%" stop-color="#e0e7ff" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#c7d2fe" stop-opacity="0.32" />
          </linearGradient>

          <!-- Chromatic Dispersion Edge -->
          <linearGradient id="hero-chromatic-rim" x1="24" y1="24" x2="296" y2="296" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
            <stop offset="18%" stop-color="#38bdf8" stop-opacity="0.9" />
            <stop offset="42%" stop-color="#818cf8" stop-opacity="0.8" />
            <stop offset="70%" stop-color="#c084fc" stop-opacity="0.85" />
            <stop offset="88%" stop-color="#f472b6" stop-opacity="0.75" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95" />
          </linearGradient>

          <linearGradient id="hero-inner-rim" x1="27" y1="27" x2="293" y2="293" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
            <stop offset="40%" stop-color="#ffffff" stop-opacity="0.15" />
            <stop offset="75%" stop-color="#38bdf8" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#818cf8" stop-opacity="0.5" />
          </linearGradient>

          <linearGradient id="hero-specular-lens" x1="35" y1="35" x2="160" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75" />
            <stop offset="45%" stop-color="#ffffff" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>

          <linearGradient id="hero-orbit-grad-1" x1="74" y1="130" x2="246" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#00f0ff" />
            <stop offset="60%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#2563eb" />
          </linearGradient>

          <linearGradient id="hero-orbit-grad-2" x1="80" y1="110" x2="240" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="50%" stop-color="#818cf8" />
            <stop offset="100%" stop-color="#c084fc" />
          </linearGradient>

          <linearGradient id="hero-orbit-grad-3" x1="240" y1="110" x2="80" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#f43f5e" />
            <stop offset="45%" stop-color="#c084fc" />
            <stop offset="100%" stop-color="#06b6d4" />
          </linearGradient>

          <radialGradient id="hero-nucleus-body" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="25%" stop-color="#67e8f9" />
            <stop offset="60%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#6366f1" />
          </radialGradient>

          <radialGradient id="hero-nucleus-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45" />
            <stop offset="55%" stop-color="#818cf8" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#c084fc" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Glass container -->
        <g class="cc-glass-base" filter="url(#hero-glass-shadow)">
          <rect x="24" y="24" width="272" height="272" rx="64" fill="url(#hero-liquid-surface)" />
          <rect x="24" y="24" width="272" height="272" rx="64" fill="none" stroke="url(#hero-chromatic-rim)" stroke-width="2.5" />
          <rect x="27" y="27" width="266" height="266" rx="61" fill="none" stroke="url(#hero-inner-rim)" stroke-width="1.2" />
          <path class="cc-specular-glide" d="M 48 110 C 48 60 68 40 110 40 C 170 40 210 65 145 110 C 90 148 48 140 48 110 Z" fill="url(#hero-specular-lens)" />
          <path d="M 80 26 C 120 25 200 25 240 26" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.95" filter="url(#hero-soft-blur)" />

          <!-- Ambient Halo -->
          <circle cx="160" cy="160" r="70" fill="url(#hero-nucleus-ambient)" />

          <!-- Orbit 1 -->
          <g class="cc-orbit-ring cc-orbit-1">
            <ellipse cx="160" cy="160" rx="86" ry="30" fill="none" stroke="url(#hero-orbit-grad-1)" stroke-width="6.5" stroke-opacity="0.65" filter="url(#hero-neon-glow)" />
            <ellipse cx="160" cy="160" rx="86" ry="30" fill="none" stroke="#f0f9ff" stroke-width="2" stroke-opacity="0.95" />
            <g class="cc-electron" filter="url(#hero-neon-glow)">
              <circle cx="246" cy="160" r="6.5" fill="#00f0ff" />
              <circle cx="246" cy="160" r="2.5" fill="#ffffff" />
            </g>
          </g>

          <!-- Orbit 2 -->
          <g class="cc-orbit-ring cc-orbit-2">
            <ellipse cx="160" cy="160" rx="86" ry="30" fill="none" stroke="url(#hero-orbit-grad-2)" stroke-width="6.5" stroke-opacity="0.65" filter="url(#hero-neon-glow)" />
            <ellipse cx="160" cy="160" rx="86" ry="30" fill="none" stroke="#f5f3ff" stroke-width="2" stroke-opacity="0.95" />
            <g class="cc-electron" filter="url(#hero-neon-glow)">
              <circle cx="246" cy="160" r="6.5" fill="#c084fc" />
              <circle cx="246" cy="160" r="2.5" fill="#ffffff" />
            </g>
          </g>

          <!-- Orbit 3 -->
          <g class="cc-orbit-ring cc-orbit-3">
            <ellipse cx="160" cy="160" rx="86" ry="30" fill="none" stroke="url(#hero-orbit-grad-3)" stroke-width="6.5" stroke-opacity="0.65" filter="url(#hero-neon-glow)" />
            <ellipse cx="160" cy="160" rx="86" ry="30" fill="none" stroke="#eff6ff" stroke-width="2" stroke-opacity="0.95" />
            <g class="cc-electron" filter="url(#hero-neon-glow)">
              <circle cx="246" cy="160" r="6.5" fill="#38bdf8" />
              <circle cx="246" cy="160" r="2.5" fill="#ffffff" />
            </g>
          </g>

          <!-- Central Nucleus -->
          <g class="cc-nucleus">
            <circle cx="160" cy="160" r="20" fill="none" stroke="url(#hero-chromatic-rim)" stroke-width="1.8" stroke-opacity="0.85" filter="url(#hero-nucleus-glow)" />
            <circle cx="160" cy="160" r="14" fill="url(#hero-nucleus-body)" filter="url(#hero-nucleus-glow)" />
            <ellipse cx="155.5" cy="155" rx="4.5" ry="2.5" transform="rotate(-30 155.5 155)" fill="#ffffff" opacity="0.95" />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.cc-hero-logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  perspective: 1000px;
  user-select: none;
  cursor: pointer;
}

.cc-hero-logo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 64px;
  transform-style: preserve-3d;
  transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

.cc-hero-logo-card.is-hovered {
  transition: transform 0.08s ease-out;
}

.cc-glass-glare {
  position: absolute;
  inset: 0;
  border-radius: 64px;
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 10;
}

.cc-hero-logo-card.is-hovered .cc-glass-glare {
  opacity: 1;
}

.cc-hero-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  display: block;
}

/* Animations */
.cc-orbit-ring {
  transform-origin: 160px 160px;
  transition: stroke-width 0.3s ease;
}

.cc-orbit-1 {
  animation: orbit-spin-1 18s linear infinite;
}
.cc-orbit-2 {
  animation: orbit-spin-2 24s linear infinite reverse;
}
.cc-orbit-3 {
  animation: orbit-spin-3 20s linear infinite;
}

.cc-hero-logo-card.is-hovered .cc-orbit-1 {
  animation-duration: 4.5s;
}
.cc-hero-logo-card.is-hovered .cc-orbit-2 {
  animation-duration: 5.5s;
}
.cc-hero-logo-card.is-hovered .cc-orbit-3 {
  animation-duration: 5s;
}

.cc-nucleus {
  transform-origin: 160px 160px;
  animation: nucleus-beat 3.6s ease-in-out infinite;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cc-hero-logo-card.is-hovered .cc-nucleus {
  transform: scale(1.22);
}

.cc-specular-glide {
  transform-origin: 160px 160px;
  animation: sweep-glide 6s ease-in-out infinite;
}

.cc-electron {
  transition: filter 0.3s ease;
}

.cc-hero-logo-card.is-hovered .cc-electron {
  filter: drop-shadow(0 0 10px #ffffff);
}

@keyframes orbit-spin-1 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes orbit-spin-2 {
  from { transform: rotate(60deg); }
  to { transform: rotate(420deg); }
}
@keyframes orbit-spin-3 {
  from { transform: rotate(120deg); }
  to { transform: rotate(480deg); }
}

@keyframes nucleus-beat {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6));
  }
  50% {
    transform: scale(1.14);
    filter: drop-shadow(0 0 18px rgba(129, 140, 248, 0.9));
  }
}

@keyframes sweep-glide {
  0%, 100% {
    opacity: 0.75;
    transform: translate(0, 0);
  }
  50% {
    opacity: 0.95;
    transform: translate(3px, 3px);
  }
}

@media (max-width: 640px) {
  .cc-hero-logo-wrapper {
    max-width: 240px;
  }
}
</style>
