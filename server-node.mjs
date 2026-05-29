// Production Node server entry for Railway (Cloudflare → Node migration).
//
// `vite build` (cloudflare: false) emits a standard Vite SSR bundle:
//   - dist/server/server.js  → default export { fetch(request) } (web-standard handler,
//                               our auth-route interception + branded SSR error wrapper)
//   - dist/client/**         → client JS/CSS/static assets (served by Cloudflare's
//                               static-assets binding before; we serve them here on Node)
//
// This thin runtime glue (no build step — pure Node ESM) wires both together via srvx's
// Node adapter: serve dist/client static files first, then fall through to the SSR handler.
// Secrets (GITHUB_*, SESSION_SECRET) come from process.env (Railway env in prod).
import { serve } from "srvx/node";
import { serveStatic } from "srvx/static";

const ssr = (await import("./dist/server/server.js")).default;
const serveClient = serveStatic({ dir: "./dist/client" });

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || "0.0.0.0";

serve({
  port,
  hostname,
  // Serve built client assets first; serveStatic calls next() when no file matches,
  // then the SSR handler renders the page (or handles /api/auth/* routes).
  middleware: [serveClient],
  fetch: (request) => ssr.fetch(request),
});

console.log(`Handoff Node server listening on http://${hostname}:${port}`);
