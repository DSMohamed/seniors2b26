// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "cloudflare-server-entry-alias",
        writeBundle(options) {
          const dir = options.dir ?? "";
          if (!dir.replace(/\\/g, "/").endsWith("/server")) return;
          const indexJs = path.join(dir, "index.js");
          const serverJs = path.join(dir, "server.js");
          if (fs.existsSync(indexJs) && !fs.existsSync(serverJs)) {
            fs.copyFileSync(indexJs, serverJs);
          }
        },
      },
    ],
    build: {
      // Emit dist/client/.vite/manifest.json for scripts/prepare-pages-upload.mjs (Pages Direct Upload).
      manifest: true,
    },
  },
});
