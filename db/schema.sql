-- Handoff Postgres schema (HOFF-P3-06 #33 + HOFF-P3-07 #34).
-- Per-account meeting + handoff-run history. Idempotent: safe to re-run.
-- Applied by db/migrate.mjs (`bun run db:migrate`) against DATABASE_URL.

-- GitHub-identified users. github_id is the stable key (numeric id from the
-- GET https://api.github.com/user response), not the mutable login.
CREATE TABLE IF NOT EXISTS users (
  id          bigserial PRIMARY KEY,
  github_id   bigint UNIQUE NOT NULL,
  login       text,
  name        text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- A meeting / source the user fed into Handoff. One per saved run.
CREATE TABLE IF NOT EXISTS meetings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       text,
  source_type text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- A single Handoff pipeline run: the request that produced it and the full
-- response. response is the payload the History view reopens.
CREATE TABLE IF NOT EXISTS handoffs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_id  uuid REFERENCES meetings(id) ON DELETE SET NULL,
  title       text,
  request     jsonb,
  response    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS handoffs_user_created_idx
  ON handoffs (user_id, created_at DESC);
