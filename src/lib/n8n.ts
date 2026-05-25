const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
const ENABLE_DEMO_FALLBACK =
  String(import.meta.env.VITE_ENABLE_DEMO_FALLBACK ?? "true").toLowerCase() !== "false";

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

function buildDemoFallback(data: UpflowRequest): Record<string, unknown> {
  const title = data.meetingTitle || "데모 미팅";
  return {
    _demoFallback: "DEMO_FALLBACK_USED",
    meetingUnderstanding: {
      goal: `${title}의 핵심 목표 정리 (데모 fallback)`,
      customerContext: "공개 Lovable 데모용 응답입니다. 실제 n8n webhook이 연결되면 실사용 결과로 대체됩니다.",
      keyDecisions: ["데모 fallback으로 UI 흐름 검증", "실제 LLM 응답은 webhook 연결 후 사용"],
      requirements: ["webhook URL 환경변수 설정", "공개 접근 가능한 n8n 인스턴스"],
      missingInfo: ["실제 고객 상세 컨텍스트", "live n8n endpoint"],
      risks: ["로컬 또는 임시 tunnel URL은 공개 사용자에게 도달 불가"],
    },
    deliverablePack: {
      type: data.deliveryType,
      title: `${title} - 데모 산출물`,
      customerMessage: "안녕하세요, 데모 응답입니다. 실제 결과는 webhook 연결 후 생성됩니다.",
      brief: "이 응답은 demo fallback입니다. UI 4패널 구조 검증용입니다.",
      tasks: ["webhook URL 확보", "환경변수 갱신", "fallback 비활성화 후 재검증"],
    },
    executionMemory: {
      previousContextUsed: false,
      nextActions: ["VITE_N8N_WEBHOOK_URL을 안정적인 공개 URL로 교체"],
      memoryToPersist: ["demo fallback이 사용됨"],
      continuationPrompt: "실제 webhook 연결 후 동일 입력으로 재실행해 결과 비교",
    },
    harness: {
      doneEvidence: ["UI 4패널 렌더링 확인"],
      missingEvidence: ["실제 n8n + Upstage 응답"],
      qualityChecklist: ["webhook 200 OK", "응답 success: true", "4패널 모두 채워짐"],
      nextVerificationStep: "stable webhook URL로 VITE_ENABLE_DEMO_FALLBACK=false 설정 후 재실행",
    },
  };
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
    if (ENABLE_DEMO_FALLBACK) {
      return buildDemoFallback(data);
    }
    throw new Error(
      "VITE_N8N_WEBHOOK_URL이 비어있거나 localhost입니다. 공개 접근 가능한 n8n webhook URL을 설정하거나 VITE_ENABLE_DEMO_FALLBACK=true를 사용하세요.",
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
    if (ENABLE_DEMO_FALLBACK) {
      return buildDemoFallback(data);
    }
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("n8n 호출 timeout (20초 초과)");
    }
    throw e;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    if (ENABLE_DEMO_FALLBACK) {
      return buildDemoFallback(data);
    }
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
