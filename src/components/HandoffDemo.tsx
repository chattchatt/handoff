import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { callN8n, type HandoffRequest, type HandoffResponse } from "@/lib/n8n";
import { buildIssueContent, publishGithubIssue } from "@/lib/github";
import { Toaster } from "@/components/ui/sonner";

type WorkbenchView =
  | "input"
  | "loading"
  | "dashboard"
  | "meeting"
  | "delivery"
  | "memory"
  | "evidence"
  | "history"
  | "error";
type HistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  inputType: string;
  deliveryLabel: string;
  summary: string;
  response?: HandoffResponse;
  meetingTitle?: string;
  recipient?: string;
  transcript?: string;
};
const HISTORY_KEY = "handoff.executionHistory.v2";
type Lang = "ko" | "en";

const deliveryOptionsByLang: Record<
  Lang,
  Array<{ label: string; description: string; value: HandoffRequest["deliveryType"] }>
> = {
  ko: [
    {
      label: "작업 브리프",
      description: "목표·맥락·후속 작업을 한 장으로 정리",
      value: "website_brief",
    },
    {
      label: "후속 작업 체크리스트",
      description: "이어받는 담당자가 바로 처리할 Todo 중심 출력",
      value: "followup_email",
    },
  ],
  en: [
    {
      label: "Work brief",
      description: "Goal, context, and follow-up work in one brief",
      value: "website_brief",
    },
    {
      label: "Follow-up checklist",
      description: "Todo-first output for the next executor",
      value: "followup_email",
    },
  ],
};

const navItemsByLang: Record<Lang, Array<{ id: WorkbenchView; label: string; eyebrow: string }>> = {
  ko: [
    { id: "dashboard", label: "대시보드", eyebrow: "Overview" },
    { id: "input", label: "입력", eyebrow: "Context" },
    { id: "meeting", label: "목표/맥락", eyebrow: "Goal State" },
    { id: "delivery", label: "AI 프롬프트", eyebrow: "Prompt" },
    { id: "memory", label: "실행 기억", eyebrow: "Memory" },
    { id: "evidence", label: "근거 자료", eyebrow: "Evidence" },
    { id: "history", label: "히스토리", eyebrow: "Archive" },
  ],
  en: [
    { id: "dashboard", label: "Dashboard", eyebrow: "Overview" },
    { id: "input", label: "Input", eyebrow: "Context" },
    { id: "meeting", label: "Goal / Context", eyebrow: "Goal State" },
    { id: "delivery", label: "AI Prompt", eyebrow: "Prompt" },
    { id: "memory", label: "Execution Memory", eyebrow: "Memory" },
    { id: "evidence", label: "Context / Evidence", eyebrow: "Evidence" },
    { id: "history", label: "History", eyebrow: "Archive" },
  ],
};

const pipelineStepsByLang: Record<Lang, string[]> = {
  ko: [
    "Input Context",
    "n8n Runtime",
    "Upstage Analysis",
    "Execution Memory",
    "Evidence",
    "Follow-up Work",
  ],
  en: [
    "Input Context",
    "n8n Runtime",
    "Upstage Analysis",
    "Execution Memory",
    "Evidence",
    "Follow-up Work",
  ],
};

const workbenchCopy = {
  ko: {
    sidebarBody: "업무 맥락을 다음 Agent Run이 이어받을 실행 상태로 정리합니다.",
    headerEyebrow: "Agent Handoff Workbench",
    headerTitle: "이어받는 담당자가 사용할 기억, 근거, 후속 작업",
    headerBody:
      "회의록, 고객 메모, Slack 논의, 이슈 설명, 작업 요청을 실행 가능한 Agent Run 상태로 변환합니다.",
    waiting: "입력 대기",
    runtimeTitle: "입력 맥락을 실행 기억으로 변환 중입니다",
    runtimeSummary:
      "n8n runtime이 Upstage 분석을 호출하고, 결과를 실행 기억과 근거 자료로 조립합니다.",
    errorEyebrow: "오류",
    errorTitle: "Handoff runtime 호출이 완료되지 않았습니다",
    unknownError: "알 수 없는 오류가 발생했습니다.",
    errorAction:
      "환경변수 VITE_N8N_WEBHOOK_URL, n8n production webhook 활성화 상태, Upstage credential 연결을 확인한 뒤 다시 실행하세요.",
    backToInput: "입력으로 돌아가기",
    inputTitle: "다음 Agent에게 넘길 업무 맥락",
    inputSummary: "회의록, PDF, 문서 내용을 넣으면 HandOff가 AI 작업용 실행 기억으로 정리합니다.",
    inputAction:
      "Handoff가 핵심 요약, 결정 사항, 후속 작업, 보완 필요 사항, 근거 자료로 구조화합니다.",
    workName: "작업 이름",
    workNamePlaceholder: "예: 온보딩 개선 논의",
    recipient: "수신자/대상",
    recipientPlaceholder: "이어받는 담당자 이름 또는 역할 (전송용 X)",
    optional: "선택",
    requestType: "결과 유형",
    workContext: "업무 맥락",
    fileUpload: "문서 업로드",
    fileHint:
      ".txt, .pdf 파일을 우선 지원합니다. PDF·DOCX·XLSX는 브라우저에서 본문을 추출해 업무 맥락에 추가하고, .md도 동일하게 자동 추가됩니다. HWP는 파일명만 기록됩니다.",
    fileLoaded: "파일 내용을 업무 맥락에 추가했습니다.",
    pdfExtracted: "PDF에서 본문 {count}자를 업무 맥락에 추가했습니다.",
    pdfExtractFailed:
      "PDF 본문 추출에 실패했습니다. 파일명만 맥락에 추가했습니다. 텍스트 기반이 아닌 스캔 PDF일 수 있습니다.",
    docxExtracted: "DOCX에서 본문 {count}자를 업무 맥락에 추가했습니다.",
    docxExtractFailed:
      "DOCX 본문 추출에 실패했습니다. 파일이 손상되었거나 호환되지 않는 형식일 수 있습니다.",
    xlsxExtracted: "Excel 시트 {count}자를 CSV 형식으로 업무 맥락에 추가했습니다.",
    xlsxExtractFailed: "Excel 파일 처리에 실패했습니다. .xlsx 또는 .xls 형식만 지원합니다.",
    hwpUnsupported:
      "HWP/HWPX 본문 추출은 현재 미지원입니다. 파일명만 맥락에 추가했습니다. .docx 또는 .pdf로 변환해 다시 업로드해주세요.",
    unsupportedFile: "지원 형식은 TXT, MD, PDF, DOCX, XLSX입니다 (HWP는 파일명만 기록).",
    selectedFile: "선택 파일",
    contextPlaceholder:
      "회의록, 고객 메모, Slack 논의, 이슈 설명, 작업 요청을 붙여넣으세요. Handoff가 다음 Agent Run이 이어받을 실행 기억으로 정리합니다.",
    inferredType: "입력 유형 추정",
    creating: "실행 기억 생성 중...",
    create: "실행 기억 만들기",
    status: "현재 상태",
    inputType: "입력 유형",
    deliverables: "산출물",
    evidenceItems: "증거 항목",
    nextRun: "후속 작업",
    countSuffix: "개",
    evidence: "근거",
    nextAction: "다음 액션",
    goalState: "목표 상태",
    contextUsed: "사용한 맥락",
    executionRequests: "후속 작업",
    evidenceLedger: "근거 자료",
    nextExecution: "AI 호출용 프롬프트",
    agentPrompt: "AI 에이전트 실행 프롬프트",
    agentPromptSummary:
      "이 프롬프트를 AI 에이전트에게 그대로 전달하면 작업을 바로 실행합니다. 사람용 Todo가 아니라 실행 입력입니다.",
    agentPromptCopy: "프롬프트 복사",
    agentPromptCopied: "복사됨",
    agentPromptEmpty: "AI 에이전트 실행 프롬프트가 비어 있습니다.",
    resumePrompt: "이어받기 프롬프트 (resume)",
    resumePromptCopy: "이어받기 복사",
    resumePromptHint: "다음 세션을 이어받을 때 사용하는 보조 프롬프트입니다.",
    missingContext: "보완 필요 사항",
    risks: "리스크",
    draftMessage: "전달 메시지",
    productDefinition: "제품/작업 정의",
    implementationPrompt: "AI 호출용 프롬프트",
    memoryToKeep: "유지할 기억",
    nextRunItems: "후속 작업 항목",
    continuationPrompt: "이어받기 프롬프트",
    doneEvidence: "완료 증거",
    missingEvidence: "보완 필요 근거",
    qualityChecklist: "검증 체크리스트",
    nextVerification: "다음 검증 단계",
    resultActions: "생성 결과 액션",
    copyResult: "복사하기",
    copiedResult: "복사 완료",
    copyCard: "복사",
    copiedCard: "복사됨",
    importanceConfirmed: "확정",
    importanceAction: "진행 필요",
    importanceReview: "추가 확인",
    importancePrompt: "AI 전달용",
    downloadMd: "Markdown 다운로드",
    savePdf: "PDF 저장",
    newMemory: "새 기억 만들기",
    historyTitle: "최근 실행 기억",
    historySummary:
      "이 브라우저에서 생성한 최근 HandOff 실행 기억입니다. 최대 12개까지 저장됩니다.",
    historyEmpty: "아직 저장된 실행 기억이 없습니다.",
    historyReopen: "다시 보기",
    historyDelete: "삭제",
    historyClearAll: "전체 비우기",
    noItems: "아직 반환된 항목이 없습니다.",
    goalEvidence: "입력 맥락에서 목표와 현재 상태를 추출했습니다.",
    goalAction: "목표와 제약을 확인한 뒤 후속 작업으로 넘기세요.",
    emptyContext: "사용한 맥락이 비어 있습니다.",
    contextEvidence: "결정사항, 요구사항, 보완 필요 사항, 리스크를 분리했습니다.",
    contextAction: "맥락이 부족하면 입력 탭에서 자료를 보강하세요.",
    requestAction: "이어받는 담당자가 처리할 후속 작업 단위로 넘기세요.",
    ledgerSummary: "완료 근거, 보완할 근거, 품질 체크리스트를 분리했습니다.",
    ledgerAction: "다음 검증 단계를 지정하세요.",
    nextRunEmpty: "다음 Agent Run 프롬프트가 비어 있습니다.",
    previousContextYes: "이전 맥락 사용 기록이 있습니다.",
    previousContextNo: "새 입력 맥락 기준으로 실행 상태를 만들었습니다.",
    nextRunAction: "다음 Agent에게 AI 호출용 프롬프트와 근거 자료를 함께 넘기세요.",
    missingContextSummary: "후속 작업 전에 보강하면 좋은 맥락입니다.",
    risksSummary: "후속 작업에 반영해야 할 위험 요소입니다.",
    requestDetailAction: "후속 작업 체크리스트를 다음 Agent Run에 넘기세요.",
    memorySummary: "후속 작업에서도 유지해야 할 결정, 제약, 관찰입니다.",
    nextItemsSummary: "다음 Agent가 바로 이어서 처리할 작업입니다.",
    previousContextLabel: "이전 맥락 사용",
    continuationAction: "다음 Agent Run 시작 시 이 AI 호출용 프롬프트를 함께 전달하세요.",
    doneEvidenceSummary: "완료 판단에 사용된 근거입니다.",
    missingEvidenceSummary: "완료 주장 전에 더 필요한 근거입니다.",
    checklistSummary: "이어받는 담당자가 확인해야 할 품질 기준입니다.",
    nextVerificationEmpty: "다음 검증 단계가 비어 있습니다.",
    verificationAction: "검증 후 근거 자료를 업데이트하세요.",
    publishEyebrow: "Publish",
    publishTitle: "이슈로 발행",
    publishSummary:
      "정리된 실행 기억을 GitHub 이슈로 발행합니다. 발행 시점에 붙여넣는 PAT만 사용하며 어디에도 저장하지 않습니다.",
    publishRepoLabel: "대상 레포지토리",
    publishRepoPlaceholder: "owner/repo (예: octocat/hello-world)",
    publishTokenLabel: "GitHub PAT",
    publishTokenPlaceholder: "ghp_... (저장되지 않음, 발행에만 사용)",
    publishTokenHint:
      "Fine-grained 또는 classic PAT. 브라우저 메모리에만 있다가 발행 후 사라집니다.",
    publishIssueTitleLabel: "이슈 제목",
    publishIssueBodyLabel: "이슈 본문 (Markdown)",
    publishLabelsLabel: "라벨",
    publishLabelsPlaceholder: "쉼표로 구분 (선택, 비워도 됨)",
    publishButton: "GitHub 이슈로 발행",
    publishing: "발행 중...",
    publishSuccess: "이슈를 생성했습니다.",
    publishSuccessLink: "생성된 이슈 보기",
    publishRepoError: "대상 레포지토리를 owner/repo 형식으로 입력하세요.",
    publishMissingFields: "레포지토리, PAT, 제목을 모두 입력하세요.",
    publishUnknownError: "이슈 발행 중 알 수 없는 오류가 발생했습니다.",
  },
  en: {
    sidebarBody: "Turn work context into runnable state your next Agent Run can inherit.",
    headerEyebrow: "Agent Handoff Workbench",
    headerTitle: "Memory, evidence, and next actions for the next executor",
    headerBody:
      "Turn transcripts, customer notes, Slack threads, issues, and requests into a runnable Agent Run state.",
    waiting: "Waiting for input",
    runtimeTitle: "Converting input context into execution memory",
    runtimeSummary:
      "The n8n runtime calls Upstage analysis, then assembles the result into execution memory and context evidence.",
    errorEyebrow: "Error",
    errorTitle: "The Handoff runtime call did not complete",
    unknownError: "An unknown error occurred.",
    errorAction:
      "Check VITE_N8N_WEBHOOK_URL, the active n8n production webhook, and the connected Upstage credential, then run it again.",
    backToInput: "Back to input",
    inputTitle: "Work context to hand to the next Agent",
    inputSummary:
      "Paste meeting notes, PDFs, or documents and HandOff turns them into execution memory for AI work.",
    inputAction:
      "Handoff structures them into summary, decisions, follow-up tasks, missing context, and evidence.",
    workName: "Work name",
    workNamePlaceholder: "Example: onboarding improvement discussion",
    recipient: "Recipient / target",
    recipientPlaceholder: "Next executor's name or role (not used for delivery)",
    optional: "Optional",
    requestType: "Result type",
    workContext: "Work context",
    fileUpload: "Document upload",
    fileHint:
      ".txt and .pdf are the priority formats. PDF/DOCX/XLSX text is extracted in the browser and appended to the work context; .md is appended the same way. HWP records filename only.",
    fileLoaded: "File content was added to the work context.",
    pdfExtracted: "Extracted {count} characters from PDF into the work context.",
    pdfExtractFailed:
      "Could not extract PDF text. Only the filename was added — the file may be a scanned (non-text) PDF.",
    docxExtracted: "Extracted {count} characters from DOCX into the work context.",
    docxExtractFailed:
      "Could not extract DOCX text. The file may be corrupt or in an incompatible format.",
    xlsxExtracted: "Added {count} characters from the Excel sheet as CSV to the work context.",
    xlsxExtractFailed: "Could not process the Excel file. Only .xlsx or .xls is supported.",
    hwpUnsupported:
      "HWP/HWPX text extraction is not supported yet. Only the filename was added — please convert to .docx or .pdf and re-upload.",
    unsupportedFile: "Supported formats: TXT, MD, PDF, DOCX, XLSX (HWP records filename only).",
    selectedFile: "Selected file",
    contextPlaceholder:
      "Paste meeting notes, customer memos, Slack threads, issue descriptions, or work requests. Handoff will turn them into execution memory your next Agent Run can inherit.",
    inferredType: "Inferred input type",
    creating: "Creating execution memory...",
    create: "Create execution memory",
    status: "Current status",
    inputType: "Input type",
    deliverables: "Deliverables",
    evidenceItems: "Evidence items",
    nextRun: "Next run",
    countSuffix: "",
    evidence: "Evidence",
    nextAction: "Next action",
    goalState: "Goal State",
    contextUsed: "Context Used",
    executionRequests: "Follow-up Tasks",
    evidenceLedger: "Context / Evidence",
    nextExecution: "AI Prompt",
    agentPrompt: "AI Agent Run Prompt",
    agentPromptSummary:
      "Hand this prompt to an AI agent and it runs the work directly. This is an execution input, not a human todo list.",
    agentPromptCopy: "Copy prompt",
    agentPromptCopied: "Copied",
    agentPromptEmpty: "The AI agent run prompt is empty.",
    resumePrompt: "Resume prompt",
    resumePromptCopy: "Copy resume",
    resumePromptHint: "Secondary prompt for continuing in the next session.",
    missingContext: "Missing Context",
    risks: "Risks",
    draftMessage: "Draft message",
    productDefinition: "Product / work definition",
    implementationPrompt: "AI prompt",
    memoryToKeep: "Memory to persist",
    nextRunItems: "Next run items",
    continuationPrompt: "Continuation prompt",
    doneEvidence: "Done evidence",
    missingEvidence: "Missing evidence",
    qualityChecklist: "Quality checklist",
    nextVerification: "Next verification step",
    resultActions: "Generated result actions",
    copyResult: "Copy",
    copiedResult: "Copied",
    copyCard: "Copy",
    copiedCard: "Copied",
    importanceConfirmed: "Confirmed",
    importanceAction: "Action needed",
    importanceReview: "Needs review",
    importancePrompt: "For AI",
    downloadMd: "Download Markdown",
    savePdf: "Save PDF",
    newMemory: "New memory",
    historyTitle: "Recent execution memories",
    historySummary: "Recent HandOff execution memories created in this browser (max 12 stored).",
    historyEmpty: "No saved execution memories yet.",
    historyReopen: "Reopen",
    historyDelete: "Delete",
    historyClearAll: "Clear all",
    noItems: "No returned items yet.",
    goalEvidence: "The goal and current state were extracted from the input context.",
    goalAction: "Review the goal and constraints, then pass them into follow-up tasks.",
    emptyContext: "No context used was returned.",
    contextEvidence: "Decisions, requirements, missing context, and risks were separated.",
    contextAction: "If context is thin, enrich the input tab with more material.",
    requestAction: "Pass this as the unit of work for the next executor.",
    ledgerSummary: "Done evidence, missing evidence, and quality checks were separated.",
    ledgerAction: "Specify the next verification step.",
    nextRunEmpty: "No next Agent Run prompt was returned.",
    previousContextYes: "Previous context usage is recorded.",
    previousContextNo: "The runnable state was created from the new input context.",
    nextRunAction: "Hand the AI prompt and context evidence to the next Agent.",
    missingContextSummary: "Context worth filling before the next execution.",
    risksSummary: "Risk factors that should shape the follow-up work.",
    requestDetailAction: "Pass this work package to the next Agent Run.",
    memorySummary: "Decisions, constraints, and observations to keep for future runs.",
    nextItemsSummary: "Work the next Agent should pick up immediately.",
    previousContextLabel: "Previous context used",
    continuationAction: "Pass this prompt at the start of the next Agent Run.",
    doneEvidenceSummary: "Evidence used to support the done claim.",
    missingEvidenceSummary: "Evidence still needed before claiming completion.",
    checklistSummary: "Quality checks the next executor should verify.",
    nextVerificationEmpty: "No next verification step was returned.",
    verificationAction: "Update the context evidence after verification.",
    publishEyebrow: "Publish",
    publishTitle: "Publish as GitHub issue",
    publishSummary:
      "Publish this execution memory as a GitHub issue. It uses only the PAT you paste at publish time and stores it nowhere.",
    publishRepoLabel: "Target repository",
    publishRepoPlaceholder: "owner/repo (e.g. octocat/hello-world)",
    publishTokenLabel: "GitHub PAT",
    publishTokenPlaceholder: "ghp_... (not stored, used only to publish)",
    publishTokenHint:
      "Fine-grained or classic PAT. Held in browser memory only and gone after publishing.",
    publishIssueTitleLabel: "Issue title",
    publishIssueBodyLabel: "Issue body (Markdown)",
    publishLabelsLabel: "Labels",
    publishLabelsPlaceholder: "comma-separated (optional, can be empty)",
    publishButton: "Publish GitHub issue",
    publishing: "Publishing...",
    publishSuccess: "Issue created.",
    publishSuccessLink: "View created issue",
    publishRepoError: "Enter the target repository as owner/repo.",
    publishMissingFields: "Enter the repository, PAT, and title.",
    publishUnknownError: "An unknown error occurred while publishing the issue.",
  },
} satisfies Record<Lang, Record<string, string>>;

const glassPanel =
  "border border-white/[0.14] bg-white/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(255,255,255,0.04),0_18px_70px_rgba(0,0,0,0.30)] backdrop-blur-2xl";
const glassField =
  "border border-white/[0.13] bg-white/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "yes";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|;|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeResponse(raw: unknown): HandoffResponse {
  const root = asRecord(raw);
  const meetingUnderstanding = asRecord(root.meetingUnderstanding);
  const deliverablePack = asRecord(root.deliverablePack);
  const executionMemory = asRecord(root.executionMemory);
  const harness = asRecord(root.harness);

  return {
    success: typeof root.success === "boolean" ? root.success : undefined,
    meetingUnderstanding: {
      goal: asString(
        meetingUnderstanding.goal,
        asString(root.summary, "아직 목표 상태가 반환되지 않았습니다."),
      ),
      customerContext: asString(
        meetingUnderstanding.customerContext,
        asString(root.customer_context),
      ),
      keyDecisions: asStringArray(meetingUnderstanding.keyDecisions || root.key_decisions),
      requirements: asStringArray(meetingUnderstanding.requirements || root.requirements),
      missingInfo: asStringArray(
        meetingUnderstanding.missingInfo || root.missing_info || root.next_questions,
      ),
      risks: asStringArray(meetingUnderstanding.risks || root.risks),
    },
    deliverablePack: {
      type: asString(deliverablePack.type, asString(root.deliveryType, "unknown")),
      title: asString(deliverablePack.title, "Generated Execution Request"),
      customerMessage: asString(
        deliverablePack.customerMessage,
        asString(root.follow_up_email || root.customer_message),
      ),
      brief: asString(deliverablePack.brief, asString(root.proposal_outline || root.brief)),
      lovablePrompt: asString(deliverablePack.lovablePrompt || root.lovable_prompt),
      prd: asString(deliverablePack.prd || root.prd),
      tasks: asStringArray(deliverablePack.tasks || root.tasks),
    },
    executionMemory: {
      previousContextUsed: asBoolean(
        executionMemory.previousContextUsed || root.previous_context_used,
      ),
      nextActions: asStringArray(executionMemory.nextActions || root.next_actions || root.tasks),
      memoryToPersist: asStringArray(
        executionMemory.memoryToPersist || root.memory_observations || root.memory_to_persist,
      ),
      continuationPrompt: asString(
        executionMemory.continuationPrompt,
        asString(root.continuation_prompt),
      ),
    },
    harness: {
      doneEvidence: asStringArray(harness.doneEvidence || root.done_evidence),
      missingEvidence: asStringArray(
        harness.missingEvidence || root.missing_evidence || root.next_questions,
      ),
      qualityChecklist: asStringArray(harness.qualityChecklist || root.quality_checklist),
      nextVerificationStep: asString(
        harness.nextVerificationStep,
        asString(root.next_verification_step),
      ),
    },
    _warnings: asStringArray(root._warnings),
    _error: root._error === null ? null : (asRecord(root._error) as HandoffResponse["_error"]),
    _raw: root._raw,
  };
}

function getDeliveryLabel(lang: Lang, value: HandoffRequest["deliveryType"]) {
  return deliveryOptionsByLang[lang].find((option) => option.value === value)?.label ?? value;
}

function buildResultText(
  result: HandoffResponse,
  title: string,
  inputType: string,
  deliveryLabel: string,
) {
  const lines = [
    `# ${title || result.deliverablePack.title || "HandOff Execution Memory"}`,
    "",
    `- Input type: ${inputType}`,
    `- Output: ${deliveryLabel}`,
    "",
    "## Summary",
    result.meetingUnderstanding.goal,
    "",
    "## Decisions",
    result.meetingUnderstanding.customerContext,
    ...result.meetingUnderstanding.keyDecisions.map((item) => `- Decision: ${item}`),
    ...result.meetingUnderstanding.requirements.map((item) => `- Requirement: ${item}`),
    ...result.meetingUnderstanding.risks.map((item) => `- Risk: ${item}`),
    "",
    "## Follow-up Tasks",
    result.deliverablePack.brief || result.deliverablePack.customerMessage,
    ...result.deliverablePack.tasks.map((item) => `- ${item}`),
    "",
    "## Missing Context",
    ...result.meetingUnderstanding.missingInfo.map((item) => `- ${item}`),
    "",
    "## Context / Evidence",
    ...result.harness.doneEvidence.map((item) => `- Done evidence: ${item}`),
    ...result.harness.missingEvidence.map((item) => `- Missing evidence: ${item}`),
    ...result.harness.qualityChecklist.map((item) => `- Quality check: ${item}`),
    "",
    "## AI Prompt",
    result.executionMemory.continuationPrompt,
    ...result.executionMemory.nextActions.map((item) => `- ${item}`),
  ];

  return lines.filter((line) => line !== undefined && line !== null).join("\n");
}

function buildCardText(title: string, lines: Array<string | undefined>): string {
  const clean = lines.filter((line): line is string => Boolean(line && line.trim().length));
  return [`# ${title}`, "", ...clean.map((line) => (line.startsWith("- ") ? line : `- ${line}`))]
    .join("\n")
    .trim();
}

async function extractPdfText(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing requires browser context");
  }
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    const workerMod = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = workerMod.default;
  }
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) =>
        item && typeof item === "object" && "str" in item ? (item as { str: string }).str : "",
      )
      .join(" ");
    parts.push(text.trim());
  }
  return parts.filter(Boolean).join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return (result.value || "").trim();
}

async function extractXlsxText(file: File): Promise<string> {
  const xlsx = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: "array" });
  const parts: string[] = [];
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const csv = xlsx.utils.sheet_to_csv(sheet);
    if (csv.trim().length) {
      parts.push(`## ${name}\n${csv.trim()}`);
    }
  }
  return parts.join("\n\n").trim();
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fallback for embedded previews that block async clipboard writes.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 12)));
}

function readHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: "neutral" | "good" | "warn" | "error";
}) {
  const className = {
    neutral: "border-white/[0.12] bg-white/[0.055] text-[#a8b2c4] backdrop-blur-xl",
    good: "border-white/[0.18] bg-white/[0.08] text-[#f4efe4] backdrop-blur-xl",
    warn: "border-[#c9a86a]/[0.30] bg-[#c9a86a]/[0.10] text-[#ead7aa] backdrop-blur-xl",
    error: "border-red-500/30 bg-red-500/10 text-red-200",
  }[tone];

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function EmptyState({ label = "아직 반환된 항목이 없습니다." }: { label?: string }) {
  return (
    <p className="rounded-md border border-dashed border-white/[0.12] bg-white/[0.035] px-3 py-2 text-sm text-[#7d8798] backdrop-blur-xl">
      {label}
    </p>
  );
}

function ListBlock({
  items,
  tone = "neutral",
}: {
  items?: string[];
  tone?: "neutral" | "good" | "warn";
}) {
  if (!items?.length) return <EmptyState />;
  const toneClass =
    tone === "good"
      ? "border-white/[0.16] bg-white/[0.07]"
      : tone === "warn"
        ? "border-[#c9a86a]/[0.25] bg-[#c9a86a]/[0.08]"
        : "border-white/[0.12] bg-white/[0.04]";

  return (
    <ul className="space-y-2 text-sm text-[#d9deea]">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className={`rounded-md border px-3 py-2 leading-relaxed ${toneClass}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

type Importance = "confirmed" | "action" | "review" | "prompt";

const IMPORTANCE_STYLE: Record<Importance, { bar: string; badge: string }> = {
  confirmed: {
    bar: "bg-[#5D7EEB]",
    badge: "border-[#5D7EEB]/[0.45] bg-[#5D7EEB]/[0.14] text-white",
  },
  action: {
    bar: "bg-[#BAC8F4]",
    badge: "border-white/[0.45] bg-white/[0.92] text-[#1A1F31]",
  },
  review: {
    bar: "bg-[#EE684E]",
    badge: "border-[#EE684E]/[0.45] bg-[#EE684E]/[0.18] text-[#FFE5DE]",
  },
  prompt: {
    bar: "bg-[#7D98EE]",
    badge: "border-[#7D98EE]/[0.45] bg-[#7D98EE]/[0.16] text-white",
  },
};

function GitHubPublishCard({
  result,
  meetingTitle,
  lang,
  t,
}: {
  result: HandoffResponse;
  meetingTitle: string;
  lang: Lang;
  t: (typeof workbenchCopy)[Lang];
}) {
  const prefill = useMemo(
    () => buildIssueContent(result, meetingTitle, lang),
    [result, meetingTitle, lang],
  );
  const [repo, setRepo] = useState("");
  // PAT lives in local component state only — never persisted or logged.
  const [token, setToken] = useState("");
  const [labels, setLabels] = useState("");
  const [title, setTitle] = useState(prefill.title);
  const [body, setBody] = useState(prefill.body);
  const [publishing, setPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [issueUrl, setIssueUrl] = useState<string | null>(null);

  async function handlePublish() {
    setErrorMessage(null);
    setIssueUrl(null);

    const match = repo.trim().match(/^([^/\s]+)\/([^/\s]+)$/);
    if (!match) {
      setErrorMessage(t.publishRepoError);
      toast.error(t.publishRepoError);
      return;
    }
    if (!token.trim() || !title.trim()) {
      setErrorMessage(t.publishMissingFields);
      toast.error(t.publishMissingFields);
      return;
    }

    const parsedLabels = labels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);

    setPublishing(true);
    try {
      const res = await publishGithubIssue({
        data: {
          owner: match[1],
          repo: match[2],
          token: token.trim(),
          title: title.trim(),
          body,
          labels: parsedLabels.length > 0 ? parsedLabels : undefined,
        },
      });
      if (res.ok && res.issueUrl) {
        setIssueUrl(res.issueUrl);
        toast.success(t.publishSuccess);
      } else {
        const message = res.errorMessage || t.publishUnknownError;
        setErrorMessage(message);
        toast.error(message);
      }
    } catch {
      setErrorMessage(t.publishUnknownError);
      toast.error(t.publishUnknownError);
    } finally {
      setPublishing(false);
    }
  }

  const fieldClass = `w-full rounded-md px-3 py-2 text-sm text-[#e8edf6] placeholder:text-[#6b7587] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/60 ${glassField}`;

  return (
    <article className={`relative overflow-hidden rounded-xl p-6 ${glassPanel}`}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d98ee]">
          {t.publishEyebrow}
        </p>
        <h3 className="mt-1 text-xl font-bold text-[#f6f4ee]">{t.publishTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-[#c7cfdd]">{t.publishSummary}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[#a8b2c4]">{t.publishRepoLabel}</span>
          <input
            className={fieldClass}
            type="text"
            autoComplete="off"
            placeholder={t.publishRepoPlaceholder}
            value={repo}
            onChange={(event) => setRepo(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[#a8b2c4]">{t.publishTokenLabel}</span>
          <input
            className={fieldClass}
            type="password"
            autoComplete="off"
            placeholder={t.publishTokenPlaceholder}
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <span className="text-[11px] leading-4 text-[#7d8798]">{t.publishTokenHint}</span>
        </label>
      </div>
      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#a8b2c4]">{t.publishIssueTitleLabel}</span>
        <input
          className={fieldClass}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#a8b2c4]">{t.publishIssueBodyLabel}</span>
        <textarea
          className={`${fieldClass} min-h-[180px] resize-y font-mono leading-relaxed`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </label>
      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#a8b2c4]">{t.publishLabelsLabel}</span>
        <input
          className={fieldClass}
          type="text"
          autoComplete="off"
          placeholder={t.publishLabelsPlaceholder}
          value={labels}
          onChange={(event) => setLabels(event.target.value)}
        />
      </label>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handlePublish}
          disabled={publishing}
          className="rounded-md border border-[#5D7EEB]/[0.45] bg-[#5D7EEB]/[0.18] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5D7EEB]/[0.30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {publishing ? t.publishing : t.publishButton}
        </button>
        {issueUrl && (
          <a
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#9db4ff] underline underline-offset-4 hover:text-[#bccbff]"
          >
            {t.publishSuccessLink} →
          </a>
        )}
      </div>
      {errorMessage && (
        <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm leading-relaxed text-red-200">
          {errorMessage}
        </p>
      )}
    </article>
  );
}

function CopyButton({
  label,
  copiedLabel,
  onCopy,
}: {
  label: string;
  copiedLabel: string;
  onCopy: () => Promise<boolean>;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await onCopy();
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border border-[#5D7EEB]/[0.45] bg-[#5D7EEB]/[0.14] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5D7EEB]/[0.24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31]"
      aria-label={label}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

function WorkbenchCard({
  eyebrow,
  title,
  summary,
  evidence,
  action,
  status = "Ready",
  labels,
  highlight = false,
  importance,
  importanceLabel,
  onCopy,
  copyLabel,
  copiedLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  summary?: string;
  evidence?: string;
  action?: string;
  status?: string;
  labels?: { evidence: string; nextAction: string };
  highlight?: boolean;
  importance?: Importance;
  importanceLabel?: string;
  onCopy?: () => Promise<boolean>;
  copyLabel?: string;
  copiedLabel?: string;
  children?: ReactNode;
}) {
  const cardLabels = labels ?? { evidence: "근거", nextAction: "다음 액션" };
  const panelClass = highlight
    ? "border border-[#5D7EEB]/[0.45] bg-[#5D7EEB]/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_24px_70px_rgba(93,126,235,0.18)] backdrop-blur-2xl"
    : glassPanel;
  const importanceStyle = importance ? IMPORTANCE_STYLE[importance] : null;
  const [copied, setCopied] = useState(false);

  async function handleCopyClick() {
    if (!onCopy) return;
    const ok = await onCopy();
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  return (
    <article className={`relative overflow-hidden rounded-xl p-5 ${panelClass}`}>
      {importanceStyle && (
        <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${importanceStyle.bar}`} />
      )}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8798]">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#f6f4ee]">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {importance && importanceLabel && importanceStyle && (
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${importanceStyle.badge}`}
            >
              {importanceLabel}
            </span>
          )}
          {onCopy && (
            <button
              type="button"
              onClick={handleCopyClick}
              className="rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-[#e8edf6] transition hover:bg-[#5D7EEB]/[0.12] hover:border-[#5D7EEB]/[0.35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31]"
              aria-label={copyLabel ?? "Copy card"}
            >
              {copied ? (copiedLabel ?? "복사됨") : (copyLabel ?? "복사")}
            </button>
          )}
          <StatusBadge tone={status === "Needs evidence" ? "warn" : "good"}>{status}</StatusBadge>
        </div>
      </div>
      {summary && <p className="mb-4 text-sm leading-6 text-[#c7cfdd]">{summary}</p>}
      {children}
      {(evidence || action) && (
        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
          {evidence && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8798]">
                {cardLabels.evidence}
              </p>
              <p className="text-sm text-[#c7cfdd]">{evidence}</p>
            </div>
          )}
          {action && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8798]">
                {cardLabels.nextAction}
              </p>
              <p className="text-sm text-[#c7cfdd]">{action}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function DebugPanel({
  loading,
  error,
  rawResult,
  result,
  onTest,
}: {
  loading: boolean;
  error: string | null;
  rawResult: unknown;
  result: HandoffResponse | null;
  onTest: () => Promise<void>;
}) {
  const responseError = result?._error;
  const warnings = result?._warnings ?? [];
  const success =
    typeof result?.success === "boolean" ? result.success : rawResult ? !error : undefined;

  return (
    <aside
      className={`fixed bottom-4 right-4 z-50 hidden w-[min(24rem,calc(100vw-2rem))] rounded-xl p-4 text-xs text-[#d9deea] lg:block ${glassPanel}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#f6f4ee]">Webhook Debug</p>
          <p className="mt-1 truncate text-[#7d8798]">
            {import.meta.env.VITE_N8N_WEBHOOK_URL || "No webhook URL"}
          </p>
        </div>
        <StatusBadge
          tone={
            loading
              ? "neutral"
              : success
                ? "good"
                : success === false || error
                  ? "error"
                  : "neutral"
          }
        >
          {loading ? "loading" : success === undefined ? "idle" : success ? "success" : "failed"}
        </StatusBadge>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl">
          <span className="text-[#a8b2c4]">previousContextUsed</span>
          <span className="font-medium">
            {result?.executionMemory.previousContextUsed ? "true" : "false"}
          </span>
        </div>

        {warnings.length > 0 && (
          <div className="rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
            <p className="mb-1 font-semibold">Warnings</p>
            <ul className="space-y-1">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {(error || responseError) && (
          <div className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-red-100">
            <p className="mb-1 font-semibold">{responseError?.code || "REQUEST_FAILED"}</p>
            <p>{responseError?.message || error}</p>
            {responseError?.preview && (
              <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-red-950/60 p-2">
                {responseError.preview}
              </pre>
            )}
          </div>
        )}

        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[#7d8798] backdrop-blur-xl">
          {rawResult ? "response received" : "no response yet"}
        </p>
        <button
          className="rounded-md border border-white/10 px-3 py-2 font-semibold text-[#e8edf6] hover:bg-white/[0.06] disabled:opacity-50"
          onClick={onTest}
          disabled={loading}
        >
          웹훅 연결 테스트
        </button>
      </div>
    </aside>
  );
}

function classifyInputType(text: string): "Meeting" | "Memo" | "Issue" | "Request" {
  const lower = text.toLowerCase();
  if (/github|issue|bug|ticket|이슈|버그/.test(lower)) return "Issue";
  if (/요청|request|todo|task|작업/.test(lower)) return "Request";
  if (/memo|note|메모|논의|slack/.test(lower)) return "Memo";
  return "Meeting";
}

export function HandoffDemo({
  showDebugPanel = true,
  lang = "ko",
}: {
  showDebugPanel?: boolean;
  lang?: Lang;
}) {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [recipient, setRecipient] = useState("");
  const [deliveryType, setDeliveryType] = useState<HandoffRequest["deliveryType"]>("website_brief");
  const tone: HandoffRequest["tone"] = "professional";
  const [transcript, setTranscript] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileNotice, setFileNotice] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [activeView, setActiveView] = useState<WorkbenchView>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResult, setRawResult] = useState<unknown>(null);
  const t = workbenchCopy[lang];
  const deliveryOptions = deliveryOptionsByLang[lang];
  const navItems = navItemsByLang[lang];
  const pipelineSteps = pipelineStepsByLang[lang];
  const cardLabels = { evidence: t.evidence, nextAction: t.nextAction };

  const result = useMemo(() => (rawResult ? normalizeResponse(rawResult) : null), [rawResult]);
  const deliveryLabel = getDeliveryLabel(lang, deliveryType);

  useEffect(() => {
    setHistoryItems(readHistory());
  }, []);

  const canSubmit = meetingTitle.trim().length > 0 && transcript.trim().length > 0;
  const inputType = classifyInputType(transcript);

  const metrics = useMemo(() => {
    const deliverableCount = [
      result?.deliverablePack.customerMessage,
      result?.deliverablePack.brief,
      result?.deliverablePack.lovablePrompt,
      ...(result?.deliverablePack.tasks ?? []),
    ].filter(Boolean).length;
    const evidenceCount =
      (result?.harness.doneEvidence.length ?? 0) +
      (result?.harness.missingEvidence.length ?? 0) +
      (result?.harness.qualityChecklist.length ?? 0);
    const nextRunCount = result?.executionMemory.nextActions.length ?? 0;
    return { deliverableCount, evidenceCount, nextRunCount };
  }, [result]);

  async function runHandoff(payload?: Partial<HandoffRequest>) {
    const request = {
      meetingTitle: payload?.meetingTitle ?? meetingTitle,
      transcript: payload?.transcript ?? transcript,
      deliveryType: payload?.deliveryType ?? deliveryType,
      recipient: payload?.recipient ?? recipient,
      tone: payload?.tone ?? tone,
      sourceFileName: selectedFileName || undefined,
    };

    setLoading(true);
    setError(null);
    setActiveView("loading");
    try {
      const response = await callN8n(request);
      const normalized = normalizeResponse(response);
      setRawResult(response);
      const nextHistory = [
        {
          id: `${Date.now()}`,
          title: request.meetingTitle || normalized.deliverablePack.title,
          createdAt: new Date().toISOString(),
          inputType: classifyInputType(request.transcript),
          deliveryLabel: getDeliveryLabel(lang, request.deliveryType),
          summary: normalized.meetingUnderstanding.goal || normalized.deliverablePack.brief,
          response: normalized,
          meetingTitle: request.meetingTitle,
          recipient: request.recipient,
          transcript: request.transcript,
        },
        ...historyItems,
      ].slice(0, 12);
      setHistoryItems(nextHistory);
      saveHistory(nextHistory);
      setActiveView("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.unknownError);
      setActiveView("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    await runHandoff();
  }

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    const name = file.name;
    const extension = name.split(".").pop()?.toLowerCase();
    const isText = extension === "txt" || extension === "md" || file.type.startsWith("text/");
    const isPdf = extension === "pdf" || file.type === "application/pdf";
    const isDocx = extension === "docx";
    const isXlsx = extension === "xlsx" || extension === "xls";
    const isHwp = extension === "hwp" || extension === "hwpx";

    if (!isText && !isPdf && !isDocx && !isXlsx && !isHwp) {
      setFileNotice(t.unsupportedFile);
      return;
    }

    if (isHwp) {
      setSelectedFileName(name);
      setTranscript((value) =>
        [value, `\n\n[HWP source selected: ${name}]`].filter(Boolean).join("\n"),
      );
      setFileNotice(t.hwpUnsupported);
      return;
    }

    setSelectedFileName(name);
    if (isText) {
      const content = await file.text();
      setTranscript((value) =>
        [value, `\n\n--- ${name} ---\n${content}`].filter(Boolean).join("\n"),
      );
      setFileNotice(t.fileLoaded);
      return;
    }

    const extractor: { run: (f: File) => Promise<string>; okKey: string; failKey: string } = isPdf
      ? { run: extractPdfText, okKey: "pdfExtracted", failKey: "pdfExtractFailed" }
      : isDocx
        ? { run: extractDocxText, okKey: "docxExtracted", failKey: "docxExtractFailed" }
        : { run: extractXlsxText, okKey: "xlsxExtracted", failKey: "xlsxExtractFailed" };

    try {
      const text = await extractor.run(file);
      if (text.trim().length === 0) {
        throw new Error("empty extracted text");
      }
      setTranscript((value) => [value, `\n\n--- ${name} ---\n${text}`].filter(Boolean).join("\n"));
      const okMessage = (t as Record<string, string>)[extractor.okKey] || t.fileLoaded;
      setFileNotice(okMessage.replace("{count}", String(text.length)));
    } catch {
      setTranscript((value) =>
        [value, `\n\n[source selected: ${name}]`].filter(Boolean).join("\n"),
      );
      const failMessage = (t as Record<string, string>)[extractor.failKey] || t.pdfExtractFailed;
      setFileNotice(failMessage);
    }
  }

  async function handleCopyResult() {
    if (!result) return;
    const copied = await copyText(buildResultText(result, meetingTitle, inputType, deliveryLabel));
    if (copied) {
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1400);
    }
  }

  function handleDownloadMarkdown() {
    if (!result) return;
    const blob = new Blob([buildResultText(result, meetingTitle, inputType, deliveryLabel)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(meetingTitle || "handoff-execution-memory").replace(/[^a-z0-9가-힣_-]+/gi, "-")}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function handleSavePdf() {
    const now = new Date();
    const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const previousTitle = document.title;
    document.title = `handoff-memory-${yyyymmdd}`;
    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore, { once: true });
    window.print();
  }

  function handleNewMemory() {
    setMeetingTitle("");
    setRecipient("");
    setTranscript("");
    setSelectedFileName("");
    setFileNotice("");
    setCopyStatus("idle");
    setRawResult(null);
    setError(null);
    setActiveView("input");
  }

  function handleOpenHistory(item: HistoryItem) {
    if (!item.response) return;
    setRawResult(item.response);
    setMeetingTitle(item.meetingTitle || item.title || "");
    setRecipient(item.recipient || "");
    setTranscript(item.transcript || "");
    setSelectedFileName("");
    setFileNotice("");
    setCopyStatus("idle");
    setError(null);
    setActiveView("dashboard");
  }

  function handleDeleteHistory(id: string) {
    const next = historyItems.filter((item) => item.id !== id);
    setHistoryItems(next);
    saveHistory(next);
  }

  function handleClearHistory() {
    setHistoryItems([]);
    saveHistory([]);
  }

  async function handleWebhookTest() {
    setMeetingTitle((value) => value || "Webhook 연결 테스트");
    await runHandoff({
      meetingTitle: lang === "en" ? "Webhook connection test" : "Webhook 연결 테스트",
      transcript:
        lang === "en"
          ? "This is a ping request from the debug panel. Verify success, warnings, error, and previousContextUsed are displayed correctly."
          : "디버그 패널에서 보낸 ping 요청입니다. success, warnings, error, previousContextUsed 표시가 정상인지 확인해주세요.",
      recipient: recipient || "Debug Panel",
    });
  }

  const shell = (content: ReactNode) => (
    <main className="min-h-screen bg-[#1A1F31] bg-[radial-gradient(circle_at_16%_10%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_86%_8%,rgba(143,179,255,0.08),transparent_28%),linear-gradient(180deg,#1A1F31,#05070b)] text-[#f6f4ee]">
      <Toaster />
      {showDebugPanel && (
        <DebugPanel
          loading={loading}
          error={error}
          rawResult={rawResult}
          result={result}
          onTest={handleWebhookTest}
        />
      )}
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[17rem_1fr]">
        <aside className="border-b border-white/[0.12] bg-white/[0.035] p-5 shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7d8798]">
              Handoff
            </p>
            <h1 className="mt-2 text-xl font-semibold text-[#f6f4ee]">
              Execution Memory Workbench
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#a8b2c4]">{t.sidebarBody}</p>
          </div>
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const disabled =
                !result &&
                item.id !== "input" &&
                !(item.id === "history" && historyItems.length > 0);
              const selected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  className={`rounded-md border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31] ${selected ? "border-white/[0.20] bg-[#5D7EEB]/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]" : "border-transparent text-[#c7cfdd] hover:border-[#5D7EEB]/[0.30] hover:bg-[#5D7EEB]/[0.10] hover:text-white"} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                  disabled={disabled}
                  onClick={() => setActiveView(item.id)}
                >
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-[#7d8798]">{item.eyebrow}</span>
                </button>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0 p-5 sm:p-8">
          <header className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl xl:flex-row xl:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
                {t.headerEyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#f6f4ee] sm:text-3xl">
                {t.headerTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a8b2c4]">{t.headerBody}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={result ? "good" : "neutral"}>
                {result ? "Ready for Handoff" : t.waiting}
              </StatusBadge>
              <StatusBadge>{inputType}</StatusBadge>
              {result && (
                <div
                  className="flex flex-wrap gap-2 border-l border-white/10 pl-2"
                  aria-label={t.resultActions}
                >
                  <button
                    className="rounded-md border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-[#e8edf6] hover:bg-white/[0.10]"
                    onClick={handleNewMemory}
                  >
                    {t.newMemory}
                  </button>
                  <button
                    className="rounded-md border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-[#e8edf6] hover:bg-white/[0.10]"
                    onClick={handleCopyResult}
                  >
                    {copyStatus === "copied" ? t.copiedResult : t.copyResult}
                  </button>
                  <button
                    className="rounded-md border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-[#e8edf6] hover:bg-white/[0.10]"
                    onClick={handleDownloadMarkdown}
                  >
                    {t.downloadMd}
                  </button>
                  <button
                    className="rounded-md border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-[#e8edf6] hover:bg-white/[0.10]"
                    onClick={handleSavePdf}
                  >
                    {t.savePdf}
                  </button>
                </div>
              )}
            </div>
          </header>
          {content}
        </section>
      </div>
    </main>
  );

  if (activeView === "loading") {
    return shell(
      <div className="grid gap-6">
        <WorkbenchCard
          eyebrow="Runtime Pipeline"
          title={t.runtimeTitle}
          summary={t.runtimeSummary}
          status="Running"
          labels={cardLabels}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pipelineSteps.map((step, index) => (
              <div key={step} className={`rounded-lg p-4 ${glassField}`}>
                <p className="text-xs font-semibold text-[#d7dceb]">0{index + 1}</p>
                <p className="mt-2 font-medium text-[#e8edf6]">{step}</p>
                <div className="mt-4 h-1 rounded-full bg-white/10">
                  <div
                    className="h-1 animate-pulse rounded-full bg-[#f4efe4]"
                    style={{ width: `${Math.min(100, (index + 1) * 16)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </WorkbenchCard>
      </div>,
    );
  }

  if (activeView === "error") {
    return shell(
      <WorkbenchCard
        eyebrow={t.errorEyebrow}
        title={t.errorTitle}
        summary={error || t.unknownError}
        action={t.errorAction}
        status="Needs evidence"
        labels={cardLabels}
      >
        <button
          className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-[#e8edf6] hover:bg-white/[0.06]"
          onClick={() => setActiveView("input")}
        >
          {t.backToInput}
        </button>
      </WorkbenchCard>,
    );
  }

  const historyView = (
    <WorkbenchCard
      eyebrow="Archive"
      title={t.historyTitle}
      summary={t.historySummary}
      status={historyItems.length ? "Ready" : "Needs evidence"}
      labels={cardLabels}
    >
      {historyItems.length ? (
        <div className="grid gap-3">
          {historyItems.length > 1 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClearHistory}
                className="rounded-md border border-[#EE684E]/[0.35] bg-[#EE684E]/[0.10] px-3 py-1 text-xs font-semibold text-[#FFE5DE] transition hover:bg-[#EE684E]/[0.20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE684E]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31]"
              >
                {t.historyClearAll}
              </button>
            </div>
          )}
          {historyItems.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-white/[0.12] bg-white/[0.045] p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#f6f4ee]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#a8b2c4]">{item.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[#9aa3b5]">
                  <StatusBadge>{item.inputType}</StatusBadge>
                  <StatusBadge>{item.deliveryLabel}</StatusBadge>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[#7d8798]">
                  {new Date(item.createdAt).toLocaleString(lang === "ko" ? "ko-KR" : "en-US")}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenHistory(item)}
                    disabled={!item.response}
                    className="rounded-md border border-[#5D7EEB]/[0.45] bg-[#5D7EEB]/[0.14] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#5D7EEB]/[0.24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t.historyReopen}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHistory(item.id)}
                    className="rounded-md border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#c7cfdd] transition hover:bg-[#EE684E]/[0.16] hover:border-[#EE684E]/[0.35] hover:text-[#FFE5DE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE684E]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31]"
                  >
                    {t.historyDelete}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState label={t.historyEmpty} />
      )}
    </WorkbenchCard>
  );

  if (!result && activeView === "history") {
    return shell(historyView);
  }

  if (!result || activeView === "input") {
    return shell(
      <div className="grid gap-5">
        <WorkbenchCard
          eyebrow="Input Context"
          title={t.inputTitle}
          summary={t.inputSummary}
          action={t.inputAction}
          labels={cardLabels}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-medium text-[#a8b2c4]">{t.workName}</span>
              <input
                className={`rounded-md p-3 text-sm text-[#e8edf6] outline-none focus:border-[#f4efe4]/[0.55] ${glassField}`}
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder={t.workNamePlaceholder}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-medium text-[#a8b2c4]">{t.recipient}</span>
              <input
                className={`rounded-md p-3 text-sm text-[#e8edf6] outline-none focus:border-[#f4efe4]/[0.55] ${glassField}`}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={t.recipientPlaceholder}
              />
            </label>
          </div>
          <div className="mt-4 grid gap-2">
            <span className="text-xs font-medium text-[#a8b2c4]">{t.requestType}</span>
            <div className="grid gap-3 md:grid-cols-2">
              {deliveryOptions.map((option) => {
                const selected = deliveryType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31] ${selected ? "border-white/80 bg-[#f6f4ee] text-[#050609] shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_12px_30px_rgba(0,0,0,0.24)]" : "border-white/[0.18] bg-white/[0.045] text-[#e8edf6] hover:border-[#5D7EEB]/[0.45] hover:bg-[#5D7EEB]/[0.10] hover:text-white"}`}
                    onClick={() => setDeliveryType(option.value)}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span
                      className={`mt-1 block text-xs leading-5 ${selected ? "text-[#3e4654]" : "text-[#c7cfdd]"}`}
                    >
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <label className="mt-4 grid gap-2">
            <span className="text-xs font-medium text-[#a8b2c4]">{t.workContext}</span>
            <textarea
              className={`min-h-72 rounded-md p-4 text-sm leading-6 text-[#e8edf6] outline-none focus:border-[#f4efe4]/[0.55] ${glassField}`}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={t.contextPlaceholder}
            />
          </label>
          <div className="mt-3 rounded-lg border border-white/[0.12] bg-white/[0.045] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8b2c4]">
                  {t.fileUpload}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#7d8798]">{t.fileHint}</p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-white/20 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-[#e8edf6] hover:bg-white/[0.12]">
                {t.fileUpload}
                <input
                  className="sr-only"
                  type="file"
                  accept=".txt,.md,.pdf,.docx,.xlsx,.xls,.hwp,.hwpx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => void handleFileChange(event.target.files?.[0])}
                />
              </label>
            </div>
            {(selectedFileName || fileNotice) && (
              <p className="mt-3 text-xs leading-5 text-[#c7cfdd]">
                {selectedFileName && (
                  <span className="font-semibold text-[#f6f4ee]">
                    {t.selectedFile}: {selectedFileName}.{" "}
                  </span>
                )}
                {fileNotice}
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
            <p className="text-sm text-[#7d8798]">
              {t.inferredType}: <span className="text-[#c7cfdd]">{inputType}</span>
            </p>
            <button
              className="rounded-md border border-white/40 bg-white/90 px-5 py-3 text-sm font-bold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_12px_32px_rgba(0,0,0,0.22)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
            >
              {loading ? t.creating : t.create}
            </button>
          </div>
        </WorkbenchCard>
      </div>,
    );
  }

  const summaryStrip = (
    <div className="mb-5 grid gap-3 md:grid-cols-5">
      {[
        [t.status, "Ready for Handoff"],
        [t.inputType, inputType],
        [t.deliverables, `${metrics.deliverableCount}${t.countSuffix}`],
        [t.evidenceItems, `${metrics.evidenceCount}${t.countSuffix}`],
        [t.nextRun, `${metrics.nextRunCount}${t.countSuffix}`],
      ].map(([label, value]) => (
        <div key={label} className={`rounded-lg p-4 ${glassField}`}>
          <p className="text-xs font-medium text-[#7d8798]">{label}</p>
          <p className="mt-1 text-sm font-semibold text-[#e8edf6]">{value}</p>
        </div>
      ))}
    </div>
  );

  const agentPromptText = result.deliverablePack.lovablePrompt || result.deliverablePack.prd;
  const resumePromptText = result.executionMemory.continuationPrompt;

  const dashboard = (
    <>
      {summaryStrip}
      {agentPromptText && (
        <article className="relative mb-5 overflow-hidden rounded-xl border border-[#5D7EEB]/[0.45] bg-[#5D7EEB]/[0.08] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_24px_70px_rgba(93,126,235,0.20)] backdrop-blur-2xl">
          <span
            aria-hidden
            className={`absolute inset-y-0 left-0 w-[3px] ${IMPORTANCE_STYLE.prompt.bar}`}
          />
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d98ee]">
                Agent Run
              </p>
              <h3 className="mt-1 text-xl font-bold text-[#f6f4ee]">{t.agentPrompt}</h3>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${IMPORTANCE_STYLE.prompt.badge}`}
              >
                {t.importancePrompt}
              </span>
              <CopyButton
                label={t.agentPromptCopy}
                copiedLabel={t.agentPromptCopied}
                onCopy={() => copyText(agentPromptText || t.agentPromptEmpty)}
              />
            </div>
          </div>
          <p className="mb-4 text-sm leading-6 text-[#c7cfdd]">{t.agentPromptSummary}</p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-[#e8edf6]">
            {agentPromptText}
          </pre>
          {resumePromptText && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8798]">
                    {t.resumePrompt}
                  </p>
                  <p className="mt-1 text-xs text-[#a8b2c4]">{t.resumePromptHint}</p>
                </div>
                <CopyButton
                  label={t.resumePromptCopy}
                  copiedLabel={t.agentPromptCopied}
                  onCopy={() => copyText(resumePromptText)}
                />
              </div>
            </div>
          )}
        </article>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        <WorkbenchCard
          eyebrow="Summary"
          title={lang === "ko" ? "핵심 요약" : "Summary"}
          summary={result.meetingUnderstanding.goal}
          evidence={result.meetingUnderstanding.customerContext || t.goalEvidence}
          action={t.goalAction}
          labels={cardLabels}
          importance="confirmed"
          importanceLabel={t.importanceConfirmed}
          copyLabel={t.copyCard}
          copiedLabel={t.copiedCard}
          onCopy={() =>
            copyText(
              buildCardText(lang === "ko" ? "핵심 요약" : "Summary", [
                result.meetingUnderstanding.goal,
                ...result.meetingUnderstanding.requirements,
              ]),
            )
          }
        >
          <ListBlock items={result.meetingUnderstanding.requirements.slice(0, 3)} />
        </WorkbenchCard>
        <WorkbenchCard
          eyebrow="Decisions"
          title={lang === "ko" ? "결정 사항" : "Decisions"}
          summary={result.meetingUnderstanding.customerContext || t.emptyContext}
          evidence={t.contextEvidence}
          action={t.contextAction}
          labels={cardLabels}
          importance="confirmed"
          importanceLabel={t.importanceConfirmed}
          copyLabel={t.copyCard}
          copiedLabel={t.copiedCard}
          onCopy={() =>
            copyText(
              buildCardText(lang === "ko" ? "결정 사항" : "Decisions", [
                result.meetingUnderstanding.customerContext,
                ...result.meetingUnderstanding.keyDecisions,
              ]),
            )
          }
        >
          <ListBlock items={result.meetingUnderstanding.keyDecisions.slice(0, 4)} />
        </WorkbenchCard>
        <div className="xl:col-span-2">
          <WorkbenchCard
            eyebrow="Follow-up Tasks"
            title={t.executionRequests}
            summary={result.deliverablePack.title}
            evidence={result.deliverablePack.brief || result.deliverablePack.customerMessage}
            action={t.requestAction}
            labels={cardLabels}
            highlight
            importance="action"
            importanceLabel={t.importanceAction}
            copyLabel={t.copyCard}
            copiedLabel={t.copiedCard}
            onCopy={() =>
              copyText(
                buildCardText(t.executionRequests, [
                  result.deliverablePack.title,
                  result.deliverablePack.brief,
                  ...result.deliverablePack.tasks,
                ]),
              )
            }
          >
            <ListBlock items={result.deliverablePack.tasks.slice(0, 4)} />
          </WorkbenchCard>
        </div>
        <WorkbenchCard
          eyebrow="Missing Context"
          title={t.missingContext}
          summary={t.missingContextSummary}
          status={result.meetingUnderstanding.missingInfo.length ? "Needs evidence" : "Ready"}
          labels={cardLabels}
          importance="review"
          importanceLabel={t.importanceReview}
          copyLabel={t.copyCard}
          copiedLabel={t.copiedCard}
          onCopy={() =>
            copyText(buildCardText(t.missingContext, result.meetingUnderstanding.missingInfo))
          }
        >
          <ListBlock items={result.meetingUnderstanding.missingInfo.slice(0, 4)} tone="warn" />
        </WorkbenchCard>
        <div className="xl:col-span-2">
          <p className="px-1 text-xs text-[#7d8798]">
            {result.harness.doneEvidence.length}
            {t.countSuffix} {t.doneEvidence} · {result.harness.missingEvidence.length}
            {t.countSuffix} {t.missingEvidence}
            {result.harness.nextVerificationStep ? ` · ${result.harness.nextVerificationStep}` : ""}
          </p>
        </div>
        <div className="xl:col-span-2">
          <GitHubPublishCard result={result} meetingTitle={meetingTitle} lang={lang} t={t} />
        </div>
      </div>
    </>
  );

  const detailViews: Record<WorkbenchView, ReactNode> = {
    input: null,
    loading: null,
    error: null,
    dashboard,
    meeting: (
      <>
        {summaryStrip}
        <div className="grid gap-4 xl:grid-cols-2">
          <WorkbenchCard
            eyebrow="Goal State"
            title={t.goalState}
            summary={result.meetingUnderstanding.goal}
            status="Ready"
            labels={cardLabels}
          >
            <ListBlock items={result.meetingUnderstanding.requirements} />
          </WorkbenchCard>
          <WorkbenchCard
            eyebrow="Context Used"
            title={t.contextUsed}
            summary={result.meetingUnderstanding.customerContext}
            status="Ready"
            labels={cardLabels}
          >
            <ListBlock items={result.meetingUnderstanding.keyDecisions} />
          </WorkbenchCard>
          <WorkbenchCard
            eyebrow="Missing Context"
            title={t.missingContext}
            summary={t.missingContextSummary}
            status="Needs evidence"
            labels={cardLabels}
          >
            <ListBlock items={result.meetingUnderstanding.missingInfo} tone="warn" />
          </WorkbenchCard>
          <WorkbenchCard
            eyebrow="Risks"
            title={t.risks}
            summary={t.risksSummary}
            status={result.meetingUnderstanding.risks.length ? "Needs evidence" : "Ready"}
            labels={cardLabels}
          >
            <ListBlock items={result.meetingUnderstanding.risks} tone="warn" />
          </WorkbenchCard>
        </div>
      </>
    ),
    delivery: (
      <>
        {summaryStrip}
        <div className="grid gap-4">
          <WorkbenchCard
            eyebrow="Follow-up Tasks"
            title={result.deliverablePack.title}
            summary={result.deliverablePack.brief || result.deliverablePack.customerMessage}
            action={t.requestDetailAction}
            labels={cardLabels}
          >
            <ListBlock items={result.deliverablePack.tasks} />
          </WorkbenchCard>
          {result.deliverablePack.customerMessage && (
            <WorkbenchCard
              eyebrow="Draft"
              title={t.draftMessage}
              summary={result.deliverablePack.customerMessage}
              labels={cardLabels}
            />
          )}
          {result.deliverablePack.lovablePrompt && (
            <WorkbenchCard
              eyebrow="AI Prompt"
              title={t.implementationPrompt}
              summary={result.deliverablePack.lovablePrompt}
              labels={cardLabels}
            />
          )}
        </div>
      </>
    ),
    memory: (
      <>
        {summaryStrip}
        <div className="grid gap-4 xl:grid-cols-2">
          <WorkbenchCard
            eyebrow="Execution Memory"
            title={t.memoryToKeep}
            summary={t.memorySummary}
            status="Ready"
            labels={cardLabels}
          >
            <ListBlock items={result.executionMemory.memoryToPersist} />
          </WorkbenchCard>
          <WorkbenchCard
            eyebrow="Follow-up Tasks"
            title={t.nextRunItems}
            summary={t.nextItemsSummary}
            status="Ready"
            labels={cardLabels}
          >
            <ListBlock items={result.executionMemory.nextActions} />
          </WorkbenchCard>
          <div className="xl:col-span-2">
            <WorkbenchCard
              eyebrow="AI Prompt"
              title={t.continuationPrompt}
              summary={result.executionMemory.continuationPrompt}
              evidence={`${t.previousContextLabel}: ${result.executionMemory.previousContextUsed ? "yes" : "no"}`}
              action={t.continuationAction}
              labels={cardLabels}
            />
          </div>
        </div>
      </>
    ),
    history: historyView,
    evidence: (
      <>
        {summaryStrip}
        <div className="grid gap-4 xl:grid-cols-2">
          <WorkbenchCard
            eyebrow="Done Evidence"
            title={t.doneEvidence}
            summary={t.doneEvidenceSummary}
            status="Ready"
            labels={cardLabels}
          >
            <ListBlock items={result.harness.doneEvidence} tone="good" />
          </WorkbenchCard>
          <WorkbenchCard
            eyebrow="Missing Evidence"
            title={t.missingEvidence}
            summary={t.missingEvidenceSummary}
            status={result.harness.missingEvidence.length ? "Needs evidence" : "Ready"}
            labels={cardLabels}
          >
            <ListBlock items={result.harness.missingEvidence} tone="warn" />
          </WorkbenchCard>
          <WorkbenchCard
            eyebrow="Quality Checklist"
            title={t.qualityChecklist}
            summary={t.checklistSummary}
            labels={cardLabels}
          >
            <ListBlock items={result.harness.qualityChecklist} />
          </WorkbenchCard>
          <WorkbenchCard
            eyebrow="Next Verification"
            title={t.nextVerification}
            summary={result.harness.nextVerificationStep || t.nextVerificationEmpty}
            action={t.verificationAction}
            labels={cardLabels}
          />
        </div>
      </>
    ),
  };

  return shell(detailViews[activeView] ?? dashboard);
}

export default HandoffDemo;
