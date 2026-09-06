<script setup lang="ts">
import { ref, computed } from "vue";

const el = ref<HTMLElement>();
const hover = ref(false);
const rx = ref(0);
const ry = ref(0);

function onMove(e: MouseEvent) {
  if (!el.value) return;
  const r = el.value.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  ry.value = +(x * 16).toFixed(1);
  rx.value = +(-y * 16).toFixed(1);
}

function onEnter() { hover.value = true; }
function onLeave() {
  hover.value = false;
  rx.value = 0;
  ry.value = 0;
}

const tilt = computed(() =>
  `perspective(600px) rotateX(${rx.value}deg) rotateY(${ry.value}deg)`
);
</script>

<template>
  <div
    ref="el"
    class="atom-wrap"
    @mousemove="onMove"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div class="atom-card" :class="{ active: hover }" :style="{ transform: tilt }">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Orbit 1: 0° -->
        <g class="orbit o1">
          <ellipse cx="100" cy="100" rx="65" ry="22"
            stroke="currentColor" stroke-width="1.2" class="orbit-line"/>
          <circle cx="165" cy="100" r="3.5" class="electron e-blue"/>
          <circle cx="165" cy="100" r="1.5" fill="#fff" opacity="0.9"/>
        </g>
        <!-- Orbit 2: 60° -->
        <g class="orbit o2" transform="rotate(60 100 100)">
          <ellipse cx="100" cy="100" rx="65" ry="22"
            stroke="currentColor" stroke-width="1.2" class="orbit-line"/>
          <circle cx="165" cy="100" r="3.5" class="electron e-purple"/>
          <circle cx="165" cy="100" r="1.5" fill="#fff" opacity="0.9"/>
        </g>
        <!-- Orbit 3: 120° -->
        <g class="orbit o3" transform="rotate(120 100 100)">
          <ellipse cx="100" cy="100" rx="65" ry="22"
            stroke="currentColor" stroke-width="1.2" class="orbit-line"/>
          <circle cx="165" cy="100" r="3.5" class="electron e-cyan"/>
          <circle cx="165" cy="100" r="1.5" fill="#fff" opacity="0.9"/>
        </g>
        <!-- Nucleus -->
        <circle cx="100" cy="100" r="7" class="nucleus"/>
        <circle cx="98" cy="98" r="2.5" fill="#ffffff" opacity="0.8"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.atom-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  cursor: pointer;
  user-select: none;
}

.atom-card {
  width: 100%;
  aspect-ratio: 1;
  transform-style: preserve-3d;
  /* Smooth return when mouse leaves */
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

/* When hovered, tilt follows cursor instantly */
.atom-card.active {
  transition: transform 0.08s ease-out;
}

.atom-card svg {
  display: block;
  width: 100%;
  height: 100%;
  color: #94a3b8;
  transition: color 0.4s ease, filter 0.4s ease;
}

.atom-card.active svg {
  color: #60a5fa;
  filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.35));
}

/* ---- Orbits: always spinning at constant speed ---- */
.orbit {
  transform-origin: 100px 100px;
}
.o1 { animation: spin 18s linear infinite; }
.o2 { animation: spin 24s linear infinite reverse; }
.o3 { animation: spin 20s linear infinite; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---- Orbit lines ---- */
.orbit-line {
  fill: none;
  stroke-opacity: 0.45;
  transition: stroke-opacity 0.4s ease, stroke-width 0.4s ease;
}

.atom-card.active .orbit-line {
  stroke-opacity: 0.75;
  stroke-width: 1.6;
}

/* ---- Electrons ---- */
.e-blue   { fill: #60a5fa; }
.e-purple { fill: #a78bfa; }
.e-cyan   { fill: #38bdf8; }

.electron {
  transition: r 0.4s ease, filter 0.4s ease;
  r: 3.5;
}

.atom-card.active .electron {
  r: 4.5;
  filter: drop-shadow(0 0 6px currentColor);
}

.atom-card.active .e-blue   { filter: drop-shadow(0 0 6px #60a5fa); }
.atom-card.active .e-purple { filter: drop-shadow(0 0 6px #a78bfa); }
.atom-card.active .e-cyan   { filter: drop-shadow(0 0 6px #38bdf8); }

/* ---- Nucleus ---- */
.nucleus {
  fill: #3b82f6;
  transition: r 0.4s ease, filter 0.4s ease;
  r: 7;
}

.atom-card.active .nucleus {
  r: 8;
  fill: #60a5fa;
  filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.6));
}

@media (max-width: 640px) {
  .atom-wrap { max-width: 200px; }
}
</style>
