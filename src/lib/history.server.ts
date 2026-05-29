/**
 * Server-only per-account history store (HOFF-P3-06 #33 + HOFF-P3-07 #34).
 *
 * Postgres-backed CRUD over the `users` / `meetings` / `handoffs` tables, keyed
 * by the GitHub numeric id from the signed session. All queries are scoped to
 * the calling user. Imports db.server.ts (postgres), so server-only — never in a
 * client bundle. The HTTP routes that call these live in src/server.ts.
 */
import { getSql } from "./db.server";

export type HistoryListItem = {
  id: string;
  title: string | null;
  createdAt: string;
};

export type HistoryDetail = {
  id: string;
  title: string | null;
  createdAt: string;
  response: unknown;
};

type SessionUser = {
  githubId: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
};

/**
 * Upsert a user by github_id and return the internal users.id. Used on login and
 * before any write so a session always has a backing row.
 */
export async function upsertUser(user: SessionUser): Promise<number> {
  const sql = getSql();
  const rows = await sql<{ id: string }[]>`
    INSERT INTO users (github_id, login, name, avatar_url)
    VALUES (${user.githubId}, ${user.login}, ${user.name}, ${user.avatarUrl})
    ON CONFLICT (github_id) DO UPDATE
      SET login = EXCLUDED.login,
          name = EXCLUDED.name,
          avatar_url = EXCLUDED.avatar_url
    RETURNING id
  `;
  return Number(rows[0].id);
}

/** List the user's handoffs, newest first. */
export async function listHistory(user: SessionUser, limit = 50): Promise<HistoryListItem[]> {
  const sql = getSql();
  const userId = await upsertUser(user);
  const rows = await sql<{ id: string; title: string | null; created_at: Date }[]>`
    SELECT id, title, created_at
    FROM handoffs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.created_at.toISOString(),
  }));
}

/** Fetch one handoff (full response), scoped to the user. Null if not theirs. */
export async function getHistoryItem(user: SessionUser, id: string): Promise<HistoryDetail | null> {
  const sql = getSql();
  const userId = await upsertUser(user);
  const rows = await sql<
    { id: string; title: string | null; created_at: Date; response: unknown }[]
  >`
    SELECT id, title, created_at, response
    FROM handoffs
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    createdAt: r.created_at.toISOString(),
    response: r.response,
  };
}

/** Save a run: insert a meeting + handoff for the user. Returns the handoff id. */
export async function saveHistory(
  user: SessionUser,
  input: { title: string | null; request: unknown; response: unknown; sourceType?: string | null },
): Promise<string> {
  const sql = getSql();
  const userId = await upsertUser(user);
  return sql.begin(async (tx) => {
    const meetings = await tx<{ id: string }[]>`
      INSERT INTO meetings (user_id, title, source_type)
      VALUES (${userId}, ${input.title}, ${input.sourceType ?? null})
      RETURNING id
    `;
    const handoffs = await tx<{ id: string }[]>`
      INSERT INTO handoffs (user_id, meeting_id, title, request, response)
      VALUES (
        ${userId},
        ${meetings[0].id},
        ${input.title},
        ${tx.json(input.request as never)},
        ${tx.json(input.response as never)}
      )
      RETURNING id
    `;
    return handoffs[0].id;
  });
}

/** Delete one of the user's handoffs. Returns true if a row was deleted. */
export async function deleteHistory(user: SessionUser, id: string): Promise<boolean> {
  const sql = getSql();
  const userId = await upsertUser(user);
  const rows = await sql`
    DELETE FROM handoffs
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `;
  return rows.count > 0;
}

/** Bulk-insert localStorage history once (login migration). Returns inserted count. */
export async function migrateHistory(
  user: SessionUser,
  items: Array<{ title: string | null; request: unknown; response: unknown; createdAt?: string }>,
): Promise<number> {
  if (items.length === 0) return 0;
  const sql = getSql();
  const userId = await upsertUser(user);
  return sql.begin(async (tx) => {
    let migrated = 0;
    for (const item of items) {
      const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();
      const validCreatedAt = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
      const meetings = await tx<{ id: string }[]>`
        INSERT INTO meetings (user_id, title, created_at)
        VALUES (${userId}, ${item.title}, ${validCreatedAt})
        RETURNING id
      `;
      await tx`
        INSERT INTO handoffs (user_id, meeting_id, title, request, response, created_at)
        VALUES (
          ${userId},
          ${meetings[0].id},
          ${item.title},
          ${tx.json(item.request as never)},
          ${tx.json(item.response as never)},
          ${validCreatedAt}
        )
      `;
      migrated += 1;
    }
    return migrated;
  });
}
