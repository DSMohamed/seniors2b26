/**
 * After `vite build`:
 * - Renders SPA shell HTML via the server worker (window.$_TSR bootstrap)
 * - Prepares dist/pages-upload/ + zip for Cloudflare Direct Upload
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import { platform } from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const clientDir = path.join(root, "dist", "client");
const serverDir = path.join(root, "dist", "server");
const uploadDir = path.join(root, "dist", "pages-upload");
const manifestPath = path.join(clientDir, ".vite", "manifest.json");
const shellPath = path.join(clientDir, "_shell.html");

const SKIP_UPLOAD = new Set([
  ".vite",
  ".assetsignore",
  "wrangler.json",
  ".dev.vars",
  "index.html",
  "_shell.html",
  "_redirects", // never ship — causes Worker deploy error 10021; SPA fallback is in wrangler.json
]);

function ensureServerEntry() {
  const indexJs = path.join(serverDir, "index.js");
  const serverJs = path.join(serverDir, "server.js");
  if (fs.existsSync(indexJs) && !fs.existsSync(serverJs)) {
    fs.copyFileSync(indexJs, serverJs);
  }
  return fs.existsSync(serverJs) ? serverJs : indexJs;
}

async function renderSpaShellHtml() {
  const serverEntry = ensureServerEntry();
  if (!fs.existsSync(serverEntry)) {
    console.warn("[prepare-pages-upload] No server build — cannot render SPA shell.");
    return null;
  }

  process.env.TSS_CLIENT_OUTPUT_DIR = clientDir;
  process.env.TSS_PRERENDERING = "true";

  const mod = await import(pathToFileURL(serverEntry).href);
  const handler = mod.default;
  if (!handler?.fetch) {
    console.warn("[prepare-pages-upload] Server entry has no fetch export.");
    return null;
  }

  const request = new Request("http://localhost/", {
    headers: { "X-TSS_SHELL": "true" },
  });

  const response = await handler.fetch(request, {}, {});
  if (!response.ok) {
    console.warn(
      "[prepare-pages-upload] SPA shell render failed:",
      response.status,
      response.statusText,
    );
    return null;
  }

  const html = await response.text();
  if (!html.includes("$_TSR")) {
    console.warn("[prepare-pages-upload] SPA shell HTML missing $_TSR bootstrap.");
    return null;
  }

  fs.writeFileSync(shellPath, html, "utf8");
  console.log("[prepare-pages-upload] Rendered SPA shell HTML");
  return html;
}

function writeFallbackIndexHtml(dir) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const entries = Object.values(manifest).filter((m) => m.isEntry === true);
  if (entries.length !== 1) {
    console.error("[prepare-pages-upload] Expected exactly one isEntry chunk, got", entries.length);
    process.exit(1);
  }

  const entry = entries[0];
  const cssLinks = [];
  for (const a of entry.assets ?? []) {
    if (typeof a === "string" && a.endsWith(".css")) {
      cssLinks.push(`    <link rel="stylesheet" crossorigin href="./${a}" />`);
    }
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Seniors 2B26 — We Survived Thanaweya Amma" />
    <title>Seniors 2B26</title>
${cssLinks.join("\n")}
  </head>
  <body>
    <script type="module" crossorigin src="./${entry.file}"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  console.warn(
    "[prepare-pages-upload] Using fallback index.html (site may show a black screen).",
  );
}

function writeIndexHtml(dir) {
  if (fs.existsSync(shellPath)) {
    fs.copyFileSync(shellPath, path.join(dir, "index.html"));
    console.log("[prepare-pages-upload] Using SPA shell as index.html");
    return;
  }
  writeFallbackIndexHtml(dir);
}

function removeRedirectsFile(dir) {
  const redirects = path.join(dir, "_redirects");
  if (fs.existsSync(redirects)) fs.unlinkSync(redirects);
}

/** SPA fallback for Worker deploy (replaces _redirects, which loops on index.html). */
function patchWorkerWranglerConfig() {
  const wranglerPath = path.join(serverDir, "wrangler.json");
  if (!fs.existsSync(wranglerPath)) return;
  const cfg = JSON.parse(fs.readFileSync(wranglerPath, "utf8"));
  cfg.assets = {
    ...cfg.assets,
    not_found_handling: "single-page-application",
  };
  fs.writeFileSync(wranglerPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
  console.log("[prepare-pages-upload] Patched dist/server/wrangler.json (SPA asset fallback)");
}

function copyClientAssetsTo(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const name of fs.readdirSync(clientDir)) {
    if (SKIP_UPLOAD.has(name)) continue;
    fs.cpSync(path.join(clientDir, name), path.join(targetDir, name), { recursive: true });
  }
}

function createZip(zipPath, sourceDir) {
  const resolvedZip = path.resolve(zipPath);
  const resolvedSrc = path.resolve(sourceDir);
  fs.mkdirSync(path.dirname(resolvedZip), { recursive: true });
  if (fs.existsSync(resolvedZip)) fs.unlinkSync(resolvedZip);

  if (platform() === "win32") {
    const ps = [
      "Compress-Archive",
      `-Path "${resolvedSrc}\\*"`,
      `-DestinationPath "${resolvedZip}"`,
      "-Force",
    ].join(" ");
    execSync(ps, { stdio: "inherit", shell: "powershell.exe" });
  } else {
    execSync(`cd "${resolvedSrc}" && zip -qr "${resolvedZip}" .`, { stdio: "inherit", shell: true });
  }
}

async function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error("[prepare-pages-upload] Missing", manifestPath, "— run vite build first.");
    process.exit(1);
  }

  await renderSpaShellHtml();

  writeIndexHtml(clientDir);
  removeRedirectsFile(clientDir);
  patchWorkerWranglerConfig();

  if (fs.existsSync(uploadDir)) {
    for (const name of fs.readdirSync(uploadDir)) {
      const target = path.join(uploadDir, name);
      fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  } else {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  copyClientAssetsTo(uploadDir);
  writeIndexHtml(uploadDir);
  removeRedirectsFile(uploadDir);

  const zipPath = path.join(root, "dist", "pages-upload.zip");
  try {
    createZip(zipPath, uploadDir);
    console.log("[prepare-pages-upload] Wrote", path.relative(root, zipPath));
  } catch (err) {
    console.warn("[prepare-pages-upload] Zip skipped:", err instanceof Error ? err.message : err);
    console.warn("[prepare-pages-upload] Upload the folder:", path.relative(root, uploadDir));
  }

  console.log("[prepare-pages-upload] Ready for Cloudflare Direct Upload:");
  console.log("  Folder:", path.relative(root, uploadDir));
  console.log("  Or zip:  dist/pages-upload.zip");
  console.log("");
  console.log("  Admin APIs (/api/admin/*) need: npm run deploy:worker");
}

main().catch((err) => {
  console.error("[prepare-pages-upload]", err);
  process.exit(1);
});
