<script setup lang="ts">
import { ref, computed } from "vue";

const containerRef = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const rotateX = ref(0);
const rotateY = ref(0);

const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  rotateY.value = +((x - cx) / cx * 12).toFixed(2);
  rotateX.value = +((cy - y) / cy * 12).toFixed(2);
};

const handleMouseEnter = () => { isHovered.value = true; };
const handleMouseLeave = () => {
  isHovered.value = false;
  rotateX.value = 0;
  rotateY.value = 0;
};

const cardStyle = computed(() => ({
  transform: isHovered.value
    ? `perspective(800px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(1.04)`
    : "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
}));
</script>

<template>
  <div
    ref="containerRef"
    class="hero-logo"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="hero-logo-card" :class="{ hovered: isHovered }" :style="cardStyle">
      <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="h-shadow" x="-20%" y="-15%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#1e3a5f" flood-opacity="0.25"/>
          </filter>
          <filter id="h-core-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="h-orbit-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="2"/>
          </filter>
          <linearGradient id="h-glass" x1="40" y1="40" x2="280" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#dbeafe" stop-opacity="0.7"/>
            <stop offset="40%" stop-color="#93c5fd" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#bfdbfe" stop-opacity="0.5"/>
          </linearGradient>
          <linearGradient id="h-border" x1="40" y1="40" x2="280" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.8"/>
            <stop offset="40%" stop-color="#a5b4fc" stop-opacity="0.7"/>
            <stop offset="80%" stop-color="#f0abfc" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#93c5fd" stop-opacity="0.8"/>
          </linearGradient>
          <linearGradient id="h-spec" x1="60" y1="50" x2="170" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
            <stop offset="60%" stop-color="#ffffff" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
          </linearGradient>
          <radialGradient id="h-nuc" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#7dd3fc"/>
            <stop offset="70%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#2563eb"/>
          </radialGradient>
          <radialGradient id="h-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Glass -->
        <g filter="url(#h-shadow)">
          <rect x="40" y="40" width="240" height="240" rx="56" fill="url(#h-glass)"/>
          <rect x="40" y="40" width="240" height="240" rx="56" fill="none" stroke="url(#h-border)" stroke-width="1.8"/>
          <path d="M 72 120 C 72 76 88 60 120 60 C 170 60 196 78 148 112 C 104 142 72 138 72 120 Z" fill="url(#h-spec)"/>
        </g>

        <!-- Halo -->
        <circle cx="160" cy="160" r="40" fill="url(#h-halo)"/>

        <!-- Orbit 1: 0° -->
        <g class="orb orb-1">
          <ellipse cx="160" cy="160" rx="80" ry="28" fill="none" stroke="#60a5fa" stroke-width="3" stroke-opacity="0.3" filter="url(#h-orbit-glow)"/>
          <ellipse cx="160" cy="160" rx="80" ry="28" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.85"/>
          <circle cx="240" cy="160" r="4" fill="#60a5fa"/><circle cx="240" cy="160" r="1.8" fill="#fff"/>
        </g>

        <!-- Orbit 2: 60° -->
        <g class="orb orb-2" transform="rotate(60 160 160)">
          <ellipse cx="160" cy="160" rx="80" ry="28" fill="none" stroke="#c084fc" stroke-width="3" stroke-opacity="0.3" filter="url(#h-orbit-glow)"/>
          <ellipse cx="160" cy="160" rx="80" ry="28" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.75"/>
          <circle cx="240" cy="160" r="4" fill="#c084fc"/><circle cx="240" cy="160" r="1.8" fill="#fff"/>
        </g>

        <!-- Orbit 3: 120° -->
        <g class="orb orb-3" transform="rotate(120 160 160)">
          <ellipse cx="160" cy="160" rx="80" ry="28" fill="none" stroke="#38bdf8" stroke-width="3" stroke-opacity="0.3" filter="url(#h-orbit-glow)"/>
          <ellipse cx="160" cy="160" rx="80" ry="28" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.75"/>
          <circle cx="240" cy="160" r="4" fill="#38bdf8"/><circle cx="240" cy="160" r="1.8" fill="#fff"/>
        </g>

        <!-- Nucleus -->
        <g class="nuc">
          <circle cx="160" cy="160" r="16" fill="url(#h-nuc)" filter="url(#h-core-glow)"/>
          <ellipse cx="156" cy="156" rx="4" ry="2.5" transform="rotate(-25 156 156)" fill="#fff" opacity="0.9"/>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.hero-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  cursor: pointer;
  user-select: none;
}

.hero-logo-card {
  width: 100%;
  aspect-ratio: 1;
  transform-style: preserve-3d;
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

.hero-logo-card.hovered {
  transition: transform 0.06s ease-out;
}

.hero-logo-card svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Orbit animations */
.orb { transform-origin: 160px 160px; }
.orb-1 { animation: spin 12s linear infinite; }
.orb-2 { animation: spin 16s linear infinite; }
.orb-3 { animation: spin 14s linear infinite reverse; }

.nuc { transform-origin: 160px 160px; animation: breathe 3s ease-in-out infinite; }

.hero-logo-card.hovered .orb-1 { animation-duration: 3s; }
.hero-logo-card.hovered .orb-2 { animation-duration: 4s; }
.hero-logo-card.hovered .orb-3 { animation-duration: 3.5s; }
.hero-logo-card.hovered .nuc   { animation-duration: 1.5s; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@media (max-width: 640px) {
  .hero-logo { max-width: 240px; }
}
</style>
