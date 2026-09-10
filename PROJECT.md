# Project: 高考物理知识库 (Yulaoshizuikeai's Physics Note) UI/UX 全面重构

## Architecture
本项目为基于 VitePress 的“高考物理知识库”全站视觉与交互重构工程。
样式架构与层级关系：
1. **Tokens & Variables Layer** (`.vitepress/theme/style/vars.css`): 全局主题色、字阶体系、暗色/浅色模式变量、卡片阴影、圆角。
2. **Document Typography & Component Layer** (`.vitepress/theme/style/index.css`): 正文排版韵律（H1-H6 标题、行高、段落留白）、Callout 容器、表格、代码块基础样式。
3. **Custom & Overrides Layer** (`.vitepress/theme/custom.css`): MathJax 矢量公式基线修复、SVG 物理图解卡片化与深色模式滤镜修复、移动端触控热区（>=44px）、响应式留白。
4. **Site & Navigation Config Layer** (`.vitepress/config.mts`): 大纲层级（outline: [2, 3]）、本页目录及全站中文本地化文案。
5. **Interactive UI Components** (`.vitepress/theme/components/`): 返回顶部浮动按钮 (`CCBackToTop.vue`)、面包屑与自定义按钮触控优化。
6. **Testing & Visual Verification** (`scripts/visual-qa.js`): Playwright 多视口（1280px, 768px, 390px, 375px）离线视觉质检、横向溢出断言、截图对比。

## Code Layout
- M1 (Typography & Brand):
  - `.vitepress/theme/style/vars.css` (字体栈、WCAG AA 品牌主色 `#4c67b9`、muted 色阶)
  - `.vitepress/theme/style/index.css` (H2 双边框与 padding-top 消除、正文字距、行高 1.75~1.85)
  - `.vitepress/siteData/transformHead.ts` (SEO 署名修复为 `Yulaoshizuikeai`)
- M2 (Components & Warm Neo-Minimalism):
  - `.vitepress/theme/style/index.css` (表格 `overflow-x: auto` 横滑恢复、Callout 语义图标与微阴影、`language-text` 标签美化)
  - `.vitepress/theme/custom.css` (MathJax `vertical-align` 基线重置、SVG 矢量图 Base64 深色反色滤镜排除、物理图解卡片化)
- M3 (Navigation & Responsive Ergonomics):
  - `.vitepress/config.mts` (outline [2, 3]、中文化 label)
  - `.vitepress/theme/components/CCBackToTop.vue` (新增加载平滑回顶组件)
  - `.vitepress/theme/custom.css` (侧边栏、大纲、面包屑等 11 项触控热区扩充至 >= 44px、移动端正文边距微调)
  - `.vitepress/theme/index.ts` (挂载回顶组件)
- M4 / E2E Track:
  - `scripts/visual-qa.js` (Playwright 自动化多端视觉测试脚本)
  - `package.json` (添加 `"test:visual"` 命令)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | H2 双边框与顶间距修复 | 清除 `.vp-doc h2` 的 `border-top` 与 `padding-top: 24px`，保持 `border-bottom` 呼吸感 | M1 | Survey Explorer 1 |
| 2 | MathJax 公式基线对齐 | 移除 `.vp-doc mjx-container > svg` 强制 `vertical-align: middle !important`，恢复 MathJax 原生计算基线 | M2 | Survey Explorer 1/2 |
| 3 | WCAG AA 色彩对比度合规 | 浅色 `--vp-c-brand-1` 从 `#5672cd` 调整为 `#4c67b9`（对比度从 4.26:1 提升至 5.05:1），修正 `--vp-c-text-3` 为 `#6e7781` | M1 | Survey Explorer 1 |
| 4 | 字体栈与西文衬线优先级 | 基础字体栈置前 `Inter`，衬线模式前置 `Georgia`，消除汉字标题负字间距 | M1 | Survey Explorer 1 |
| 5 | SEO 署名大小写合规 | `transformHead.ts` 中 `author.name` 修正为规范驼峰 `Yulaoshizuikeai` | M1 | Survey Explorer 1 |
| 6 | 99 篇大表格移动端横滑修复 | 修正 `index.css:263` 的 `overflow: hidden;` 为 `overflow-x: auto; -webkit-overflow-scrolling: touch;` | M2 | Survey Explorer 2 |
| 7 | SVG 矢量物理图解深色反色修复 | 修正 `custom.css:2` 选择器以精准排除 Base64 内联 SVG，保护矢量物理标准色 | M2 | Survey Explorer 2 |
| 8 | Callout 提示框视觉升级 | 补充 `[!IMPORTANT]` 与 `[!NOTE]` 自定义样式，添加语义图标、微阴影与容器内代码徽标配色 | M2 | Survey Explorer 2 |
| 9 | 物理图解卡片化与代码块优化 | 为矢量图解赋予 12px 圆角、低饱和度边框与柔和微阴影；优化 ASCII 物理流程图排版并隐藏无意义 `text` 标签 | M2 | Survey Explorer 2 |
| 10 | 深度大纲与全站中文界面配置 | `.vitepress/config.mts` 中配置 `outline: [2, 3]` 及 `本页目录`、`上一篇`、`下一篇` 等中文化文案 | M3 | Survey Explorer 3 |
| 11 | 移动端交互触控热区全面 >= 44px | 为侧边栏折叠箭头、章节链接、顶部面包屑、大纲项、PDF 下载按钮等全面注入 >= 44px 安全触控尺寸 | M3 | Survey Explorer 3 |
| 12 | 全局平滑返回顶部浮动按钮 | 新建并挂载 `CCBackToTop.vue`，滚动超 400px 淡入，触控尺寸 44px | M3 | Survey Explorer 3 |
| 13 | Playwright 多视口自动化视觉质检 | 编写 `scripts/visual-qa.js`，提供桌面端(1280px)、平板(768px)、手机(390px/375px)断言与多模态截图 | M4 | Survey Explorer 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: 正文排版与主题对比度重构 (R1) | Features 1, 3, 4, 5: H2边框、WCAG AA色彩、字体栈、SEO署名 | none | DONE |
| 2 | M2: 结构化组件与 Warm Neo-Minimalism (R2) | Features 2, 6, 7, 8, 9: MathJax基线、表格横滑恢复、SVG深色反色修复、Callout视觉升级、图解卡片化 | M1 | DONE |
| 3 | M3: 导航层级与多端人机工效跃升 (R3) | Features 10-12: 大纲深度配置、触控热区>=44px、返回顶部组件 | M2 | DONE |
| 4 | M4: 全站 E2E 构建与多视口视觉质检 (R4) | Feature 13: 静态构建 100%、类型检查 100%、Playwright 视觉巡检 | M3 | DONE |

## Interface Contracts
### CSS Custom Properties & Design Tokens
- `--vp-c-brand-1`: `#4c67b9` (Light) / `#758ee6` (Dark)
- `--vp-font-family-base`: `"Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;`
- `--vp-font-family-serif`: `Georgia, "Songti SC", "Noto Serif SC", STSong, SimSun, serif;`
- `--vp-shadow-card`: `0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);` (Light) / `0 2px 8px rgba(0, 0, 0, 0.25);` (Dark)

### Verification Commands
- `npm run typecheck`: 退出码 0，零类型报错
- `npm run docs:build`: 退出码 0，全站 99 篇无语法错误生成
- `npm run test:visual`: 桌面端与移动端无横向不可控溢出，核心截图生成
