// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { existsSync, readFileSync } from "node:fs";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Local dev / Railway: load server-side secrets into process.env for `vite dev` and
// `vite preview`. TanStack Start's SSR shares this Node process, so resolveAuthEnv()'s
// process.env fallback then sees GITHUB_CLIENT_ID/SECRET/SESSION_SECRET.
// Target-agnostic and still required after the Cloudflare → Node/Railway migration:
//   - .dev.vars: legacy Cloudflare local-dev file (kept; still gitignored)
//   - .env: server-side dev vars (gitignored; VITE_* are injected separately by lovable)
// In production these come from Railway's environment, not these files.
for (const envFile of [".env", ".dev.vars"]) {
  if (!existsSync(envFile)) continue;
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

// Migrate hosting from Cloudflare Workers to a Node server (Railway):
//   - cloudflare: false drops the @cloudflare/vite-plugin so the build emits a standard
//     Vite SSR bundle (web-standard fetch handler) instead of a Worker, with no
//     wrangler.json / worker-entry wrapper.
//   - server.entry "server" maps src/server.ts to the SSR build output dist/server/server.js
//     (our auth-route interception + branded SSR error wrapper). The default export's
//     .fetch(request) is a web-standard handler; on Node env/ctx are undefined and
//     resolveAuthEnv() falls back to process.env.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});
