<script setup lang="ts">
import { CCWaline } from "../waline";
</script>

<template>
  <main class="tomorrow-page">
    <article class="tomorrow-letter">
      <slot />
    </article>

    <section class="tomorrow-comments" aria-labelledby="tomorrow-comments-title">
      <h2 id="tomorrow-comments-title" class="tomorrow-comments-title">留言区</h2>
      <ClientOnly>
        <CCWaline
          placeholder="想对自己说点什么，就留在这里吧。不管你是即将站上考场的自己想对自己说的话，又或是对明年高考的自己的一点期望，就偷偷放在这边吧"
        />
      </ClientOnly>
    </section>
  </main>
</template>

<style scoped>
.tomorrow-page {
  --tomorrow-serif: "Songti SC", "Noto Serif CJK SC", "Noto Serif SC", STSong, serif;

  min-height: calc(100vh - var(--vp-nav-height));
  padding: clamp(44px, 8vw, 92px) 24px 76px;
  background: linear-gradient(
    180deg,
    var(--vp-c-bg) 0,
    rgb(248 250 252 / 0.9) 46%,
    var(--vp-c-bg) 100%
  );
  color: var(--vp-c-text-1);
}

.dark .tomorrow-page {
  background: linear-gradient(
    180deg,
    var(--vp-c-bg) 0,
    rgb(22 28 36 / 0.82) 48%,
    var(--vp-c-bg) 100%
  );
}

.tomorrow-letter {
  max-width: 720px;
  margin: 0 auto;
  animation: tomorrow-page-in 520ms ease-out both;
}

.tomorrow-letter :deep(h1) {
  margin: 0 0 clamp(28px, 5vw, 44px);
  border: 0;
  color: var(--vp-c-text-1);
  font-family: var(--tomorrow-serif);
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 500;
  line-height: 1.04;
  letter-spacing: 0;
  animation: tomorrow-title-in 680ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.tomorrow-letter :deep(p) {
  margin: 0;
  color: var(--vp-c-text-1);
  font-family: var(--tomorrow-serif);
  font-size: 1.2rem;
  line-height: 2.12;
  text-align: left;
  text-wrap: pretty;
  animation: tomorrow-content-in 620ms ease-out 120ms both;
}

.tomorrow-letter :deep(p + p) {
  margin-top: 0.9em;
}

.tomorrow-letter :deep(.tomorrow-author) {
  margin-bottom: 1.7rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
  font-size: 0.95rem;
  line-height: 1.7;
}

.tomorrow-letter :deep(hr) {
  transform-origin: left center;
  width: 64px;
  height: 1px;
  margin: clamp(34px, 6vw, 52px) 0;
  border: 0;
  background: var(--vp-c-text-3);
  animation: tomorrow-rule-in 560ms ease-out 180ms both;
}

.tomorrow-letter :deep(.tomorrow-quote) {
  position: relative;
  margin-top: 1.1rem;
  padding-left: 18px;
  color: var(--vp-c-text-1);
  font-size: 1.16rem;
}

.tomorrow-letter :deep(.tomorrow-quote::before) {
  position: absolute;
  top: 0.42em;
  bottom: 0.42em;
  left: 0;
  width: 2px;
  background: #0f766e;
  transform-origin: top;
  animation: tomorrow-quote-line-in 520ms ease-out 260ms both;
  content: "";
}

.tomorrow-letter :deep(.tomorrow-signature) {
  margin-top: 1.45rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
  font-size: 0.92rem;
  text-align: right;
}

.tomorrow-comments {
  max-width: 720px;
  margin: clamp(56px, 8vw, 84px) auto 0;
  animation: tomorrow-content-in 620ms ease-out 220ms both;
}

.tomorrow-comments-title {
  margin: 0 0 18px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0;
}

@keyframes tomorrow-page-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes tomorrow-title-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tomorrow-content-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tomorrow-rule-in {
  from {
    opacity: 0;
    transform: scaleX(0);
  }

  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes tomorrow-quote-line-in {
  from {
    transform: scaleY(0);
  }

  to {
    transform: scaleY(1);
  }
}

@media (max-width: 720px) {
  .tomorrow-page {
    padding: 28px 20px 56px;
  }

  .tomorrow-letter {
    padding-top: 32px;
  }

  .tomorrow-letter :deep(p) {
    font-size: 1rem;
    line-height: 1.95;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tomorrow-letter,
  .tomorrow-comments,
  .tomorrow-letter :deep(h1),
  .tomorrow-letter :deep(p),
  .tomorrow-letter :deep(hr),
  .tomorrow-letter :deep(.tomorrow-quote::before) {
    animation: none;
  }
}
</style>
