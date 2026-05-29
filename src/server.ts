import "./lib/error-capture";

import {
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  buildAuthorizeUrl,
  exchangeCodeForSession,
  parseCallbackParams,
  randomState,
  readSession,
  signSession,
  toPublicUser,
  type AuthEnv,
} from "./lib/auth";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// ── GitHub OAuth endpoints (HOFF-P3-05) ──
// Handled here in the Cloudflare fetch entry — BEFORE delegating to SSR —
// because TanStack Start 1.167 has no file-based server routes and createServerFn
// cannot serve arbitrary GET routes that 302-redirect and Set-Cookie. Matching the
// pathname in the Worker handler is the reliable pattern on Cloudflare.

/**
 * Read auth secrets from the Cloudflare env binding, falling back to process.env
 * (populated by nodejs_compat). We also mirror the binding onto process.env so
 * server functions (issue publishing) can read the same secrets via session.server.ts.
 */
function resolveAuthEnv(env: unknown): AuthEnv {
  const binding = (env ?? {}) as Record<string, string | undefined>;
  const proc =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

  const resolved: AuthEnv = {
    GITHUB_CLIENT_ID: binding.GITHUB_CLIENT_ID ?? proc.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: binding.GITHUB_CLIENT_SECRET ?? proc.GITHUB_CLIENT_SECRET,
    SESSION_SECRET: binding.SESSION_SECRET ?? proc.SESSION_SECRET,
  };

  // Mirror onto process.env so createServerFn handlers see the same values.
  const target = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  if (target) {
    if (resolved.GITHUB_CLIENT_ID) target.GITHUB_CLIENT_ID = resolved.GITHUB_CLIENT_ID;
    if (resolved.GITHUB_CLIENT_SECRET) target.GITHUB_CLIENT_SECRET = resolved.GITHUB_CLIENT_SECRET;
    if (resolved.SESSION_SECRET) target.SESSION_SECRET = resolved.SESSION_SECRET;
  }

  return resolved;
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

function cookie(name: string, value: string, maxAge: number): string {
  // HttpOnly + Secure + SameSite=Lax. Lax allows the cookie on the GitHub
  // top-level redirect back to /api/auth/github/callback.
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function handleAuth(
  request: Request,
  url: URL,
  authEnv: AuthEnv,
): Promise<Response | undefined> {
  const path = url.pathname;
  const origin = url.origin;
  const redirectUri = `${origin}/api/auth/github/callback`;

  // GET /api/auth/github/login — set CSRF state, redirect to GitHub authorize.
  if (path === "/api/auth/github/login" && request.method === "GET") {
    if (!authEnv.GITHUB_CLIENT_ID) {
      return jsonResponse({ error: "github_oauth_not_configured" }, 503);
    }
    const state = randomState();
    const headers = new Headers({
      Location: buildAuthorizeUrl(authEnv.GITHUB_CLIENT_ID, redirectUri, state),
    });
    headers.append("Set-Cookie", cookie(OAUTH_STATE_COOKIE, state, OAUTH_STATE_MAX_AGE));
    return new Response(null, { status: 302, headers });
  }

  // GET /api/auth/github/callback — verify state, exchange code, set session.
  if (path === "/api/auth/github/callback" && request.method === "GET") {
    const params = parseCallbackParams(url.searchParams);
    const cookieState = readCookie(request, OAUTH_STATE_COOKIE);
    // CSRF: state from GitHub must match the value we set in the cookie.
    if (!params || !cookieState || params.state !== cookieState) {
      const headers = new Headers({ Location: "/app?auth_error=state" });
      headers.append("Set-Cookie", clearCookie(OAUTH_STATE_COOKIE));
      return new Response(null, { status: 302, headers });
    }

    const session = await exchangeCodeForSession(params, redirectUri, authEnv);
    if (!session) {
      const headers = new Headers({ Location: "/app?auth_error=exchange" });
      headers.append("Set-Cookie", clearCookie(OAUTH_STATE_COOKIE));
      return new Response(null, { status: 302, headers });
    }

    const signed = await signSession(session, authEnv);
    const headers = new Headers({ Location: "/app" });
    headers.append("Set-Cookie", cookie(SESSION_COOKIE, signed, SESSION_MAX_AGE));
    headers.append("Set-Cookie", clearCookie(OAUTH_STATE_COOKIE));
    return new Response(null, { status: 302, headers });
  }

  // GET /api/auth/me — public projection only; never returns the token.
  if (path === "/api/auth/me" && request.method === "GET") {
    const session = await readSession(readCookie(request, SESSION_COOKIE), authEnv);
    if (!session) return jsonResponse({ loggedIn: false });
    return jsonResponse({ loggedIn: true, user: toPublicUser(session) });
  }

  // POST or GET /api/auth/logout — clear the session cookie.
  if (path === "/api/auth/logout") {
    const headers = new Headers();
    headers.append("Set-Cookie", clearCookie(SESSION_COOKIE));
    if (request.method === "GET") {
      headers.set("Location", "/app");
      return new Response(null, { status: 302, headers });
    }
    headers.set("content-type", "application/json; charset=utf-8");
    return new Response(JSON.stringify({ loggedIn: false }), { status: 200, headers });
  }

  return undefined;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const authEnv = resolveAuthEnv(env);
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/auth/")) {
        const authResponse = await handleAuth(request, url, authEnv);
        if (authResponse) return authResponse;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
