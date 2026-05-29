// Schema migration runner (HOFF-P3-06 #33 + HOFF-P3-07 #34).
//
// Applies db/schema.sql to the Postgres database at DATABASE_URL. The schema is
// idempotent (CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS), so this
// is safe to run repeatedly — e.g. once after the first Railway deploy.
//
//   bun run db:migrate   (or: node db/migrate.mjs)
//
// SSL: defaults to "require" (Railway Postgres). For a local Postgres without
// TLS, set PGSSL=disable.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Aborting migration.");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, "schema.sql"), "utf8");

const ssl = process.env.PGSSL === "disable" ? false : "require";
const sql = postgres(url, { ssl, max: 1 });

try {
  await sql.unsafe(schema);
  console.log("Migration applied: users, meetings, handoffs.");
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
