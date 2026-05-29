/**
 * Server-only session reader (HOFF-P3-05).
 *
 * Used by server functions (e.g. issue publishing) that run inside a TanStack
 * Start request context. It reads the signed session cookie via the Start
 * request helpers and the signing secret from the server environment, then
 * returns the verified session payload (including the GitHub access token).
 *
 * This module imports `@tanstack/react-start/server`, so it MUST only be used
 * inside server functions / server code — never imported into a client bundle.
 */
import { getCookie } from "@tanstack/react-start/server";

import { SESSION_COOKIE, readSession, type AuthEnv, type SessionPayload } from "./auth";

/**
 * Read server-side auth secrets. On Cloudflare with nodejs_compat, secrets
 * bound via wrangler are exposed on process.env; src/server.ts also mirrors the
 * Worker env binding onto process.env so this is consistent in both entry paths.
 */
function authEnv(): AuthEnv {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  return {
    GITHUB_CLIENT_ID: env?.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: env?.GITHUB_CLIENT_SECRET,
    SESSION_SECRET: env?.SESSION_SECRET,
  };
}

/**
 * Return the verified session for the current request, or null when the visitor
 * is anonymous / the cookie is missing or tampered with. The returned token is
 * for server-side use only and must never be sent to the client.
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieValue = getCookie(SESSION_COOKIE);
  return readSession(cookieValue, authEnv());
}
