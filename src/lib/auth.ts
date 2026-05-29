/**
 * Hand-rolled GitHub OAuth + session helpers (HOFF-P3-05).
 *
 * No auth library — just `fetch`, the Web Crypto API (available on the
 * Cloudflare Worker runtime and in dev via nodejs_compat), and `zod` for
 * validating the OAuth callback params.
 *
 * The auth ENDPOINTS themselves live in `src/server.ts` (the Cloudflare fetch
 * entry), because this version of TanStack Start (1.167) does not expose
 * file-based server/API routes (`createServerFileRoute` does not exist), and
 * `createServerFn` only binds internal RPC-style POST paths — it cannot serve
 * arbitrary GET routes that 302-redirect and Set-Cookie. Matching the pathname
 * in the Worker fetch handler before delegating to SSR is the reliable pattern
 * on Cloudflare. This module holds the pure, testable pieces those endpoints
 * (and the issue-publishing server function) share.
 *
 * ── MVP session-storage tradeoff (no DB yet; DB is P3-06/07) ──
 * The GitHub access token is stored in a SIGNED, HttpOnly, Secure, SameSite=Lax
 * cookie — NOT in client-readable JS and NOT in any client response. The cookie
 * value is `base64url(json).base64url(hmacSHA256(json, SESSION_SECRET))`, so the
 * server can detect tampering. This is NOT encryption: anyone with the raw cookie
 * bytes (e.g. full disk access to the browser) can base64-decode the token. That
 * is an accepted MVP tradeoff until the DB-backed session store lands and the
 * token moves server-side-only. The token is therefore never logged and never
 * returned by `/api/auth/me`.
 */
import { z } from "zod";

export const SESSION_COOKIE = "handoff_session";
export const OAUTH_STATE_COOKIE = "handoff_oauth_state";

/** Seconds. Session cookie lifetime (7 days). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
/** Seconds. CSRF state cookie lifetime (10 minutes). */
export const OAUTH_STATE_MAX_AGE = 60 * 10;

/** Server-side secrets, read from the Cloudflare env binding or process.env. */
export type AuthEnv = {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  /** Optional. Falls back to GITHUB_CLIENT_SECRET when absent (still HMAC'd). */
  SESSION_SECRET?: string;
};

/** What we persist in the signed session cookie. */
export type SessionPayload = {
  /** GitHub access token — server-side only, never sent to the client. */
  token: string;
  /** Stable GitHub numeric user id — the key for per-account history. */
  githubId: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
};

/** Safe public projection returned by /api/auth/me — never includes the token. */
export type PublicUser = {
  login: string;
  name: string | null;
  avatarUrl: string | null;
};

const githubCallbackParams = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

const githubUser = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

function encoder(): TextEncoder {
  return new TextEncoder();
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncodeString(value: string): string {
  return base64urlEncode(encoder().encode(value));
}

function base64urlDecodeToString(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder().encode(message));
  return base64urlEncode(new Uint8Array(signature));
}

/** Constant-time string compare to avoid signature timing leaks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function signingSecret(env: AuthEnv): string {
  // Prefer a dedicated SESSION_SECRET; fall back to the OAuth client secret so the
  // cookie is always signed even before SESSION_SECRET is provisioned.
  return env.SESSION_SECRET || env.GITHUB_CLIENT_SECRET || "";
}

/** Serialize + HMAC-sign a session payload into a cookie value. */
export async function signSession(payload: SessionPayload, env: AuthEnv): Promise<string> {
  const json = JSON.stringify(payload);
  const body = base64urlEncodeString(json);
  const sig = await hmacSha256(body, signingSecret(env));
  return `${body}.${sig}`;
}

/** Verify + parse a signed session cookie. Returns null on any tampering/parse failure. */
export async function readSession(
  cookieValue: string | undefined,
  env: AuthEnv,
): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  const dot = cookieValue.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);

  const expected = await hmacSha256(body, signingSecret(env));
  if (!timingSafeEqual(sig, expected)) return null;

  try {
    const parsed = JSON.parse(base64urlDecodeToString(body));
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.token === "string" &&
      typeof parsed.githubId === "number" &&
      typeof parsed.login === "string"
    ) {
      return {
        token: parsed.token,
        githubId: parsed.githubId,
        login: parsed.login,
        name: typeof parsed.name === "string" ? parsed.name : null,
        avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : null,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/** Public projection for /api/auth/me — strips the token. */
export function toPublicUser(session: SessionPayload): PublicUser {
  return { login: session.login, name: session.name, avatarUrl: session.avatarUrl };
}

/** Random URL-safe state for CSRF protection on the OAuth round-trip. */
export function randomState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

/** Build the GitHub authorize URL for the login redirect. */
export function buildAuthorizeUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo",
    state,
    allow_signup: "true",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange the OAuth `code` for a GitHub access token, then fetch the user.
 * Returns null on any failure (the token is never logged).
 */
export async function exchangeCodeForSession(
  params: { code: string; state: string },
  redirectUri: string,
  env: AuthEnv,
): Promise<SessionPayload | null> {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return null;

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "handoff-oauth",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: params.code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) return null;

  const tokenJson = (await tokenRes.json().catch(() => null)) as {
    access_token?: string;
  } | null;
  const token = tokenJson?.access_token;
  if (!token) return null;

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "handoff-oauth",
    },
  });
  if (!userRes.ok) return null;

  const userParsed = githubUser.safeParse(await userRes.json().catch(() => null));
  if (!userParsed.success) return null;

  return {
    token,
    githubId: userParsed.data.id,
    login: userParsed.data.login,
    name: userParsed.data.name ?? null,
    avatarUrl: userParsed.data.avatar_url ?? null,
  };
}

/** Validate raw callback query params (CSRF state is checked separately). */
export function parseCallbackParams(
  search: URLSearchParams,
): { code: string; state: string } | null {
  const parsed = githubCallbackParams.safeParse({
    code: search.get("code") ?? undefined,
    state: search.get("state") ?? undefined,
  });
  return parsed.success ? parsed.data : null;
}
