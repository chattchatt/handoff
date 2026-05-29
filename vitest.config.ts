import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Standalone Vitest config — intentionally does NOT load the lovable vite-tanstack
// plugin stack (tanstackStart, cloudflare, componentTagger, etc.), which is meant for
// the app build/dev server and would conflict in a unit-test context.
export default defineConfig({
  test: {
    // callN8n uses window.setTimeout + AbortController + fetch + FormData + File.
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
