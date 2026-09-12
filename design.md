# Warm Neo-Minimalism（温润新极简主义）设计规范指南

> **项目名称**：高考物理知识库 (Yulaoshizuikeai's Physics Note)  
> **设计系统版本**：v2.0 (Warm Neo-Minimalism)  
> **适用范围**：全站 UI 组件、正文排版、物理矢量图解、交互空间（Canvas）、主题与移动端适配

---

## 1. 设计哲学与核心原则 (Design Philosophy)

**Warm Neo-Minimalism（温润新极简主义）** 融合了**现代数字极简主义（Neo-Minimalism）**的高效、克制与**纸质学术专著（Editorial Book Design）**的温润与严谨。它旨在为高中物理同步学习与高考备考提供一个**零噪音、高密度、直观护眼且符合深度心流阅读**的知识空间。

### 核心设计原则

1. **排版驱动，内容第一 (Type-Driven & Content-First)**
   - 物理学的本质是逻辑与数学的严密推导。界面骨架必须由极度清晰的字体层级、行高与纵向韵律构成，坚决摒弃与物理内容无关的浮夸装饰、无意义的多彩渐变和厚重投影。
2. **纸质书卷感与温润护眼 (Warm Editorial Atmosphere)**
   - 杜绝数字产品常见的生冷纯白（`#ffffff`）与强对比死黑（`#000000`）。
   - 亮色模式以**温润纸本白 (Warm Alabaster Paper)** 为基底，搭配**暖炭墨黑 (Warm Charcoal)** 文字；暗色模式以**沉静深玄灰 (Deep Slate Charcoal)** 为基底，模拟物理暗室与黑板的深邃感，保证读者长时间高强度推导公式不产生视觉疲劳。
3. **单主色克制强调 (Disciplined Color Accents)**
   - 全局主色限定为经典**物理钴蓝 (Cobalt / Electric Indigo)**，象征严谨、理性与空间纵深感。
   - 彩色仅作为“功能性信息载体”（如带电正负粒子、受力矢量分解、报警雷区），绝不用于纯视觉装饰。
4. **轻质物理层级与漫反射柔影 (Subtle Physics Layering)**
   - 抛弃任何高对比度的粗黑硬边框与生硬阴影。
   - 采用多层极低不透明度（`3% ~ 6%`）的漫反射柔和投影与 `1px` 半透明微边框，传达纸张在桌面上的微物理悬浮感。
5. **精准阻尼与微动效 (Breathing Micro-Interactions)**
   - 交互动效严格控制在 `160ms ~ 240ms` 之间，采用符合真实力学规律的阻尼缓动函数（如 `cubic-bezier(0.16, 1, 0.3, 1)`），微位移幅度控制在 `1px ~ 3px`，提供静水流深的触感反馈。
6. **人机工效与无障碍优先 (Ergonomics & Accessibility)**
   - 严格落实触控热区 $\ge 44\text{px}$（WCAG 2.1 AAA 标准），适配移动端手指盲操与底部安全区（Safe Area Inset）。
   - 确保全场景文本对比度 $\ge 4.5:1$，提供醒目且不突兀的 `:focus-visible` 焦点环。

---

## 2. 色彩系统与表面材质 (Color & Surface System)

### 2.1 表面材质（Surfaces）

| Token | 亮色模式 (Light) | 暗色模式 (Dark) | 用途说明 |
| :--- | :--- | :--- | :--- |
| `--vp-c-bg` | `#FAF9F5` (纸本暖白) | `#151718` (深玄灰) | 页面全局大背景、文档正文纸张基底 |
| `--vp-c-bg-soft` | `#F3F1EC` (柔暖米灰) | `#1C1F21` (沉静板岩) | 容器面板、公式背景、图解卡片背景、表格斑马纹 |
| `--vp-c-bg-elv` | `#FFFFFF` (纯净纸面) | `#1C1F21` (悬浮微光) | 弹窗主体、顶栏下拉菜单、返回顶部按钮 |
| `--vp-c-bg-alt` | `#EBE8E1` (纸缘深色) | `#23272A` (次级板岩) | 控制条底槽、二级容器深色底色 |

### 2.2 墨色阶（Typography & Ink Scale）

| Token | 亮色模式 (Light) | 暗色模式 (Dark) | 用途说明 |
| :--- | :--- | :--- | :--- |
| `--vp-c-text-1` | `#1F2328` (暖炭墨黑) | `#E3E5E8` (清透粉笔白) | 正文主标题、正文文本、核心物理推导公式 |
| `--vp-c-text-2` | `#57606A` (次级石墨) | `#9BA1A6` (柔和浅灰) | 副标题、补充解释、元信息、列表前缀 |
| `--vp-c-text-3` | `#6E7781` (淡墨注释) | `#687076` (静默中灰) | 分割线标记、面包屑斜杠、表格辅助注脚 |

### 2.3 品牌色系：经典物理钴蓝 (Cobalt / Electric Indigo)

| 梯度 | 亮色模式 (Light) | 暗色模式 (Dark) | 用途说明 |
| :--- | :--- | :--- | :--- |
| `Brand-1` (主色) | `#4C67B9` | `#758EE6` | 链接激活态、核心按钮背景、SVG 关键矢量 |
| `Brand-2` (Hover) | `#3D56A3` | `#5672CD` | 按钮悬停、交互元素按压过渡态 |
| `Brand-3` (Active) | `#2F438A` | `#9CB1F5` | 深度激活、深色模式悬停发光 |
| `Brand-soft` | `rgba(76, 103, 185, 0.12)` | `rgba(117, 142, 230, 0.16)` | 高亮胶囊背景、公式悬停辉光、选中节点光晕 |

### 2.4 语义警示色系 (Semantic Tone)

遵循“高辨识度但低刺眼度”的学术纸本原则：

| 语义 | 边框色 (Border) | 背景色 (Bg Soft) | 文字色 (Text) | 代表场景 |
| :--- | :--- | :--- | :--- | :--- |
| **Tip (技巧)** | `#435EB8` | `rgba(67, 94, 184, 0.06)` | `#2F448C` | 秒杀技巧、快速解题定理、微积分思考 |
| **Info (说明)** | `#4C67B9` | `rgba(76, 103, 185, 0.05)` | `#2F448C` | 实验规范、公式定义域、背景模型说明 |
| **Warning (警示)** | `#C27803` | `rgba(194, 120, 3, 0.06)` | `#724602` | 公式适用边界、易混淆概念、临界条件 |
| **Danger (雷区)** | `#B9423B` | `rgba(185, 66, 59, 0.06)` | `#75201B` | 考场高频踩坑点（如刹车倒车陷阱、盲套摩擦力） |
| **Important (重点)** | `#7C3AED` | `rgba(124, 58, 237, 0.06)` | `#4C1D95` | 高考核心考点、黄金代换公式 |

### 2.5 微边框与漫反射柔影 (Borders & Diffused Shadows)

- **微边框**：
  - 亮色：`1px solid rgba(0, 0, 0, 0.08)`
  - 暗色：`1px solid rgba(255, 255, 255, 0.09)`
- **柔影梯度**：
  - 卡片与轻微悬浮：`0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)`
  - 悬停浮起态：`0 6px 18px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)`
  - 模态弹窗与大浮层：`0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)`

---

## 3. 字体与排版韵律规范 (Typography & Rhythm)

### 3.1 字体栈设计

- **基础正文栈 (Humanist Sans-Serif)**：
  `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
- **学术衬线栈 (Serif Mode)**：
  `Georgia, "Songti SC", "Noto Serif SC", STSong, SimSun, serif`
- **数学与代码等宽栈 (Monospace & Math)**：
  `"JetBrains Mono", "Fira Code", ui-monospace, Menlo, Monaco, Consolas, monospace`

### 3.2 标题与正文层级

| 标签 | 字号 (Desktop) | 字号 (Mobile) | 行高 | 字重 | 间距规则 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | `2.15rem` (34.4px) | `1.75rem` (28px) | `1.25` | `700` | 上间距 `1.2rem`，下间距 `1.5rem` |
| **H2** | `1.52rem` (24.3px) | `1.35rem` (21.6px) | `1.35` | `650` | 上间距 `2.4rem`，下带细分割线 |
| **H3** | `1.22rem` (19.5px) | `1.12rem` (18px) | `1.4` | `650` | 上间距 `1.75rem`，下间距 `0.7rem` |
| **Body** | `16px` (1280px+ 为 16.5px) | `15.5px` | `1.82` | `400` | 段落上下间距 `1.1rem`，两端自然对齐 |

### 3.3 中文与数学排版严格禁则 (CJK Typography & Math Rules)

1. **中文避头尾禁则**：
   正文全局声明 `line-break: strict; overflow-wrap: break-word; text-wrap: pretty;`，杜绝句号、顿号、逗号在行首孤立出现。
2. **公式前后括号防折断**：
   使用 `.vp-math-bracket-group` 将括号与紧随的公式包裹为行内无折断基线对齐单元（如 `（$v=0$）`），防止括号掉落到上一行末尾或公式单独折入下一行。
3. **行内公式基线贴合**：
   非块级公式 `mjx-container:not([display="true"])` 必须统一强制 `vertical-align: -0.14em !important;`，精准匹配中文字符 x-height 基线，消除突兀跳动。

---

## 4. 关键组件与界面模块设计规范 (Component Design Specs)

### 4.1 顶部导航栏与多级菜单 (Top Navigation & Menus)

- **质感**：磨砂玻璃 `backdrop-filter: blur(14px) saturate(180%)`，带轻量底部分割线。
- **长下拉菜单容错规范**：
  针对包含 20 个章节的「目录」下拉浮层，必须显式约束最大视口高度：
  ```css
  .VPNavBar .VPMenu {
    max-height: calc(100vh - var(--vp-nav-height) - 32px);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }
  ```

### 4.2 面包屑导航 (`<CCBreadCrumb />`)

- **结构**：必须包含「首页」根锚点：
  `🏠 首页` / `专题分类` / `当前小节标题`
- **样式**：
  - 根节点与中间章节为可点击的淡墨文本链接，Hover 时呈现微背景胶囊；
  - 末节点为不可点击的炭墨色当前页标题；
  - 触控高度统一满足 `min-height: 44px`。

### 4.3 首页 Hero 与特性卡片架构 (Hero & Feature Grid)

- **Hero 行动按钮阶梯 (Action Hierarchy)**：
  - **Primary CTA（首要入口）**：「开始阅读」—— 实体钴蓝色块，带有柔和阴影与悬停微位移；
  - **Accent CTA（特色高亮）**：「🪐 交互空间」—— 采用微边框渐变 + 晶体星空蓝光晕，展现特色交互探索能力；
  - **Secondary CTA（考前通道）**：「50 大黄金结论」与「防踩坑排雷白皮书」—— 采用柔暖底色药丸胶囊，建立清晰的主次行动引导。
- **22 个 Features 卡片分层设计**：
  - **旗舰特性卡片 (Special Features)**：前 3 项特殊卡片（交互空间、黄金结论、排雷白皮书）使用专属的轻度渐变背景、精致微边框与特色小角标（如 `✨ 动态仿真`、`⚡ 考前必背`、`🚨 深度排雷`）；
  - **章节卡片 (Chapter Features)**：后 19 项标准章节卡片使用温暖底色和微物理悬停（`translateY(-3px)`），保持整齐严谨。

### 4.4 物理矢量图解容器规范 (`.physics-svg-card`)

所有高清矢量 SVG 与物理插图统一遵循：
- **容器标准**：`border-radius: 12px`，内边距 `10px`，轻质双层微阴影；
- **自适应**：居中对齐，`max-width: 100%`，`height: auto`；
- **深色模式反色保护**：所有正规矢量 SVG 与内联 Base64 SVG **严禁**被全局 CSS 滤镜反色反相，内部色彩均已通过 SVG 标准色彩 Token 适配明暗主题。

### 4.5 交互空间 Canvas 与仿真面板规范 (`<CCKnowledgeGraph />` & `<CCPhysicsSimulator />`)

- **全平台触控支持 (Touch Support)**：
  - 必须同时监听 `touchstart`、`touchmove`、`touchend` 与原生 Mouse 事件；
  - 画布声明 `touch-action: none` 防止拖拽与缩放时带动浏览器外部页面滚动；
  - 支持双指手势平移与缩放（Pinch-Zoom）。
- **底栏卡片无障碍与关闭机制**：
  - 知识图谱节点详情卡片必须在右上角提供明确的「`×` 关闭」按钮；
  - 支持键盘 `Escape` 键一键关闭选中的节点；
  - 关闭后平滑隐藏，将画布全貌完整返还给读者。

### 4.6 弹窗与表单控件设计 (`<CCSiteSettings />`)

- **极简开关 (Neo-Minimalist Toggle Switch)**：
  - 彻底淘汰原生简陋 `<input type="checkbox">`；
  - 采用平滑胶囊轨道（宽度 `40px`，高度 `22px`），内部滑块直径 `16px`，结合 `cubic-bezier` 弹性滑动动效；
  - 激活时轨道填充品牌色 `--vp-c-brand-1`，关闭时为纸面微灰边框底。

---

## 5. 考前速查特页专属体验规范 (Special Cheat Sheets)

### 5.1 「50 大黄金结论」模块快速跳查导航

- **模块吸顶/首屏胶囊组 (Module Quick-Pills)**：
  - 在大标题下方提供 11 大模块的极简胶囊锚点组（如 `01-05 运动追及`、`06-10 受力平衡`、`11-15 动力学模型`、`16-20 抛体圆周` 等）；
  - 点击平滑锚定至对应模块 `H2` 锚点，移动端支持横向滑动检索；
  - 表格表头采用 `position: sticky; top: var(--vp-nav-height);`，表身过长时表头始终锁定可视，方便对照指标。

### 5.2 「防踩坑排雷白皮书」高密度警示节奏优化

- **视觉减负**：连续的 `danger` 与 `warning` 警示框之间严格维持 `1.5rem` 的留白间距，避免色彩视觉轰炸；
- **三段式排版节奏**：
  每一条排雷均严格遵循统一视觉模板：
  `【致命陷阱】` (灰色背景行内代码) $\to$ `【原理剖析】` (正常段落) $\to$ `【破局策略 / 排雷第一法则】` (高亮强调清单)。

---

## 6. 无障碍、暗黑模式与移动端人机工效规范

### 6.1 44px 触控目标保障 (WCAG 2.1 Target Size)

以下所有具有交互行为的元素，其最小有效热区尺寸严格保证 $\ge 44 \times 44\text{px}$：
1. 侧边栏折叠箭头 (`.VPSidebarItem .caret`)；
2. 面包屑所有链接与项 (`.bc-link`, `.bc-current`)；
3. 返回顶部浮动按钮 (`.cc-back-to-top`)；
4. 显示配置弹窗中的每一个开关选项 (`.cc-settings-option`)；
5. 目录与本地导航下拉菜单。

### 6.2 移动端安全区与横向溢出终极防御

- **iPhone Home Bar 安全区适配**：
  ```css
  .cc-back-to-top {
    bottom: max(24px, env(safe-area-inset-bottom, 24px) + 12px);
  }
  ```
- **全局横向溢出防御**：
  文档根层 `.VPDoc, .vp-doc, .vp-doc > div` 声明 `overflow-x: clip; max-width: 100%;`，杜绝任何宽表格或超长数学公式导致整页被横向拖出大片白边。

---

*本规范即日起作为项目所有 UI 改进、样式重构与组件迭代的唯一权威准则。*
