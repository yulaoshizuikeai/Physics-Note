import type { DefaultTheme } from "vitepress";

import { encodeLink, getSections } from "./sidebar.ts";

export const buildNavItems = (rootDir: string): DefaultTheme.NavItem[] => {
  const sections = getSections(rootDir);

  const items: DefaultTheme.NavItemWithLink[] = sections.map((sectionName) => {
    const link = `/${sectionName}/index`;
    return { text: sectionName, link: encodeLink(link) };
  });

  return [
    { text: "首页", link: "/" },
    {
      text: "⚡ 考前速查",
      items: [
        { text: "50 大黄金结论与临界条件", link: "/golden-conclusions" },
        { text: "全专题防踩坑排雷白皮书", link: "/warning-cheatsheet" },
      ],
    },
    {
      text: "目录",
      items,
    },
    {
      text: "分享",
      items: [{ component: "CCShare" }],
    },
    {
      text: "下载",
      items: [{ component: "CCPdfDownloadButton" }],
    },
    { component: "CCSiteSettings" },
  ];
};
