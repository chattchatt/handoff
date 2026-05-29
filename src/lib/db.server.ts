/**
 * Server-only Postgres client (HOFF-P3-06 #33 + HOFF-P3-07 #34).
 *
 * A lazy singleton postgres.js connection read from DATABASE_URL. SSL is required
 * (Railway Postgres). Missing DATABASE_URL is tolerated at import time — the app
 * still boots (login / SSR / n8n / issue publishing keep working). The error is
 * only thrown when a DB operation is actually attempted, so history features
 * degrade gracefully instead of crashing the server.
 *
 * This module imports `postgres`, so it MUST only be used inside server code
 * (src/server.ts API routes) — never imported into a client bundle. The
 * connection string is never logged.
 */
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

let client: Sql | undefined;

function databaseUrl(): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  return env?.DATABASE_URL;
}

/** True when DATABASE_URL is configured; lets callers no-op history when absent. */
export function isDatabaseConfigured(): boolean {
  return Boolean(databaseUrl());
}

/**
 * Return the lazy singleton postgres client. Throws a clear error only when
 * called without DATABASE_URL set (never at import time).
 */
export function getSql(): Sql {
  if (client) return client;
  const url = databaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set; history features are unavailable.");
  }
  client = postgres(url, {
    ssl: "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return client;
}
