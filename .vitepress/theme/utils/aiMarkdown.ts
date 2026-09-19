import katex from "katex";

/**
 * 渲染单个 LaTeX 公式为 HTML 字符串
 * @param tex 公式源码
 * @param displayMode 是否为独占一行块级显示模式
 */
export function renderLatex(tex: string, displayMode: boolean): string {
  if (!tex || !tex.trim()) return "";
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
      strict: false,
    });
  } catch (err) {
    // 降级容错：转义后原样返回
    const escaped = tex.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return displayMode
      ? `<pre class="katex-fallback">$$${escaped}$$</pre>`
      : `<code class="katex-fallback">$${escaped}$</code>`;
  }
}

/**
 * 解析并格式化 AI 输出的流式 Markdown 文本，全面支持 KaTeX 数学公式渲染
 *
 * 处理流水线设计：
 * 1. 提取并保护代码块 (```...```) 与行内代码 (`...`)，避免公式解析器误判代码中的 $ 符号
 * 2. 提取并使用 KaTeX 渲染块级公式 ($$...$$ 与 \\[...\\])
 * 3. 提取并使用 KaTeX 渲染行内公式 ($...$、带内侧空格的 $ ... $ 以及 \\(...\\))，同时杜绝误匹配普通英美货币
 * 4. 对正文普通字符进行严密 HTML 转义，杜绝 XSS 与 HTML 实体错乱
 * 5. 解析常用 Markdown 排版元素（标题、加粗、斜体、引用、有序/无序列表）
 * 6. 隔离块级元素，杜绝非法把 <div> 嵌套在 <p> 标签中破坏 DOM 结构
 * 7. 还原公式块与代码块，并返回最终安全渲染的高保真 HTML
 */
export function renderAiMarkdown(text: string): string {
  if (!text) return "";

  const mathBlocks: string[] = [];
  const mathInlines: string[] = [];
  const codeBlocks: string[] = [];
  const codeInlines: string[] = [];

  // 标准化换行符
  let s = text.replace(/\r\n/g, "\n");

  // 1. 抽取多行代码块并占位
  s = s.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    codeBlocks.push(
      `<pre class="ai-code-block"><code class="language-${lang || "text"}">${escaped}</code></pre>`,
    );
    return `___AI_CODE_BLOCK_${idx}___`;
  });

  // 2. 抽取行内代码并占位
  s = s.replace(/`([^`\n]+)`/g, (_, code) => {
    const idx = codeInlines.length;
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    codeInlines.push(`<code class="ai-code">${escaped}</code>`);
    return `___AI_CODE_INLINE_${idx}___`;
  });

  // 3. 抽取块级独立公式 ($$...$$ 与 \[...\])
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    const idx = mathBlocks.length;
    const rendered = renderLatex(tex, true);
    mathBlocks.push(`<div class="ai-math-display">${rendered}</div>`);
    return `___AI_MATH_BLOCK_${idx}___`;
  });
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => {
    const idx = mathBlocks.length;
    const rendered = renderLatex(tex, true);
    mathBlocks.push(`<div class="ai-math-display">${rendered}</div>`);
    return `___AI_MATH_BLOCK_${idx}___`;
  });

  // 4. 抽取行内公式 ($...$、带内侧空格的 $ ... $ 与 \(...\))
  // 分支 A: 标准无空格 $公式$ (如 $E=mc^2$、$x$)
  // 分支 B: 允许模型输出带两侧空格 $ 公式 $ (必须由字母/反斜杠/数学符号起始，杜绝误匹配 $50 and $100 货币)
  const inlineMathRegex =
    /\$(?!\$)(?:([^\$\n\s](?:[^\$\n]*?[^\$\n\s])?)|[ \t]+([a-zA-Z\\+\\-](?:[^\$\n]*?[a-zA-Z0-9\}\)\\_\\+\\-])?)[ \t]+)\$/g;

  s = s.replace(inlineMathRegex, (_, texA, texB) => {
    const tex = texA || texB || "";
    const idx = mathInlines.length;
    const rendered = renderLatex(tex, false);
    mathInlines.push(`<span class="ai-math-inline">${rendered}</span>`);
    return `___AI_MATH_INLINE_${idx}___`;
  });

  s = s.replace(/\\\((.+?)\\\)/g, (_, tex) => {
    const idx = mathInlines.length;
    const rendered = renderLatex(tex, false);
    mathInlines.push(`<span class="ai-math-inline">${rendered}</span>`);
    return `___AI_MATH_INLINE_${idx}___`;
  });

  // 5. 对正文普通字符进行 HTML 实体转义
  s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 6. 解析 Markdown 标题与排版元素
  s = s.replace(/^####\s+(.+)$/gm, "<h5 class='ai-doc-h5'>$1</h5>");
  s = s.replace(/^###\s+(.+)$/gm, "<h4 class='ai-doc-h4'>$1</h4>");
  s = s.replace(/^##\s+(.+)$/gm, "<h3 class='ai-doc-h3'>$1</h3>");
  s = s.replace(/^#\s+(.+)$/gm, "<h2 class='ai-doc-h2'>$1</h2>");

  // 引用块
  s = s.replace(/^>\s+(.+)$/gm, "<blockquote class='ai-blockquote'>$1</blockquote>");

  // 文本样式：加粗与斜体
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^\*\n]+?)\*/g, "<em>$1</em>");

  // 7. 严谨解析有序列表与无序列表（按连续行聚类，严禁跨段落贪婪匹配）
  // 7.1 无序列表 (- 或 *)
  s = s.replace(/(?:^[ \t]*[-*][ \t]+.+(?:\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => line.replace(/^[ \t]*[-*][ \t]+/, "").trim())
      .filter(Boolean)
      .map((item) => `<li>${item}</li>`)
      .join("\n");
    return `<ul>\n${items}\n</ul>\n`;
  });

  // 7.2 有序列表 (1. 2. 3.)
  s = s.replace(/(?:^[ \t]*\d+\.[ \t]+.+(?:\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => line.replace(/^[ \t]*\d+\.[ \t]+/, "").trim())
      .filter(Boolean)
      .map((item) => `<li>${item}</li>`)
      .join("\n");
    return `<ol>\n${items}\n</ol>\n`;
  });

  // 8. 确保块级公式与代码块前后有独立换行，杜绝被包裹进 <p> 标签产生非法 DOM 嵌套
  s = s.replace(/(\n?___AI_MATH_BLOCK_\d+___\n?)/g, "\n\n$1\n\n");
  s = s.replace(/(\n?___AI_CODE_BLOCK_\d+___\n?)/g, "\n\n$1\n\n");

  // 9. 分段与自然换行
  const rawParagraphs = s.split(/\n{2,}/);
  const formattedParagraphs = rawParagraphs.map((p) => {
    const trimmed = p.trim();
    if (!trimmed) return "";
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<ul>") ||
      trimmed.startsWith("<ol>") ||
      trimmed.startsWith("<blockquote") ||
      trimmed.startsWith("___AI_CODE_BLOCK_") ||
      trimmed.startsWith("___AI_MATH_BLOCK_")
    ) {
      return trimmed;
    }
    return `<p class="ai-doc-p">${trimmed.replace(/\n/g, "<br>")}</p>`;
  });

  s = formattedParagraphs.filter(Boolean).join("\n");

  // 10. 回填公式块与代码块
  s = s.replace(/___AI_MATH_BLOCK_(\d+)___/g, (_, i) => mathBlocks[Number(i)] || "");
  s = s.replace(/___AI_MATH_INLINE_(\d+)___/g, (_, i) => mathInlines[Number(i)] || "");
  s = s.replace(/___AI_CODE_BLOCK_(\d+)___/g, (_, i) => codeBlocks[Number(i)] || "");
  s = s.replace(/___AI_CODE_INLINE_(\d+)___/g, (_, i) => codeInlines[Number(i)] || "");

  return s;
}
