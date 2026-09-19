#!/usr/bin/env node

/**
 * 知识库文档向量化入库脚本 (Vectorize Ingestion Script)
 * 功能：读取本地 Markdown 目录，智能切块 (300~500字符/块)，调用 Cloudflare Workers AI 生成 Embedding，
 * 并以 NDJSON 格式批量 Upsert 到 Cloudflare Vectorize 向量数据库。
 *
 * 依赖：Node.js 18+ (使用内置 fetch、fs、crypto，零外部依赖)
 *
 * 环境变量配置 (支持本地 .env 文件或命令行注入)：
 * - CLOUDFLARE_ACCOUNT_ID: Cloudflare 账户 ID
 * - CLOUDFLARE_API_TOKEN: 具有 Workers AI 与 Vectorize 写权限的 API Token
 * - VECTORIZE_INDEX_NAME: 向量库索引名 (默认: docs-index)
 * - DOCS_DIR: 目标文档目录 (默认: 当前项目根目录)
 *
 * 命令行参数：
 * node scripts/ingest.js [--dry-run] [--dir <path>]
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 1. 尝试加载当前目录或上级目录的 .env 文件
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
      break;
    }
  }
}

loadEnv();

// 参数解析
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const dirArgIdx = args.indexOf("--dir");
const targetDir =
  dirArgIdx !== -1 && args[dirArgIdx + 1]
    ? path.resolve(args[dirArgIdx + 1])
    : path.resolve(process.env.DOCS_DIR || process.cwd());

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const INDEX_NAME = process.env.VECTORIZE_INDEX_NAME || "docs-index";
const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";

// 忽略的文件和目录
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".agents",
  ".design",
  ".vitepress",
  "dist",
  "public",
  "pdf-repo-single",
  "assets",
  "scripts",
  "frontend",
  "src",
]);

const IGNORED_FILES = new Set([
  "AGENTS.md",
  "LICENSE",
  "PROJECT.md",
  "TEST_INFRA.md",
  "TEST_READY.md",
]);

/**
 * 递归收集所有 Markdown 文档
 */
function scanMarkdownFiles(dir) {
  const mdFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
        mdFiles.push(...scanMarkdownFiles(fullPath));
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      if (!IGNORED_FILES.has(entry.name)) {
        mdFiles.push(fullPath);
      }
    }
  }

  return mdFiles;
}

/**
 * 剥离 YAML Frontmatter 元数据
 */
function stripFrontmatter(content) {
  if (content.startsWith("---")) {
    const endIdx = content.indexOf("\n---", 3);
    if (endIdx !== -1) {
      return content.slice(endIdx + 4).trim();
    }
  }
  return content.trim();
}

/**
 * 智能分块器 (Smart Chunker)
 * 规则：
 * 1. 按 H1 (#) 与 H2 (##) 切分大段落
 * 2. 目标块大小：300 ~ 500 字符
 * 3. 超过 500 字符按句尾（句号/换行/问号等）递归二分
 * 4. 保留所在层级标题作为 metadata.title
 */
function chunkMarkdown(filePath, rootDir) {
  const rawContent = fs.readFileSync(filePath, "utf8");
  const content = stripFrontmatter(rawContent);
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");

  // 获取一级主标题
  const fileBasename = path.basename(filePath, ".md");
  const h1Match = content.match(/^#\s+(.+)$/m);
  const docTitle = h1Match ? h1Match[1].trim() : fileBasename;

  const lines = content.split("\n");
  const sections = [];
  let currentH1 = docTitle;
  let currentH2 = "";
  let currentLines = [];

  function flushSection() {
    if (currentLines.length > 0) {
      const text = currentLines.join("\n").trim();
      if (text.length > 0) {
        sections.push({
          h1: currentH1,
          h2: currentH2,
          text,
        });
      }
      currentLines = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      flushSection();
      currentH1 = trimmed.slice(2).trim();
      currentH2 = "";
    } else if (trimmed.startsWith("## ")) {
      flushSection();
      currentH2 = trimmed.slice(3).trim();
    } else {
      currentLines.push(line);
    }
  }
  flushSection();

  const chunks = [];
  let chunkIdx = 0;

  for (const sec of sections) {
    const sectionTitleParts = [sec.h1];
    if (sec.h2 && sec.h2 !== sec.h1) {
      sectionTitleParts.push(sec.h2);
    }
    const fullTitle = sectionTitleParts.join(" > ");

    // 按段落切分
    const paragraphs = sec.text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    let tempBuffer = "";

    for (const para of paragraphs) {
      // 若单段落超过 500 字，拆分句子
      if (para.length > 500) {
        if (tempBuffer) {
          chunks.push(createChunk(tempBuffer, fullTitle, relPath, chunkIdx++));
          tempBuffer = "";
        }
        const sentences = para.split(/(?<=[。！？；\n])/);
        let subBuffer = "";
        for (const sen of sentences) {
          if ((subBuffer + sen).length > 500) {
            if (subBuffer.length >= 200) {
              chunks.push(createChunk(subBuffer, fullTitle, relPath, chunkIdx++));
              subBuffer = sen;
            } else {
              subBuffer += sen;
              chunks.push(createChunk(subBuffer, fullTitle, relPath, chunkIdx++));
              subBuffer = "";
            }
          } else {
            subBuffer += sen;
          }
        }
        if (subBuffer.trim()) {
          tempBuffer = subBuffer.trim();
        }
      } else {
        if ((tempBuffer + "\n\n" + para).length > 500) {
          if (tempBuffer.length >= 250) {
            chunks.push(createChunk(tempBuffer, fullTitle, relPath, chunkIdx++));
            tempBuffer = para;
          } else {
            tempBuffer = (tempBuffer ? tempBuffer + "\n\n" : "") + para;
            chunks.push(createChunk(tempBuffer, fullTitle, relPath, chunkIdx++));
            tempBuffer = "";
          }
        } else {
          tempBuffer = (tempBuffer ? tempBuffer + "\n\n" : "") + para;
        }
      }
    }

    if (tempBuffer.trim()) {
      chunks.push(createChunk(tempBuffer, fullTitle, relPath, chunkIdx++));
    }
  }

  return chunks.filter((c) => {
    // 过滤掉纯 HTML 占位组件标签或实际字符不足 30 字符的碎片
    const textOnly = c.text.replace(/<[^>]+>/g, "").trim();
    return textOnly.length >= 30;
  });
}

/**
 * 构造标准分块对象
 */
function createChunk(text, title, relPath, index) {
  const cleanText = text.trim();
  // 生成符合 Vectorize 命名规范的稳定 ID (字母数字组合，MD5)
  const idSeed = `${relPath}#chunk-${index}#${cleanText.slice(0, 30)}`;
  const id = "doc_" + crypto.createHash("md5").update(idSeed).digest("hex");

  // URL 路径转换为站内相对 Web 路径
  const webUrl = "/" + relPath.replace(/\.md$/, ".html");

  return {
    id,
    title,
    url: webUrl,
    text: cleanText,
    charLength: cleanText.length,
  };
}

/**
 * 调用 Cloudflare REST API 批量生成 Embedding
 */
async function generateEmbeddingsBatch(texts) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${EMBEDDING_MODEL}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: texts }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Workers AI Embedding 请求失败 [HTTP ${res.status}]: ${errText}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(`Workers AI 业务失败: ${JSON.stringify(json.errors)}`);
  }

  // json.result.data: number[][] (维度 768)
  return json.result.data;
}

/**
 * 将向量及元数据以 NDJSON 格式批量 Upsert 到 Vectorize
 */
async function upsertToVectorize(vectorsBatch) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/vectorize/v2/indexes/${INDEX_NAME}/upsert`;

  // 组装 NDJSON 字符串
  const ndjsonBody = vectorsBatch
    .map((v) =>
      JSON.stringify({
        id: v.id,
        values: v.values,
        metadata: {
          title: v.title,
          url: v.url,
          text: v.text,
        },
      }),
    )
    .join("\n");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/x-ndjson",
    },
    body: ndjsonBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Vectorize Upsert 失败 [HTTP ${res.status}]: ${errText}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(`Vectorize Upsert 业务失败: ${JSON.stringify(json.errors)}`);
  }

  return json;
}

/**
 * 主执行函数
 */
async function main() {
  console.log("🚀 [Knowledge Ingest] 开始扫描知识库文档...");
  console.log(`📁 目标目录: ${targetDir}`);

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ 目标目录不存在: ${targetDir}`);
    process.exit(1);
  }

  const mdFiles = scanMarkdownFiles(targetDir);
  console.log(`📄 发现有效 Markdown 文档: ${mdFiles.length} 个`);

  // 1. 文档智能切块
  const allChunks = [];
  for (const file of mdFiles) {
    const chunks = chunkMarkdown(file, targetDir);
    allChunks.push(...chunks);
  }

  console.log(
    `🧩 切块完成: 共生成 ${allChunks.length} 个文本切片 (平均长度: ${Math.round(allChunks.reduce((acc, c) => acc + c.charLength, 0) / (allChunks.length || 1))} 字)`,
  );

  if (allChunks.length === 0) {
    console.log("⚠️ 未检测到有效文本切片，退出。");
    return;
  }

  // 输出样本切片检查
  const sample = allChunks[0];
  console.log("\n--- [切片样本预览] ---");
  console.log(`ID: ${sample.id}`);
  console.log(`标题: ${sample.title}`);
  console.log(`URL: ${sample.url}`);
  console.log(`字数: ${sample.charLength}`);
  console.log(`内容前缀: ${sample.text.slice(0, 100).replace(/\n/g, " ")}...`);
  console.log("----------------------\n");

  if (isDryRun) {
    console.log("💡 [Dry Run 模式] 仅执行切块验证，不向 Cloudflare 发送 API 请求。");
    return;
  }

  // 2. 检查凭据
  if (!ACCOUNT_ID || !API_TOKEN) {
    console.error("❌ 缺失 Cloudflare 认证环境变量！");
    console.error("请在环境变量或 .env 文件中设置:");
    console.error('  CLOUDFLARE_ACCOUNT_ID="你的Account ID"');
    console.error('  CLOUDFLARE_API_TOKEN="你的API Token"');
    console.error('  VECTORIZE_INDEX_NAME="docs-index" (可选)');
    console.error("\n如仅需测试本地切块逻辑，可运行: node scripts/ingest.js --dry-run");
    process.exit(1);
  }

  console.log(
    `🌐 正在连接 Cloudflare: Account ID = ${ACCOUNT_ID.slice(0, 6)}***, Index = ${INDEX_NAME}`,
  );

  // 3. 批量生成向量与 Upsert
  const EMBED_BATCH_SIZE = 20; // Workers AI 批处理容量
  const UPSERT_BATCH_SIZE = 50; // Vectorize 批处理容量

  let processedCount = 0;
  let vectorBuffer = [];

  for (let i = 0; i < allChunks.length; i += EMBED_BATCH_SIZE) {
    const chunkBatch = allChunks.slice(i, i + EMBED_BATCH_SIZE);
    const texts = chunkBatch.map((c) => c.text);

    process.stdout.write(
      `⏳ 正在生成向量 [${i + 1} ~ ${Math.min(i + EMBED_BATCH_SIZE, allChunks.length)} / ${allChunks.length}]... `,
    );

    try {
      const embeddings = await generateEmbeddingsBatch(texts);

      for (let j = 0; j < chunkBatch.length; j++) {
        vectorBuffer.push({
          ...chunkBatch[j],
          values: embeddings[j],
        });
      }
      process.stdout.write("✅ 成功\n");
    } catch (err) {
      process.stdout.write("❌ 失败\n");
      console.error(`\n出错了:`, err.message);
      process.exit(1);
    }

    // 当积累到 UPSERT_BATCH_SIZE 或达到最后一块时，提交到 Vectorize
    if (vectorBuffer.length >= UPSERT_BATCH_SIZE || i + EMBED_BATCH_SIZE >= allChunks.length) {
      console.log(`📤 正在向 Vectorize [${INDEX_NAME}] 提交 ${vectorBuffer.length} 条向量...`);
      try {
        await upsertToVectorize(vectorBuffer);
        processedCount += vectorBuffer.length;
        console.log(`✨ 已成功入库: ${processedCount} / ${allChunks.length} 条向量`);
        vectorBuffer = [];
      } catch (err) {
        console.error(`❌ Vectorize Upsert 失败:`, err.message);
        process.exit(1);
      }
    }

    // 避免触发 API 突发限流，微小休眠
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n🎉 知识库向量化入库全部顺利完成！共计 ${processedCount} 个知识点切片。`);
}

export {
  scanMarkdownFiles,
  stripFrontmatter,
  chunkMarkdown,
  createChunk,
  generateEmbeddingsBatch,
  upsertToVectorize,
};

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
  });
}
