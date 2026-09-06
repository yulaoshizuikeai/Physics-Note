import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

import { configureImageOptimization } from "./markdown/imageOptimization";
import { buildNavItems } from "./siteData/nav";
import { buildSidebarItems } from "./siteData/sidebar";
import { buildTransformHead } from "./siteData/transformHead";
import mapShortUrl from "./theme/components/shortUrl/mapShortUrl";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.resolve(configDir, "..");
const siteUrl = "https://note.physics.nx.kg";
const siteName = "yulaoshizuikeai's Physics Note";
const defaultDescription =
  "免费高中物理笔记与知识架构体系，覆盖运动学、动力学、圆周与万有引力、机械能与动量、静电场与恒定电流、磁场与电磁感应、交变电流、振动与光、热学、近代物理及物理实验等核心板块，结合人教版教材与可汗学院直观思维，适合高中同步学习与高考复习。";
const navItems = buildNavItems(contentRoot);
const sidebarItems = buildSidebarItems(contentRoot);

export default defineConfig({
  base: "/",
  title: siteName,
  description: defaultDescription,
  lang: "zh-CN",
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/images/icon.svg" }],
    ["meta", { name: "author", content: "yulaoshizuikeai" }],
    [
      "meta",
      {
        name: "keywords",
        content: "高中物理,物理笔记,高考物理,力学,电磁学,动量守恒,物理模型,可汗学院",
      },
    ],
    ["meta", { name: "robots", content: "index, follow, max-image-preview:large" }],
    ["meta", { property: "og:site_name", content: siteName }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["meta", { property: "og:image", content: `${siteUrl}/images/og-image.png` }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: `${siteUrl}/images/og-image.png` }],
    ["meta", { name: "twitter:title", content: siteName }],
    ["meta", { name: "twitter:description", content: defaultDescription }],
    [
      "script",
      {},
      `;(() => {
        try {
          const settings = JSON.parse(localStorage.getItem("cc-site-settings") || "{}");
          const root = document.documentElement;
          root.classList.toggle("cc-hide-contributors", settings.showContributors === false);
          root.classList.toggle("cc-hide-outline", settings.showOutline === false);
          root.classList.toggle("cc-hide-comments", settings.showComments === false);
          root.classList.toggle("cc-font-serif", settings.fontFamily === "serif");
        } catch {}
      })();`,
    ],
  ],
  themeConfig: {
    logo: "/images/icon.svg",
    siteTitle: "Physics Note",
    nav: navItems,
    sidebar: { "/": sidebarItems },
    socialLinks: [{ icon: "github", link: "https://github.com/yulaoshizuikeai/Physics-Note" }],
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    editLink: {
      pattern: "https://github.com/yulaoshizuikeai/Physics-Note/edit/master/:path",
      text: "在 GitHub 上查看此页",
    },
    footer: {
      message: "高中物理知识架构与高考复习指南",
      copyright: "Copyright © 2026 yulaoshizuikeai",
    },
  },
  markdown: {
    math: true,
    config: configureImageOptimization,
  },
  rewrites: {
    "hidePage/shortUrl.md": "s.md",
  },
  transformHead: buildTransformHead(siteUrl, siteName, defaultDescription),
  lastUpdated: true,
  sitemap: {
    hostname: siteUrl,
  },

  // 生成哈希 - 路径对应表
  buildEnd: (siteConfig) => {
    mapShortUrl(siteConfig);
  },
});
