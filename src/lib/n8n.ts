const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export type HandoffRequest = {
  meetingTitle: string;
  transcript: string;
  deliveryType: "website_brief" | "followup_email";
  recipient?: string;
  tone?: "professional" | "friendly" | "direct";
  sourceFileName?: string;
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

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 20000);

  const body = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.set(key, String(value));
  });

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
        ? "n8n 호출 시간이 20초를 초과했습니다."
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
