---
layout: home

description: "Yulaoshizuikeai's 高考物理知识库 是基于中国普通高中物理教科书（人教版）与可汗学院（Khan Academy）直观物理思维的免费高中物理知识库项目，涵盖运动学、相互作用、牛顿定律、曲线与圆周、万有引力、动能与动量、电场电路与磁场、电磁感应、振动与波、光学、热学、近代物理及物理实验等 19 大板块，提供严谨公式推导、核心物理模型与解题算法。"

hero:
  name: "高考物理知识库"
  text: "Yulaoshizuikeai's Physics Note"
  tagline: "结合人教版课本与可汗学院思维，覆盖高考物理 19 大板块，打造系统化高中物理知识库"
  image:
    src: /images/icon.svg
    alt: Yulaoshizuikeai's Physics Note - 高考物理知识库
  actions:
    - theme: brand
      text: 开始阅读
      link: /00%20说明/Readme
    - theme: alt
      text: 可视化交互空间
      link: /interactive
    - theme: alt
      text: 50 大黄金结论
      link: /golden-conclusions
    - theme: alt
      text: 防踩坑排雷白皮书
      link: /warning-cheatsheet
---

<CCBentoGrid />

## 项目设计与创作说明

### 创作来源（教材体系）

本项目全面基于中国普通高中物理教科书（人教版新课标，涵盖**必修第一、二、三册**与**选择性必修第一、二、三册**全套 6 册教材）进行系统化梳理与深度重构。严格对齐高中新课程标准与高考评价体系，涵盖基础概念、定理定律、实验规程以及典型题型物理模型。

### 灵感来源（直观物理思维）

深度融入**可汗学院（Khan Academy）**直观物理与微积分直觉化教学思维：

- **微元法与极限定理**：从瞬时变化率（$\Delta t \to 0$）深刻理解速度、加速度、感应电动势与分子热运动碰撞；
- **几何图景与积分本质**：从 $v-t$ 图像面积理解位移、$F-x$ 图像面积理解功、$F-t$ 图像面积理解冲量；
- **守恒量与时空对称性**：从对称性深入理解机械能守恒、动量守恒、电荷守恒与质能方程的本质内涵。

### 工程基础与致敬

本项目工程框架与设计风格基于优秀开源项目 [Chemistry-Note (高中化学笔记)](https://github.com/yulaoshizuikeai/Chemistry-Note) 修改定制而来。继承其成熟现代的 VitePress 2.0 文档系统、MathJax 公式排版规范、组件化考点展示模块（`<CCChapterOverview />`）、短链重定向与极速本地搜索系统，并针对物理学科特性研发了全套 78 幅高清矢量 SVG 图解与高考 19 大专题模型。

## 核心贡献者 (Contributors)

本项目由以下 AI 智能体与开发者协同研发构建：

- **Codex**（OpenAI）—— 架构规划、概念梳理与工程转化支持
- **Claude Code**（Anthropic） —— 深度数理推导、知识架构对齐与物理模型沉淀
