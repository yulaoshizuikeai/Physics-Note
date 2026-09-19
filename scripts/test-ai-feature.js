import assert from "node:assert";

import {
  DEFAULT_AI_API_CONFIG,
  AI_API_PRESETS,
  DEFAULT_AI_SYSTEM_PROMPT,
  normalizeOpenAiEndpoint,
  normalizeAnthropicEndpoint,
} from "../.vitepress/theme/composables/useAiApiConfig.ts";
import { renderAiMarkdown, renderLatex } from "../.vitepress/theme/utils/aiMarkdown.ts";

console.log("=== 1. 测试 LaTeX 渲染器 ===");

// 1.1 行内公式
const inlineTex = renderAiMarkdown("根据闭合电路欧姆定律 $E = U + Ir$，路端电压随电流增大而减小。");
assert(inlineTex.includes('class="katex"'), "行内公式未正确渲染 KaTeX 标签");
assert(inlineTex.includes('<span class="ai-math-inline">'), "未包裹 ai-math-inline 容器");
console.log("✓ 行内公式渲染正常");

// 1.2 块级公式
const blockTex = renderAiMarkdown(`核心定理推导：
$$
Bqv = m\\frac{v^2}{R} \\implies R = \\frac{mv}{qB}
$$
带电粒子在磁场中做匀速圆周运动。`);
assert(blockTex.includes('<div class="ai-math-display">'), "未包裹 ai-math-display 容器");
assert(blockTex.includes('class="katex-display"'), "未渲染 KaTeX 块级容器");
console.log("✓ 块级独立公式渲染正常");

// 1.3 公式内包含不等号 < 和 > (防止 HTML 转义破坏 LaTeX)
const compTex = renderAiMarkdown("当 $F_{\\text{合}} < 0$ 时，加速度 $a < 0$ 且方向与速度相反。");
assert(compTex.includes('class="katex"'), "含不等号公式未正确解析");
assert(!compTex.includes("&lt; 0$"), "公式内不等号被错误转义为实体");
console.log("✓ 包含比较符 (<, >) 的公式渲染无错");

// 1.4 中文角标与复杂分式
const cnSubTex = renderAiMarkdown(
  "短路电流为 $I_{\\text{短}} = \\frac{E}{r}$，此时端电压 $U_{\\text{端}} = 0$。",
);
assert(cnSubTex.includes('class="katex"'), "中文角标公式未正确解析");
console.log("✓ 中文角标与分式解析正常");

// 1.5 代码块内 $ 符号隔离保护
const codeTex = renderAiMarkdown(`下面是 Python 模拟代码：
\`\`\`python
# 这里的 $ 不应该被解析为公式
price = "$100"
echo "$PATH"
\`\`\`
但这里的 $E = mc^2$ 应该被正常解析为公式。`);
assert(
  codeTex.includes('<pre class="ai-code-block"><code class="language-python">'),
  "代码块未正确解析",
);
assert(codeTex.includes('price = "$100"'), "代码块内 $ 符号被破坏");
assert(codeTex.includes('class="katex"'), "正文中公式正常解析");
console.log("✓ 代码块与公式隔离保护机制正常");

// 1.6 行内带空格公式 ($ E = mc^2 $ 与 $ x $)
const spaceTex = renderAiMarkdown("质能方程为 $ E = mc^2 $，其中变量 $ x $ 代表位置。");
assert(spaceTex.includes('class="katex"'), "行内带空格公式未正常解析");
console.log("✓ 行内带空格公式解析正常");

// 1.7 货币符号与文本隔离（杜绝误解析货币）
const moneyTex = renderAiMarkdown(
  "设备采购花费了 $50 美元与 $100 美元，但动能公式为 $E_k = \\frac{1}{2}mv^2$。",
);
assert(moneyTex.includes("$50 美元与 $100 美元"), "美元货币符号被错误篡改或匹配");
assert(moneyTex.includes('class="katex"'), "货币后方的真正数学公式正常渲染");
console.log("✓ 货币符号与公式区分保护正常");

// 1.8 块级推导公式与段落标签合法隔离（严禁 <p> 包裹 <div>）
const alignTex = renderAiMarkdown(`推导如下：
$$
\\begin{aligned}
F &= ma \\\\
  &= m \\frac{dv}{dt}
\\end{aligned}
$$
由此得出结论。`);
assert(alignTex.includes('<div class="ai-math-display">'), "多行推导未生成块级 div");
assert(
  !alignTex.includes('<p class="ai-doc-p">推导如下：<br><div'),
  "块级 div 被非法包裹在 <p> 标签中",
);
console.log("✓ 块级推导 DOM 结构合法性校验通过 (无非法 <p><div> 嵌套)");

// 1.9 有序列表、无序列表及非贪婪跨段落隔离
const listTex = renderAiMarkdown(`- 无序列表项 A
- 无序列表项 B

### 中间插播考点

这是中间的普通正文说明。

1. 第一步受力分析
2. 第二步列牛顿方程
3. 第三步求得结论

- 另一组无序列表项 C
- 另一组无序列表项 D`);
assert(
  listTex.includes("<ul>\n<li>无序列表项 A</li>\n<li>无序列表项 B</li>\n</ul>"),
  "无序列表 A 解析异常",
);
assert(
  listTex.includes(
    "<ol>\n<li>第一步受力分析</li>\n<li>第二步列牛顿方程</li>\n<li>第三步求得结论</li>\n</ol>",
  ),
  "有序列表解析异常",
);
assert(listTex.includes("<h4 class='ai-doc-h4'>中间插播考点</h4>"), "中间标题被错误吞并进列表");
assert(
  listTex.includes('<p class="ai-doc-p">这是中间的普通正文说明。</p>'),
  "中间段落被错误吞并进列表",
);
assert(
  listTex.includes("<ul>\n<li>另一组无序列表项 C</li>\n<li>另一组无序列表项 D</li>\n</ul>"),
  "无序列表 C 解析异常",
);
console.log("✓ 有序/无序列表非贪婪聚类与段落隔离解析正常");

// 1.10 标准 LaTeX 反斜杠括号 \( ... \) 与 \[ ... \] 解析
const bracketTex = renderAiMarkdown(
  "依据公式 \\(P = UI\\) 与块级推导：\n\\[\nW = Pt\n\\]\n电功计算完成。",
);
assert(bracketTex.includes('<span class="ai-math-inline">'), "反斜杠圆括号行内公式未解析");
assert(bracketTex.includes('<div class="ai-math-display">'), "反斜杠方括号块级公式未解析");
console.log("✓ 反斜杠括号公式规范解析正常");

// 1.11 Markdown 表格规范解析与 KaTeX 数学公式/比较符深度集成 (针对用户提报的真实用例)
const userScreenshotCase = `3. 关键结论与避坑指南

| 比较项 | 外接法 (方案 A) | 内接法 (方案 B) |
| :--- | :--- | :--- |
| 电压表测得 | 路端电压 $U$ | 变阻器电压 $U_R$ |
| 电流表测得 | 支路电流 $I$ | 干路总电流 $I_总$ |
| 内阻测量结果 | $r_测 < r_真$ | $r_测 > r_真$ |
| 适用场景 | 干电池（内阻小） | 水果电池（内阻极大） |

⚠️ 高考避坑点：`;

const renderedTable = renderAiMarkdown(userScreenshotCase);
assert(renderedTable.includes('<div class="ai-table-wrapper">'), "未生成 ai-table-wrapper 容器");
assert(renderedTable.includes('<table class="ai-table">'), "未生成 table 标签");
assert(renderedTable.includes('>比较项</th>'), "表头未正确解析");
assert(renderedTable.includes('>外接法 (方案 A)</th>'), "表头外接法未正确解析");
assert(renderedTable.includes('>内接法 (方案 B)</th>'), "表头内接法未正确解析");
assert(renderedTable.includes("路端电压"), "数据单元格未解析");
assert(renderedTable.includes('class="katex"'), "表格内部的 LaTeX 公式未被 KaTeX 正确渲染");
assert(!renderedTable.includes("| 比较项 |"), "表格文本仍原样残留，未转换为 HTML 表格");
assert(!renderedTable.includes("| :--- |"), "表格分隔符原样残留");
assert(!renderedTable.includes('<p class="ai-doc-p"><div class="ai-table-wrapper">'), "表格被非法嵌套在 p 标签内");
console.log("✓ Markdown 表格规范解析及公式集成通过 (含用户真实截图片段)");

// 1.12 表格对齐方式 (左/中/右) 与转义竖线 \|
const alignTableCase = `| 左对齐 | 居中对齐 | 右对齐 |
| :--- | :---: | ---: |
| 变量 $x$ | $E = mc^2$ | 数值 100 |
| 带\\|转义 | 居中项 | 50% |`;

const renderedAlignTable = renderAiMarkdown(alignTableCase);
assert(renderedAlignTable.includes('th style="text-align:left;"'), "左对齐样式缺失");
assert(renderedAlignTable.includes('th style="text-align:center;"'), "居中对齐样式缺失");
assert(renderedAlignTable.includes('th style="text-align:right;"'), "右对齐样式缺失");
assert(renderedAlignTable.includes("带|转义"), "转义竖线未正确恢复为普通字符");
console.log("✓ 表格列对齐语法 (:---, :---:, ---:) 及转义竖线解析正常");

// 1.13 表格紧贴标题无空行容错
const tightTableCase = `### 伏安特性测试
| 参数 | 标称值 |
|---|---|
| 电压 | $220\\,\\text{V}$ |`;
const renderedTightTable = renderAiMarkdown(tightTableCase);
assert(renderedTightTable.includes('<h4 class=\'ai-doc-h4\'>伏安特性测试</h4>'), "标题未正常解析");
assert(renderedTightTable.includes('<table class="ai-table">'), "紧贴标题的表格未正常解析");
console.log("✓ 无空行紧贴标题的表格容错解析正常");

console.log("\n=== 2. 测试自定义 API 配置与预设体系 ===");

// 2.1 默认配置
assert.strictEqual(DEFAULT_AI_API_CONFIG.enabled, false);
assert.strictEqual(DEFAULT_AI_API_CONFIG.protocol, "worker");
assert.strictEqual(DEFAULT_AI_API_CONFIG.model, "Llama 3.1 8B (Vectorize RAG)");
assert(DEFAULT_AI_API_CONFIG.systemPrompt.includes("强制 LaTeX 输出"));
console.log("✓ 默认 API 配置与系统提示词规范正确");

// 2.2 预设完整性
const presetIds = AI_API_PRESETS.map((p) => p.id);
assert(presetIds.includes("worker"), "缺少 worker 预设");
assert(presetIds.includes("openai"), "缺少 openai 预设");
assert(presetIds.includes("deepseek"), "缺少 deepseek 预设");
assert(presetIds.includes("anthropic"), "缺少 anthropic 预设");
assert(presetIds.includes("ollama"), "缺少 ollama 预设");
console.log("✓ 包含完整核心通用预设 (Worker, OpenAI 通用兼容, DeepSeek, Anthropic, Ollama)");

// 2.3 测试 OpenAI 通用端点智能规范化 (OAI 格式兼容)
assert.strictEqual(
  normalizeOpenAiEndpoint("https://integrate.api.nvidia.com/v1"),
  "https://integrate.api.nvidia.com/v1/chat/completions",
  "NVIDIA NIM Base URL 未正确自动补全 /chat/completions",
);
assert.strictEqual(
  normalizeOpenAiEndpoint("https://api.openai.com/v1/"),
  "https://api.openai.com/v1/chat/completions",
  "带斜杠的 Base URL 未正确自动去除并补全",
);
assert.strictEqual(
  normalizeOpenAiEndpoint("https://api.deepseek.com"),
  "https://api.deepseek.com/v1/chat/completions",
  "域名根地址未正确自动补全 /v1/chat/completions",
);
assert.strictEqual(
  normalizeOpenAiEndpoint("https://api.openai.com/v1/chat/completions"),
  "https://api.openai.com/v1/chat/completions",
  "完整端点未保持原样",
);
assert.strictEqual(
  normalizeAnthropicEndpoint("https://api.anthropic.com/v1"),
  "https://api.anthropic.com/v1/messages",
  "Anthropic Base URL 未正确自动补全 /messages",
);
console.log("✓ 通用 OAI / Anthropic 端点智能规范化测试全部通过 (支持 Base URL、带斜杠与完整端点)");

console.log("\n==========================================");
console.log("🎉 所有 LaTeX 公式渲染与自定义 API 单元验证全部通过！");
console.log("==========================================");
