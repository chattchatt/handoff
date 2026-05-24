const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

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
  if (!N8N_WEBHOOK_URL) {
    throw new Error(
      "VITE_N8N_WEBHOOK_URL 환경변수가 설정되지 않았습니다. Lovable 환경 변수에서 추가해주세요.",
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
    response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: params,
      headers: {
        // Skip localtunnel's reminder interstitial (HTTP 511 otherwise).
        "bypass-tunnel-reminder": "true",
      },
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

export const SAMPLE_TRANSCRIPT = `[고객] 저희가 다음 분기에 신규 랜딩 페이지를 새로 만들려고 합니다. 기존 사이트는 컨버전이 낮고 메시지가 명확하지 않다는 피드백이 많아요.
[PM] 타겟 고객군은 누구로 잡고 계세요?
[고객] B2B SaaS의 운영팀 리더 중심입니다. 데모 신청 전환이 핵심 KPI예요.
[PM] 기존 디자인 가이드는 유지하시나요?
[고객] 색상 토큰은 유지하고, 타이포와 레이아웃은 새로 갑니다. 11월 첫째 주까지 1차 시안 필요해요.
[PM] 알겠습니다. 메인 메시지, 사회적 증거, CTA 흐름까지 정리해서 브리프 드리겠습니다.
[고객] 좋아요. 다음 미팅 때 PRD 초안도 같이 봤으면 합니다.`;
