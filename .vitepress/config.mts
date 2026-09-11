import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

import { configureImageOptimization } from "./markdown/imageOptimization.ts";
import { configureBracketAndMathPlugin } from "./markdown/bracketAndMathPlugin.ts";
import { buildNavItems } from "./siteData/nav.ts";
import { buildSidebarItems } from "./siteData/sidebar.ts";
import { buildTransformHead } from "./siteData/transformHead.ts";
import mapShortUrl from "./theme/components/shortUrl/mapShortUrl.ts";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.resolve(configDir, "..");
const siteUrl = "https://note.physics.nx.kg";
const siteName = "高考物理知识库 - Yulaoshizuikeai's Physics Note";
const defaultDescription =
  "免费高中物理知识库与高考复习指南，覆盖运动学、动力学、圆周与万有引力、机械能与动量、静电场与恒定电流、磁场与电磁感应、交变电流、振动与光、热学、近代物理及物理实验等核心板块，结合人教版教材与可汗学院直观思维，适合高中同步学习与高考复习。";
const navItems = buildNavItems(contentRoot);
const sidebarItems = buildSidebarItems(contentRoot);

export default defineConfig({
  base: "/",
  title: siteName,
  description: defaultDescription,
  lang: "zh-CN",
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/images/icon.svg" }],
    ["meta", { name: "author", content: "Yulaoshizuikeai" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "高考物理知识库,高中物理知识库,高考物理,高中物理,物理知识库,物理模型,动力学,圆周运动,万有引力,动量守恒,电磁感应,变压器,光电效应,微元法,可汗学院,Yulaoshizuikeai",
      },
    ],
    ["meta", { name: "theme-color", content: "#5672CD" }],
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
    // 搜索引擎站长平台所有权验证（按需填入验证码即可启用）
    // ["meta", { name: "google-site-verification", content: "YOUR_GOOGLE_VERIFICATION_CODE" }],
    // ["meta", { name: "msvalidate.01", content: "YOUR_BING_VERIFICATION_CODE" }],
    // ["meta", { name: "baidu-site-verification", content: "YOUR_BAIDU_VERIFICATION_CODE" }],
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
    siteTitle: "高考物理知识库",
    nav: navItems,
    sidebar: { "/": sidebarItems },
    socialLinks: [
      { icon: "github", link: "https://github.com/yulaoshizuikeai/Physics-Note" },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
        },
        link: "mailto:imharlanyu@gmail.com",
        ariaLabel: "邮件勘误与交流反馈 (imharlanyu@gmail.com)",
      },
    ],
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
    outline: {
      level: [2, 3],
      label: "本页目录",
    },
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    sidebarMenuLabel: "目录",
    returnToTopLabel: "返回顶部",
    darkModeSwitchLabel: "深浅外观",
    lastUpdated: {
      text: "最后更新",
    },
    editLink: {
      pattern: "https://github.com/yulaoshizuikeai/Physics-Note/edit/master/:path",
      text: "在 GitHub 上查看此页",
    },
    footer: {
      message: "高中物理知识库与高考复习指南",
      copyright: "Copyright © 2026 Yulaoshizuikeai",
    },
  },
  markdown: {
    math: true,
    config: (md) => {
      configureImageOptimization(md);
      configureBracketAndMathPlugin(md);
    },
  },
  rewrites: {
    "hidePage/shortUrl.md": "s.md",
  },
  srcExclude: ["README.md", "AGENTS.md", "scripts/**", "pdf-repo/**", "pdf-repo-single/**"],
  transformHead: buildTransformHead(siteUrl, siteName, defaultDescription),
  lastUpdated: true,
  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return items.filter((item) => {
        const url = item.url;
        // 排除 404、短链跳转页及任何内部隐藏页面
        if (
          url.includes("/404") ||
          url.includes("/s.html") ||
          url.includes("/s") ||
          url.includes("/hidePage/")
        ) {
          return false;
        }
        return true;
      });
    },
  },

  // 生成哈希 - 路径对应表
  buildEnd: (siteConfig) => {
    mapShortUrl(siteConfig);
  },
});
