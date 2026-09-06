<template>
  <nav id="breadcrumb" v-if="items.length" aria-label="Breadcrumb">
    <span v-for="(item, index) in items" :key="index" class="bc-item">
      <a v-if="item.link" :href="item.link" class="bc-link">{{ item.name }}</a>
      <span v-else class="bc-current">{{ item.name }}</span>
      <span v-if="index < items.length - 1" class="bc-sep">/</span>
    </span>
  </nav>
</template>

<script setup lang="ts">
import { useData, withBase } from "vitepress";
import { ref, watchEffect } from "vue";

type Breadcrumb = {
  name: string;
  link: string;
};

const { page } = useData();
const items = ref<Breadcrumb[]>([]);

watchEffect(() => {
  const filePath = page.value.filePath || page.value.relativePath || "";
  if (!filePath || filePath === "index.md" || filePath === "README.md") {
    items.value = [];
    return;
  }

  const pathSegs = filePath.replace(/\\/g, "/").split("/").filter(Boolean);
  if (!pathSegs.length) return;

  const rawChapter = pathSegs[0];
  const cleanChapter = rawChapter.replace(/^\d{2}\s*/, "");
  const isChapterIndex = pathSegs.length === 2 && pathSegs[1] === "index.md";

  const list: Breadcrumb[] = [
    {
      name: cleanChapter,
      link: isChapterIndex ? "" : withBase(`/${encodeURI(rawChapter)}/index`),
    },
  ];

  if (pathSegs.length > 1 && !isChapterIndex) {
    const rawFile = pathSegs[1].replace(/\.md$/, "");
    const cleanFile = rawFile.replace(/^\d{2}\s*/, "").replace(/^考点\s*/, "考点 · ");
    list.push({
      name: cleanFile,
      link: "",
    });
  }

  items.value = list;
});
</script>

<style scoped>
#breadcrumb {
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.bc-item {
  display: inline-flex;
  align-items: center;
}

.bc-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.bc-link:hover {
  color: var(--vp-c-brand-1);
}

.bc-current {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.bc-sep {
  margin: 0 0.45rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  user-select: none;
}
</style>
