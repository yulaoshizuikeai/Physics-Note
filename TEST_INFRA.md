# E2E Test Infra: 高考物理知识库 (Yulaoshizuikeai's Physics Note) UI/UX

## Test Philosophy
- Opaque-box, requirement-driven, multi-viewport empirical verification.
- Pass/Fail Semantics:
  - `npm run docs:build` exit code 0, 0 broken links, 0 markdown parse errors.
  - `npm run typecheck` exit code 0, 0 typescript errors.
  - Playwright visual runner (`node scripts/visual-qa.js`):
    - Desktop (1280x800): Heading rhythm, MathJax formula baseline, Callout cards, dark mode contrast.
    - Tablet (768x1024): Content padding, table wrapper, sidebar collapse.
    - Mobile (390x844 & 375x667): Table horizontal scrolling (canScroll = true, overflowX != hidden), touch targets (>= 44px), drawer ergonomics, zero uncontrolled horizontal page overflow.

## Feature Inventory Mapping
| # | Feature | Target File | Verification Metric |
|---|---------|-------------|---------------------|
| 1 | H2 双边框与顶间距修复 | `style/index.css` | `.vp-doc h2` computed `borderTopWidth === '0px'` |
| 2 | MathJax 公式基线对齐 | `custom.css` | `.vp-doc mjx-container > svg` computed `verticalAlign !== 'middle'` |
| 3 | WCAG AA 对比度合规 | `vars.css` | `--vp-c-brand-1` on light bg >= 4.5:1 (ratio 5.05:1) |
| 4 | 字体栈与西文优先 | `vars.css` | `--vp-font-family-base` starts with `"Inter"` |
| 5 | SEO 品牌大小写 | `transformHead.ts` | author is `Yulaoshizuikeai` |
| 6 | 99 篇大表格移动端横滑 | `style/index.css` | `.vp-doc table` computed `overflowX === 'auto'` |
| 7 | SVG 深色反色保护 | `custom.css` | Base64 SVG in dark mode computed `filter === 'none'` |
| 8 | Callout 视觉升级 | `style/index.css` | `[!IMPORTANT]` styled, icons displayed, shadow applied |
| 9 | 物理图解卡片化 | `custom.css` | SVG cards have `border-radius: 12px`, subtle border |
| 10 | 深度大纲与中文化 | `config.mts` | `themeConfig.outline` is `[2, 3]`, labels in Chinese |
| 11 | 触控热区 >= 44px | `custom.css` | Sidebar caret & items, outline items, breadcrumbs >= 44px height |
| 12 | 平滑返回顶部按钮 | `CCBackToTop.vue` | Present in DOM, appears after scroll, 44px clickable target |
| 13 | 多端视觉回归质检 | `scripts/visual-qa.js` | All viewports tested without layout breaks or horizontal overflow |
