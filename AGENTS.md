# yulaoshizuikeai's Physics Note - Workspace Guidelines

This repository contains **高考物理知识库 (Yulaoshizuikeai's Physics Note)**.
All agents working in this workspace must adhere to the rules defined in `.agents/rules/`:

1. **[Branding & SEO Guidelines](./.agents/rules/branding-and-seo.md)**
   - Author: `Yulaoshizuikeai` (capitalized).
   - Brand: `Yulaoshizuikeai's Physics Note`.
   - Site & SEO Title: **高考物理知识库**.
   - Body Text & Content: **高中物理知识库**.
   - PowerShell Git Commit: Always wrap commit messages in single quotes `'...'` when containing Chinese punctuation.
   - Build Verification: Always verify with `npm run docs:build` before committing.

2. **[Physics SVG Diagram Design & Multimodal Visual Verification Protocol](./.agents/rules/svg-diagrams-and-vision-check.md)**
   - ViewBox standard: `0 0 780 370`.
   - Card structure: Must use `<g transform="...">` local coordinates to prevent text collisions.
   - Multimodal Vision Check: Mandatory Playwright PNG rendering + visual inspection before finalizing diagrams.
