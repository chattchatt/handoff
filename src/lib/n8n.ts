const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

/**
 * ── n8n webhook contract (for the team editing the workflow at n8n.cloud) ──
 *
 * REQUEST (multipart/form-data, POST):
 *   Text parts:  meetingTitle, transcript, deliveryType, recipient, tone, sourceFileName
 *   Binary part: "sourceFile" — the raw uploaded document (pdf/docx/xlsx/txt/md).
 *                Feed this binary into Upstage Document Parse → Information Extract → Solar.
 *                Do NOT rely on transcript text alone; the raw file is the API input now.
 *   (The browser no longer pre-extracts text on the happy path. Browser extraction is a
 *    client-side FALLBACK that only runs when this request itself fails to reach n8n.)
 *
 * RESPONSE (application/json) — populate `pipeline` with REAL Upstage values:
 *   pipeline.documentParse:     { pageCount, charsExtracted, sourceType }
 *   pipeline.informationExtract:{ schemaFields, fieldsPopulated }
 *   pipeline.solar:             { model, deliverablesGenerated }
 *   A stage is rendered as "awaiting/failed" when absent — never fake these numbers.
 *
 * On ANY node failure, return:
 *   _error: { code, message, stage }
 *   where `stage` names the failing Upstage step:
 *     "documentParse" | "informationExtract" | "solar" (or another step label).
 *   The UI routes responses carrying `_error` to the error view and names the stage.
 */
export type HandoffRequest = {
  meetingTitle: string;
  transcript: string;
  deliveryType: "website_brief" | "followup_email";
  recipient?: string;
  tone?: "professional" | "friendly" | "direct";
  sourceFileName?: string;
  /** Raw uploaded document, sent as the multipart "sourceFile" binary part. */
  sourceFile?: File;
};

export type HandoffResponse = {
  success?: boolean;
  meetingUnderstanding: {
    goal: string;
    customerContext: string;
    keyDecisions: string[];
    requirements: string[];
    missingInfo: string[];
    risks: string[];
  };
  deliverablePack: {
    type: string;
    title: string;
    customerMessage: string;
    brief: string;
    lovablePrompt?: string;
    prd?: string;
    tasks: string[];
  };
  executionMemory: {
    previousContextUsed: boolean;
    nextActions: string[];
    memoryToPersist: string[];
    continuationPrompt: string;
  };
  harness: {
    doneEvidence: string[];
    missingEvidence: string[];
    qualityChecklist: string[];
    nextVerificationStep: string;
  };
  pipeline?: {
    documentParse?: { pageCount?: number; charsExtracted?: number; sourceType?: string };
    informationExtract?: { schemaFields?: number; fieldsPopulated?: number };
    solar?: { model?: string; deliverablesGenerated?: number };
  };
  _warnings?: string[];
  _error?: {
    code?: string;
    message?: string;
    preview?: string;
    /** Which Upstage step failed: "documentParse" | "informationExtract" | "solar" | etc. */
    stage?: string;
  } | null;
  _raw?: unknown;
};

function isLocalWebhookUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

export async function callN8n(data: HandoffRequest): Promise<unknown> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error("VITE_N8N_WEBHOOK_URL 환경변수가 설정되지 않았습니다.");
  }

  if (isLocalWebhookUrl(N8N_WEBHOOK_URL)) {
    throw new Error(
      `Hosted Lovable에서는 localhost webhook URL을 사용할 수 없습니다. URL: ${N8N_WEBHOOK_URL}`,
    );
  }

  // Real 3-API pipeline (Document Parse -> Information Extraction -> Solar) runs
  // server-side in n8n; Document Parse alone can take 10-30s on a PDF, so the
  // client must wait well past the old 20s (Solar-only) budget.
  const REQUEST_TIMEOUT_MS = 120000;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // multipart/form-data so the raw file reaches n8n alongside the text fields.
  // Content-Type is intentionally NOT set — fetch adds the multipart boundary.
  const body = new FormData();
  const { sourceFile, ...textFields } = data;
  Object.entries(textFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.set(key, String(value));
  });
  if (sourceFile) {
    body.set("sourceFile", sourceFile, sourceFile.name);
  }

  let response: Response;
  try {
    response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body,
      signal: controller.signal,
    });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? "n8n 호출 시간이 120초를 초과했습니다."
        : error instanceof Error
          ? error.message
          : "n8n 호출 중 네트워크 오류가 발생했습니다.";
    throw new Error(`${message} URL: ${N8N_WEBHOOK_URL}`);
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(
      `n8n 호출 실패: ${response.status} ${response.statusText}. URL: ${N8N_WEBHOOK_URL}`,
    );
  }

  const payload = await response.json();
  return payload.data ?? payload;
}
