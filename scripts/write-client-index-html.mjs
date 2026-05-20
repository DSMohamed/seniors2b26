/**
 * After `vite build`, writes dist/client/index.html so Cloudflare Pages
 * (static upload / "Direct Upload") has a real HTML shell.
 * Requires `build.manifest: true` (see vite.config.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const manifestPath = path.join(root, "dist", "client", ".vite", "manifest.json");
const outPath = path.join(root, "dist", "client", "index.html");

function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error(
      "[write-client-index-html] Missing",
      manifestPath,
      "— run vite build first (client manifest must exist).",
    );
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const entries = Object.values(manifest).filter((m) => m.isEntry === true);
  if (entries.length !== 1) {
    console.error(
      "[write-client-index-html] Expected exactly one isEntry chunk, got",
      entries.length,
    );
    process.exit(1);
  }

  const entry = entries[0];
  const entryJs = entry.file;
  if (!entryJs || typeof entryJs !== "string") {
    console.error("[write-client-index-html] Entry has no file field", entry);
    process.exit(1);
  }

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
    <meta name="description" content="Seniors 2026 — We Survived Thanaweya Amma" />
    <title>Seniors 2026</title>
${cssLinks.join("\n")}
  </head>
  <body>
    <script type="module" crossorigin src="./${entryJs}"></script>
  </body>
</html>
`;

  fs.writeFileSync(outPath, html, "utf8");
  console.log("[write-client-index-html] Wrote", path.relative(root, outPath));
}

main();
