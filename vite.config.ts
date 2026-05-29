// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { existsSync, readFileSync } from "node:fs";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Local dev only: `vite dev` runs src/server.ts in plain Node (the @cloudflare/vite-plugin
// is build-only), so Cloudflare's `.dev.vars` is never loaded and the worker `env` binding
// is empty. Mirror `.dev.vars` into process.env here — the dev SSR shares this Node process,
// so resolveAuthEnv()'s process.env fallback then sees GITHUB_CLIENT_ID/SECRET/SESSION_SECRET.
// In production these come from Cloudflare Worker secrets, not this file (which is gitignored).
if (existsSync(".dev.vars")) {
  for (const line of readFileSync(".dev.vars", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
