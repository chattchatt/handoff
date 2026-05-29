import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { HandoffResponse } from "./n8n";

const publishIssueInput = z.object({
  owner: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/, "invalid owner"),
  repo: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9._-]+$/, "invalid repo"),
  token: z.string().trim().min(1),
  title: z.string().trim().min(1).max(256),
  body: z.string().max(60000),
  labels: z.array(z.string().trim().min(1)).optional(),
});

export type PublishIssueInput = z.infer<typeof publishIssueInput>;

export type PublishIssueResult = {
  ok: boolean;
  issueUrl?: string;
  issueNumber?: number;
  errorMessage?: string;
};

// Friendly, token-free messages. The access token is never echoed back in any branch.
function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return "GitHub 인증이 만료됐습니다. GitHub를 다시 연결해 주세요. (Authentication expired — reconnect GitHub.)";
    case 403:
      return "권한이 없거나 요청 한도를 초과했습니다. repo 권한과 rate limit을 확인하세요. (Forbidden — check repo permission and rate limits.)";
    case 404:
      return "레포지토리를 찾을 수 없거나 접근 권한이 없습니다. (Repository not found or no access.)";
    case 422:
      return "이슈 내용을 검증할 수 없습니다. 제목/본문 또는 라벨을 확인하세요. (Validation failed — check the title, body, or labels.)";
    default:
      return `GitHub 이슈 생성에 실패했습니다 (HTTP ${status}). (Failed to create the GitHub issue.)`;
  }
}

const githubApiHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

export type GithubRepo = { fullName: string; private: boolean };

/**
 * List repositories the signed-in user can open issues on, newest first.
 * Browser-side fetch using the OAuth session token (GitHub REST supports CORS).
 */
export async function listGithubRepos(token: string): Promise<GithubRepo[]> {
  const res = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
    { headers: githubApiHeaders(token) },
  );
  if (!res.ok) throw new Error(messageForStatus(res.status));
  const json = (await res.json()) as Array<{ full_name?: string; private?: boolean }>;
  return json
    .filter((r): r is { full_name: string; private?: boolean } => Boolean(r.full_name))
    .map((r) => ({ fullName: r.full_name, private: Boolean(r.private) }));
}

/**
 * Create a GitHub issue directly from the browser using the OAuth session token.
 * Replaces the server function so it works on hosts that don't run server code
 * (e.g. lovable.app). The token is used only for this request and never stored.
 */
export async function createGithubIssue(args: {
  token: string;
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels?: string[];
}): Promise<PublishIssueResult> {
  const payload: Record<string, unknown> = { title: args.title, body: args.body };
  if (args.labels && args.labels.length > 0) payload.labels = args.labels;

  let response: Response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(args.owner)}/${encodeURIComponent(args.repo)}/issues`,
      {
        method: "POST",
        headers: { ...githubApiHeaders(args.token), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  } catch {
    return {
      ok: false,
      errorMessage:
        "GitHub에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요. (Could not reach GitHub — check your connection and retry.)",
    };
  }

  if (!response.ok) return { ok: false, errorMessage: messageForStatus(response.status) };

  const json = (await response.json().catch(() => null)) as {
    html_url?: string;
    number?: number;
  } | null;

  return { ok: true, issueUrl: json?.html_url, issueNumber: json?.number };
}

/**
 * Server function: create a GitHub issue using a per-publish PAT.
 *
 * The token is an argument only. It is never persisted, never logged, and
 * never returned in the response (including error branches). Uses plain fetch
 * against api.github.com so it runs cleanly on the Cloudflare Worker runtime.
 */
export const publishGithubIssue = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => publishIssueInput.parse(data))
  .handler(async ({ data }): Promise<PublishIssueResult> => {
    const { owner, repo, token, title, body, labels } = data;

    const payload: Record<string, unknown> = { title, body };
    if (labels && labels.length > 0) payload.labels = labels;

    let response: Response;
    try {
      response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "handoff-issue-publisher",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
    } catch {
      return {
        ok: false,
        errorMessage:
          "GitHub에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요. (Could not reach GitHub — check your connection and retry.)",
      };
    }

    if (!response.ok) {
      return { ok: false, errorMessage: messageForStatus(response.status) };
    }

    const json = (await response.json().catch(() => null)) as {
      html_url?: string;
      number?: number;
    } | null;

    return {
      ok: true,
      issueUrl: json?.html_url,
      issueNumber: json?.number,
    };
  });

/**
 * Map a Solar pipeline result (HandoffResponse) into a GitHub issue title/body.
 *
 * This is a downstream consumer of the existing response — it does NOT touch
 * the Upstage Parse->Extract->Solar pipeline. The output is a prefill the user
 * can edit before publishing.
 */
export function buildIssueContent(
  result: HandoffResponse,
  meetingTitle: string,
  lang: "ko" | "en",
): { title: string; body: string } {
  const title =
    result.deliverablePack.title?.trim() ||
    meetingTitle.trim() ||
    (lang === "ko" ? "Handoff 실행 요청" : "Handoff execution request");

  const brief =
    result.deliverablePack.brief?.trim() || result.deliverablePack.customerMessage?.trim() || "";

  const checklistHeading = lang === "ko" ? "## 체크리스트" : "## Checklist";
  const nextActionsHeading = lang === "ko" ? "## 다음 액션" : "## Next actions";
  const continuationHeading = lang === "ko" ? "## 이어받기 프롬프트" : "## Continuation prompt";

  const sections: string[] = [];

  if (brief) sections.push(brief);

  const tasks = result.deliverablePack.tasks ?? [];
  if (tasks.length > 0) {
    sections.push([checklistHeading, ...tasks.map((task) => `- [ ] ${task}`)].join("\n"));
  }

  const nextActions = result.executionMemory.nextActions ?? [];
  if (nextActions.length > 0) {
    sections.push([nextActionsHeading, ...nextActions.map((action) => `- ${action}`)].join("\n"));
  }

  const continuationPrompt = result.executionMemory.continuationPrompt?.trim();
  if (continuationPrompt) {
    sections.push([continuationHeading, "```", continuationPrompt, "```"].join("\n"));
  }

  return { title, body: sections.join("\n\n") };
}
