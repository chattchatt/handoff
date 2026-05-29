/**
 * Client-side server-history fetchers (HOFF-P3-06 #33 + HOFF-P3-07 #34).
 *
 * Thin wrappers over the /api/history routes (handled server-side in
 * src/server.ts). Auth rides on the signed session cookie — credentials:
 * "same-origin" — so no token/DB detail is ever exposed to the client. Used by
 * HandoffDemo when the visitor is logged in; anonymous users stay on localStorage.
 */
import type { HandoffResponse } from "./n8n";

export type ServerHistoryListItem = {
  id: string;
  title: string | null;
  createdAt: string;
};

export type ServerHistoryDetail = {
  id: string;
  title: string | null;
  createdAt: string;
  response: HandoffResponse;
};

export async function fetchServerHistory(): Promise<ServerHistoryListItem[]> {
  const res = await fetch("/api/history", { credentials: "same-origin" });
  if (!res.ok) throw new Error(`history list failed (${res.status})`);
  return (await res.json()) as ServerHistoryListItem[];
}

export async function fetchServerHistoryItem(id: string): Promise<ServerHistoryDetail> {
  const res = await fetch(`/api/history/${encodeURIComponent(id)}`, {
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(`history item failed (${res.status})`);
  return (await res.json()) as ServerHistoryDetail;
}

export async function saveServerHistory(input: {
  title: string;
  request: unknown;
  response: HandoffResponse;
  sourceType?: string;
}): Promise<{ id: string }> {
  const res = await fetch("/api/history", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`history save failed (${res.status})`);
  return (await res.json()) as { id: string };
}

export async function deleteServerHistory(id: string): Promise<void> {
  const res = await fetch(`/api/history/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(`history delete failed (${res.status})`);
}

export async function migrateServerHistory(
  items: Array<{ title: string; request: unknown; response: HandoffResponse; createdAt?: string }>,
): Promise<{ migrated: number }> {
  const res = await fetch("/api/history/migrate", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`history migrate failed (${res.status})`);
  return (await res.json()) as { migrated: number };
}
