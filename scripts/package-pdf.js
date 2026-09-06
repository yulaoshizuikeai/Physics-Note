import fg from "fast-glob";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const pdfRepoDir = path.resolve(rootDir, "pdf-repo");
const distDir = path.resolve(rootDir, ".vitepress/dist");
const distPdfDir = path.resolve(distDir, "pdf");

async function packagePdfs() {
  if (!fs.existsSync(pdfRepoDir)) {
    console.log("pdf-repo folder does not exist, skipping packaging.");
    return;
  }

  // 1. 扫描 pdf-repo 下的所有独立章节 PDF
  const pdfFiles = await fg(["**/*.pdf"], {
    cwd: pdfRepoDir,
    ignore: ["Physics-Note-Complete.pdf", "Physics-Note-All-PDFs.zip"],
  });

  if (pdfFiles.length === 0) {
    console.log("No chapter PDFs found in pdf-repo.");
    return;
  }

  // 按章节与文件名自然数排序（确保 00 -> 01 -> ... -> 19 完美顺序）
  pdfFiles.sort((a, b) => a.localeCompare(b, "zh-Hans-CN", { numeric: true }));

  console.log(`Found ${pdfFiles.length} chapter PDFs. Preparing packaging...`);

  // 2. 尝试使用 pdfunite 合并全书单文件完整版 PDF
  const completePdfPath = path.join(pdfRepoDir, "Physics-Note-Complete.pdf");
  try {
    const escapedPaths = pdfFiles.map((f) => `"${path.join(pdfRepoDir, f)}"`);
    console.log("Merging all chapter PDFs into Physics-Note-Complete.pdf via pdfunite...");
    execSync(`pdfunite ${escapedPaths.join(" ")} "${completePdfPath}"`, { stdio: "inherit" });
    console.log("✓ Successfully created Physics-Note-Complete.pdf");
  } catch (err) {
    console.warn("pdfunite execution warning (will fallback to zip packaging):", err.message);
  }

  // 3. 打包压缩为全套分册 ZIP 归档包
  const zipPath = path.join(pdfRepoDir, "Physics-Note-All-PDFs.zip");
  try {
    console.log("Archiving all PDFs into Physics-Note-All-PDFs.zip...");
    if (process.platform === "win32") {
      execSync(
        `powershell -NoProfile -Command "Compress-Archive -Path '${pdfRepoDir}/*' -DestinationPath '${zipPath}' -Force"`,
        { stdio: "inherit" },
      );
    } else {
      execSync(`cd "${pdfRepoDir}" && zip -r "${zipPath}" . -x "Physics-Note-All-PDFs.zip"`, {
        stdio: "inherit",
      });
    }
    console.log("✓ Successfully created Physics-Note-All-PDFs.zip");
  } catch (err) {
    console.warn("Zip creation warning:", err.message);
  }

  // 4. 将生成的完整版 PDF、ZIP 归档包及各单章节 PDF 复制至 .vitepress/dist/pdf
  // 供 GitHub Pages 静态网站直接托管与高速下载
  fs.mkdirSync(distPdfDir, { recursive: true });

  if (fs.existsSync(completePdfPath)) {
    fs.copyFileSync(completePdfPath, path.join(distPdfDir, "Physics-Note-Complete.pdf"));
  }
  if (fs.existsSync(zipPath)) {
    fs.copyFileSync(zipPath, path.join(distPdfDir, "Physics-Note-All-PDFs.zip"));
  }

  for (const file of pdfFiles) {
    const src = path.join(pdfRepoDir, file);
    const dest = path.join(distPdfDir, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }

  console.log("✓ All PDF assets copied to .vitepress/dist/pdf/ for GitHub Pages hosting.");
}

packagePdfs().catch((e) => {
  console.error("Failed to package PDFs:", e);
  process.exit(1);
});
