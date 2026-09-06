<script setup lang="ts">
import { ref, computed } from "vue";

const el = ref<HTMLElement>();
const flipped = ref(false);
const hover = ref(false);
const rx = ref(0);
const ry = ref(0);

function onMove(e: MouseEvent) {
  if (!el.value) return;
  const r = el.value.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  ry.value = +(x * 12).toFixed(1);
  rx.value = +(-y * 12).toFixed(1);
}

function onEnter() { hover.value = true; }
function onLeave() {
  hover.value = false;
  rx.value = 0;
  ry.value = 0;
}

function onClick() { flipped.value = !flipped.value; }

const tiltStyle = computed(() => {
  const base = flipped.value ? 180 : 0;
  return {
    transform: `rotateX(${rx.value}deg) rotateY(${base + ry.value}deg)`,
  };
});
</script>

<template>
  <div
    ref="el"
    class="flip-wrap"
    @mousemove="onMove"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="onClick"
  >
    <div
      class="flip-card"
      :class="{ active: hover }"
      :style="tiltStyle"
    >
      <!-- ====== FRONT: Notebook + Atom ====== -->
      <div class="face front">
        <svg viewBox="0 0 330 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Back page (blue, tilted) -->
          <rect y="29.6" width="285.6" height="352" rx="18" transform="rotate(-5.75 0 29.6)" fill="#546ec6"/>
          <!-- Front page -->
          <g filter="url(#f-shadow)">
            <rect x="45.5" y="10" width="274" height="352" rx="18" fill="white"/>
            <rect x="45.5" y="10" width="274" height="352" rx="18" fill="url(#f-lines)"/>
            <!-- Bohr Atom -->
            <ellipse cx="182" cy="165" rx="55" ry="19" stroke="#546ec6" stroke-width="3" fill="none"/>
            <ellipse cx="182" cy="165" rx="55" ry="19" stroke="#546ec6" stroke-width="3" fill="none" transform="rotate(60 182 165)"/>
            <ellipse cx="182" cy="165" rx="55" ry="19" stroke="#546ec6" stroke-width="3" fill="none" transform="rotate(120 182 165)"/>
            <circle cx="182" cy="165" r="10" fill="#546ec6"/>
            <circle cx="237" cy="165" r="5" fill="#546ec6"/>
            <circle cx="154.5" cy="117.3" r="5" fill="#546ec6"/>
            <circle cx="154.5" cy="212.7" r="5" fill="#546ec6"/>
            <path d="M97.5 271H267" stroke="#546ec6" stroke-width="11" stroke-linecap="round"/>
          </g>
          <defs>
            <filter id="f-shadow" x="35.5" y="0" width="294" height="372" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="bg"/>
              <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="a"/>
              <feOffset/><feGaussianBlur stdDeviation="5"/>
              <feComposite in2="a" operator="out"/>
              <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend in2="bg" result="s"/><feBlend in="SourceGraphic" in2="s"/>
            </filter>
            <pattern id="f-lines" patternUnits="userSpaceOnUse" patternTransform="matrix(1370 0 0 40 45.5 182)" preserveAspectRatio="none" viewBox="0 0 1370 40" width="1" height="1">
              <rect width="274" height="8" fill="#d1d1d1" fill-opacity="0.37"/>
            </pattern>
          </defs>
        </svg>
      </div>

      <!-- ====== BACK: Easter Egg ====== -->
      <div class="face back">
        <svg viewBox="0 0 330 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Back page (blue, tilted) -->
          <rect y="29.6" width="285.6" height="352" rx="18" transform="rotate(-5.75 0 29.6)" fill="#3b52a5"/>
          <!-- Card face -->
          <g filter="url(#b-shadow)">
            <rect x="45.5" y="10" width="274" height="352" rx="18" fill="#546ec6"/>
            <!-- Stars -->
            <circle cx="100" cy="60" r="2" fill="white" opacity="0.6"/>
            <circle cx="260" cy="90" r="1.5" fill="white" opacity="0.5"/>
            <circle cx="80" cy="280" r="1.8" fill="white" opacity="0.4"/>
            <circle cx="290" cy="300" r="2" fill="white" opacity="0.5"/>
            <circle cx="130" cy="320" r="1.5" fill="white" opacity="0.3"/>
            <circle cx="250" cy="50" r="1.2" fill="white" opacity="0.4"/>
            <circle cx="300" cy="200" r="1.8" fill="white" opacity="0.35"/>
            <circle cx="70" cy="150" r="1.5" fill="white" opacity="0.45"/>
            <!-- E = mc² -->
            <text x="182" y="155" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-style="italic" fill="white" opacity="0.95">E = mc²</text>
            <!-- Sparkle lines around equation -->
            <line x1="110" y1="115" x2="118" y2="123" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            <line x1="114" y1="119" x2="114" y2="119" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            <line x1="252" y1="118" x2="244" y2="126" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            <!-- Small apple (Newton easter egg) -->
            <circle cx="182" cy="215" r="12" fill="#ef4444" opacity="0.85"/>
            <path d="M182 203 Q185 196 189 199" stroke="#22c55e" stroke-width="2" fill="none" stroke-linecap="round"/>
            <ellipse cx="179" cy="212" rx="2" ry="1.5" fill="white" opacity="0.5"/>
            <!-- Arrow pointing down (gravity!) -->
            <line x1="182" y1="232" x2="182" y2="252" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <path d="M176 246 L182 254 L188 246" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
            <!-- Fun text -->
            <text x="182" y="290" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="white" opacity="0.75">🎉 发现彩蛋！</text>
            <text x="182" y="315" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="white" opacity="0.5">— 万有引力不是苹果的错</text>
          </g>
          <defs>
            <filter id="b-shadow" x="35.5" y="0" width="294" height="372" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="bg"/>
              <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="a"/>
              <feOffset/><feGaussianBlur stdDeviation="5"/>
              <feComposite in2="a" operator="out"/>
              <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend in2="bg" result="s"/><feBlend in="SourceGraphic" in2="s"/>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flip-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  perspective: 900px;
  cursor: pointer;
  user-select: none;
}

.flip-card {
  position: relative;
  width: 100%;
  aspect-ratio: 330 / 380;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  will-change: transform;
}

/* When hovered, tilt follows cursor more responsively */
.flip-card.active {
  transition: transform 0.1s ease-out;
}

.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.face svg {
  display: block;
  width: 100%;
  height: 100%;
}

.back {
  transform: rotateY(180deg);
}

/* Hover glow */
.flip-card.active .front svg,
.flip-card.active .back svg {
  filter: drop-shadow(0 0 20px rgba(84, 110, 198, 0.3));
}

@media (max-width: 640px) {
  .flip-wrap { max-width: 240px; }
}
</style>
