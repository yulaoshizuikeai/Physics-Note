# 品牌命名、SEO 与终端提交规则

## 1. 品牌与作者命名规范
- **作者署名**：统一为 `Yulaoshizuikeai`（首字母必须大写）。
- **英文项目品牌**：统一规范为 `Yulaoshizuikeai's Physics Note`，杜绝出现全小写 `yulaoshizuikeai's`。

## 2. 标题与正文的分层 SEO 规范
- **站点标题与 SEO Title**：
  - 核心权重词统一使用 **“高考物理知识库”**（突出“高考”高意图检索词）。
  - VitePress `siteName` / `<title>`：`高考物理知识库 - Yulaoshizuikeai's Physics Note`。
  - 站点 Nav Title / Logo 旁标题：`高考物理知识库`。
  - SEO keywords 必含：`高考物理知识库, 高中物理知识库, 高考物理, 高中物理, 物理知识库, 物理模型, Yulaoshizuikeai`。
- **文章正文与项目描述**：
  - 文章正文、专题导言、说明及全局描述中指称本项目内容体系时，一律使用 **“高中物理知识库”**。
  - 杜绝使用过时的“物理笔记”或“高中物理笔记”。

## 3. PowerShell 终端提交与构建规范
- **Git Commit Quoting**：
  - 在 Windows PowerShell 环境下执行 `git commit -m` 时，若提交信息包含中文标点（如逗号、顿号、冒号、括号），**必须使用单引号 `'...'` 包裹**，避免 PowerShell 参数分词引发的 `pathspec not matched` 语法错误。
- **提交前全站静态构建验证**：
  - 在执行 `git commit` 与 `git push` 前，必须运行 `npm run docs:build`，确保 98 篇章节文档与所有 SVG 资源零 404、零语法错误通过构建。
