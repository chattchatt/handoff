const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

function isUnreachableWebhook(url: string | undefined): boolean {
  if (!url) return true;
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "0.0.0.0") {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

export type DeliveryType = "website_brief" | "followup_email" | "prd" | "task_package";
export type Tone = "professional" | "friendly" | "direct";

export type UpflowRequest = {
  meetingTitle: string;
  transcript: string;
  deliveryType: DeliveryType;
  recipient?: string;
  tone?: Tone;
};

export type ExecutionMemoryResponse = {
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
};

export async function callN8n(data: UpflowRequest): Promise<unknown> {
  if (isUnreachableWebhook(N8N_WEBHOOK_URL)) {
    throw new Error(
      "VITE_N8N_WEBHOOK_URL이 설정되지 않았거나 localhost입니다. 공개 접근 가능한 n8n webhook URL을 설정하세요.",
    );
  }

  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  let response: Response;
  try {
    response = await fetch(N8N_WEBHOOK_URL as string, {
      method: "POST",
      body: params,
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("n8n 호출 timeout (20초 초과)");
    }
    throw e;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`n8n 호출 실패: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return (payload && typeof payload === "object" && "data" in payload)
    ? (payload as { data: unknown }).data
    : payload;
}

export const N8N_WEBHOOK_URL_DEBUG = N8N_WEBHOOK_URL ?? "(설정되지 않음)";

// Safe normalizer for unknown JSON shapes.
export function normalizeResponse(raw: unknown): ExecutionMemoryResponse {
  const r = (raw ?? {}) as Record<string, unknown>;
  const mu = (r.meetingUnderstanding ?? {}) as Record<string, unknown>;
  const dp = (r.deliverablePack ?? {}) as Record<string, unknown>;
  const em = (r.executionMemory ?? {}) as Record<string, unknown>;
  const h = (r.harness ?? {}) as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === "string" && v.length ? v : "-");
  const arr = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(x)) : []);

  return {
    meetingUnderstanding: {
      goal: str(mu.goal),
      customerContext: str(mu.customerContext),
      keyDecisions: arr(mu.keyDecisions),
      requirements: arr(mu.requirements),
      missingInfo: arr(mu.missingInfo),
      risks: arr(mu.risks),
    },
    deliverablePack: {
      type: str(dp.type),
      title: str(dp.title),
      customerMessage: str(dp.customerMessage),
      brief: str(dp.brief),
      lovablePrompt: typeof dp.lovablePrompt === "string" ? dp.lovablePrompt : undefined,
      prd: typeof dp.prd === "string" ? dp.prd : undefined,
      tasks: arr(dp.tasks),
    },
    executionMemory: {
      previousContextUsed: Boolean(em.previousContextUsed),
      nextActions: arr(em.nextActions),
      memoryToPersist: arr(em.memoryToPersist),
      continuationPrompt: str(em.continuationPrompt),
    },
    harness: {
      doneEvidence: arr(h.doneEvidence),
      missingEvidence: arr(h.missingEvidence),
      qualityChecklist: arr(h.qualityChecklist),
      nextVerificationStep: str(h.nextVerificationStep),
    },
  };
}
