import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileInput,
  Brain,
  Package,
  Database,
  ShieldCheck,
  AlertOctagon,
  Search,
  ArrowRight,
  ArrowLeft,
  Play,
  Loader2,
  Check,
  Copy,
  Download,
  ChevronRight,
  Circle,
  X,
  RefreshCw,
  Code2,
} from "lucide-react";
import {
  callN8n,
  normalizeResponse,
  N8N_WEBHOOK_URL_DEBUG,
  type DeliveryType,
  type ExecutionMemoryResponse,
  type Tone,
  type UpflowRequest,
} from "@/lib/n8n";

type ViewState =
  | "input"
  | "loading"
  | "dashboard"
  | "meeting"
  | "delivery"
  | "memory"
  | "evidence"
  | "error";

const NAV: { id: ViewState; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { id: "input", label: "입력", icon: FileInput },
  { id: "meeting", label: "목표/맥락", icon: Brain },
  { id: "delivery", label: "실행 요청", icon: Package },
  { id: "memory", label: "실행 기억", icon: Database },
  { id: "evidence", label: "증거 기록", icon: ShieldCheck },
  { id: "error", label: "오류", icon: AlertOctagon },
];

const DELIVERY_OPTIONS: { value: DeliveryType; label: string }[] = [
  { value: "website_brief", label: "웹사이트 브리프" },
  { value: "followup_email", label: "고객 후속 메일" },
  { value: "prd", label: "PRD" },
  { value: "task_package", label: "작업 패키지" },
];

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "direct", label: "Direct" },
];

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // noop
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────  SHELL  ───────────────────────────── */

function Sidebar({
  view,
  setView,
  hasResult,
}: {
  view: ViewState;
  setView: (v: ViewState) => void;
  hasResult: boolean;
}) {
  return (
    <aside className="hidden md:flex w-[224px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="h-12 px-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="h-6 w-6 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
          <div className="h-2 w-2 rounded-sm bg-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold tracking-tight">Handoff</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Execution Memory Workbench
          </span>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
          Workspace
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            const disabled =
              !hasResult &&
              ["dashboard", "meeting", "delivery", "memory", "evidence"].includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => !disabled && setView(item.id)}
                disabled={disabled}
                className={cx(
                  "group flex items-center gap-2 px-2 h-7 rounded-md text-[13px] transition-colors text-left",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                  disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3 border-t border-sidebar-border">
        <div className="rounded-md border border-border bg-surface-2 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Runtime
          </div>
          <div className="text-[11px] text-foreground/80 leading-snug">
            Lovable UI · n8n · Upstage
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ view }: { view: ViewState }) {
  const crumb = NAV.find((n) => n.id === view)?.label ?? "입력";
  return (
    <div className="h-12 border-b border-border bg-background/80 backdrop-blur flex items-center px-4 gap-3">
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <span>Handoff Workbench</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{crumb}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 h-7 px-2.5 rounded-md border border-border bg-surface text-[12px] text-muted-foreground w-72">
          <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>실행 검색…</span>
          <span className="ml-auto text-[10px] border border-border rounded px-1 py-px">⌘K</span>
        </div>
        <span className="pill">
          <span className="pill-dot" style={{ background: "var(--success)" }} />
          Runtime ready
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────  INPUT  ───────────────────────────── */

function RuntimeFlowStrip() {
  const steps = [
    "Input Context",
    "n8n Runtime",
    "Upstage Analysis",
    "Execution Memory",
    "Evidence Ledger",
    "Next Agent Run",
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className="pill">
            <span className="pill-dot" style={{ background: i === steps.length - 1 ? "var(--primary)" : undefined }} />
            {s}
          </span>
          {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
        </span>
      ))}
    </div>
  );
}

function MeetingInputForm({
  form,
  setForm,
  onSubmit,
  onShowError,
}: {
  form: UpflowRequest;
  setForm: (f: UpflowRequest) => void;
  onSubmit: () => void;
  onShowError: () => void;
}) {
  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-6 space-y-5">
      {/* Intro */}
      <div className="space-y-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-primary">
          Handoff Execution Memory Workbench
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight leading-tight">
          다음 Agent Run이 이어받을 실행 상태를 만드는 작업대
        </h1>
        <p className="text-[13.5px] text-muted-foreground max-w-2xl leading-relaxed">
          회의, 메모, 이슈, 업무 요청처럼 흩어진 업무 맥락을 실행 기억, 증거, 다음 실행 요청으로
          변환합니다. Meeting Delivery는 첫 번째 입력 사례일 뿐입니다.
        </p>
        <RuntimeFlowStrip />
      </div>

      {/* Form panel */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <span className="panel-title">업무 맥락 입력</span>
          </div>
        </div>


        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="회의명" className="md:col-span-2">
              <input
                value={form.meetingTitle}
                onChange={(e) => setForm({ ...form, meetingTitle: e.target.value })}
                className="ui-input"
                placeholder="예: 11월 1주 고객 미팅"
              />
            </Field>
            <Field label="수신자 (선택)">
              <input
                value={form.recipient ?? ""}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                className="ui-input"
                placeholder="예: client@example.com"
              />
            </Field>
          </div>

          <Field label="산출물 유형">
            <div className="flex flex-wrap gap-1.5">
              {DELIVERY_OPTIONS.map((opt) => {
                const active = form.deliveryType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, deliveryType: opt.value })}
                    className={cx(
                      "h-7 px-3 rounded-md text-[12px] border transition-colors",
                      active
                        ? "border-primary/60 bg-primary/15 text-foreground"
                        : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="톤 설정">
            <div className="flex flex-wrap gap-1.5">
              {TONE_OPTIONS.map((opt) => {
                const active = form.tone === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, tone: opt.value })}
                    className={cx(
                      "h-7 px-3 rounded-md text-[12px] border transition-colors",
                      active
                        ? "border-border-strong bg-surface-3 text-foreground"
                        : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="업무 맥락">
            <textarea
              value={form.transcript}
              onChange={(e) => setForm({ ...form, transcript: e.target.value })}
              rows={10}
              className="ui-input font-mono text-[12.5px] leading-relaxed resize-y"
              placeholder="회의록, 고객 메모, Slack 논의, 이슈 설명, 작업 요청을 붙여넣으세요. Handoff가 다음 Agent Run이 이어받을 실행 기억으로 정리합니다."
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
              <span>{form.transcript.length.toLocaleString()} chars</span>
              <span>다음 Agent가 사용한 맥락 · 증거 · 다음 실행으로 변환됩니다</span>
            </div>
          </Field>
        </div>

        <div className="border-t border-border px-5 py-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onShowError}
            className="h-8 px-3 rounded-md text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            오류 화면 보기
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!form.meetingTitle.trim() || !form.transcript.trim()}
            className="h-8 px-3.5 rounded-md text-[12.5px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={2.25} />
            실행 시작
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("flex flex-col gap-1.5", className)}>
      <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ─────────────────────────────  LOADING  ───────────────────────────── */

function ProcessingState({ onCancel }: { onCancel: () => void }) {
  const steps = [
    "Input Context · 업무 맥락 수신",
    "n8n Runtime · 파이프라인 실행",
    "Upstage Analysis · 의미 분석",
    "Execution Memory · 실행 기억 정리",
    "Evidence Ledger · 증거 기록",
    "Next Agent Run · 다음 실행 준비",
  ];
  const activeIdx = 2;
  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-10">
      <div className="panel overflow-hidden">
        <div className="panel-header">
          <span className="panel-title">Handoff 파이프라인 실행 중</span>
          <span className="pill">
            <Loader2 className="h-3 w-3 animate-spin" />
            executing
          </span>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2.5">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md border border-border bg-surface-2 flex items-center justify-center">
                  {i < activeIdx ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : i === activeIdx ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={cx(
                    "text-[13px]",
                    i === activeIdx ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-border bg-surface-2 px-3.5 py-2.5 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              예상 완료까지
            </span>
            <span className="text-[13px] font-medium">약 45초</span>
          </div>
        </div>
        <div className="border-t border-border px-5 py-3 flex justify-end">
          <button
            onClick={onCancel}
            className="h-8 px-3 rounded-md text-[12px] border border-border bg-surface-2 hover:bg-surface-3 transition-colors inline-flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────  DASHBOARD  ───────────────────────────── */

function ResultDashboard({
  data,
  setView,
  onToggleJson,
  jsonOpen,
}: {
  data: ExecutionMemoryResponse;
  setView: (v: ViewState) => void;
  onToggleJson: () => void;
  jsonOpen: boolean;
}) {
  const doneCount = data.harness.doneEvidence.length;
  const missingCount =
    data.harness.missingEvidence.length + data.meetingUnderstanding.missingInfo.length;
  const confidence = Math.max(
    20,
    Math.min(99, 60 + doneCount * 6 - missingCount * 4),
  );

  const kpis = [
    { label: "Handoff 상태", value: "Ready", helper: "다음 Agent Run 인계 가능", tone: "success" as const },
    { label: "증거 기록", value: String(doneCount), helper: "검증된 근거" },
    { label: "다음 실행 항목", value: String(data.executionMemory.nextActions.length), helper: "다음 Agent가 처리할 작업" },
    { label: "누락 증거", value: String(missingCount), helper: "후속 확보 필요", tone: "warning" as const },
  ];

  const domains: { id: ViewState; label: string; status: string; tone: "success" | "warning" }[] = [
    { id: "meeting", label: "목표/맥락", status: "정리 완료", tone: "success" },
    { id: "memory", label: "실행 기억", status: "동기화 완료", tone: "success" },
    { id: "delivery", label: "실행 요청", status: "검토 필요", tone: "warning" },
    { id: "evidence", label: "증거 기록", status: "검증 완료", tone: "success" },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-6 space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Handoff 작업대</h1>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            업무 맥락이 실행 기억 · 증거 · 다음 실행으로 정리되었습니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleJson}
            className="h-8 px-3 rounded-md text-[12px] border border-border bg-surface-2 hover:bg-surface-3 inline-flex items-center gap-1.5"
          >
            <Code2 className="h-3.5 w-3.5" />
            {jsonOpen ? "Raw JSON 닫기" : "Raw JSON 보기"}
          </button>
          <button
            onClick={() => setView("meeting")}
            className="h-8 px-3 rounded-md text-[12px] bg-primary text-primary-foreground inline-flex items-center gap-1.5"
          >
            목표/맥락 상세 보기
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {kpis.map((k) => (
          <div key={k.label} className="panel p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {k.label}
            </div>
            <div
              className={cx(
                "mt-1 text-[22px] font-semibold tracking-tight",
                k.tone === "success" && "text-success",
                k.tone === "warning" && "text-warning",
              )}
            >
              {k.value}
            </div>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">{k.helper}</div>
          </div>
        ))}
      </div>

      {/* Domain cards */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">결과 영역별 현황</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:divide-x divide-border">
            <DomainCard d={domains[0]} setView={setView} />
            <DomainCard d={domains[1]} setView={setView} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:divide-x divide-border border-t md:border-t-0 border-border">
            <DomainCard d={domains[2]} setView={setView} />
            <DomainCard d={domains[3]} setView={setView} />
          </div>
        </div>
      </div>

      {/* Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">핵심 의사결정 항목</span>
            <button
              onClick={() => setView("meeting")}
              className="text-[11.5px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              회의 이해 전체 보기 <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-4 py-2">항목</th>
                <th className="text-left font-medium px-4 py-2">상태</th>
                <th className="text-left font-medium px-4 py-2">담당</th>
                <th className="text-left font-medium px-4 py-2">기한</th>
              </tr>
            </thead>
            <tbody>
              {(data.meetingUnderstanding.keyDecisions.length
                ? data.meetingUnderstanding.keyDecisions
                : ["-"]
              )
                .slice(0, 4)
                .map((d, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2.5 text-foreground">{d}</td>
                    <td className="px-4 py-2.5">
                      <span className="pill">
                        <span className="pill-dot" style={{ background: "var(--success)" }} />
                        확정
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">PM</td>
                    <td className="px-4 py-2.5 text-muted-foreground">—</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">증거 기반 완료 판단</span>
            <button
              onClick={() => setView("evidence")}
              className="text-[11.5px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              증거 전체 보기 <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-4 py-2">증거 항목</th>
                <th className="text-left font-medium px-4 py-2">출처</th>
                <th className="text-left font-medium px-4 py-2">신뢰도</th>
              </tr>
            </thead>
            <tbody>
              {(data.harness.doneEvidence.length ? data.harness.doneEvidence : ["-"])
                .slice(0, 4)
                .map((d, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2.5 text-foreground">{d}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">transcript</td>
                    <td className="px-4 py-2.5 text-muted-foreground">High</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Follow-up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FollowupCard
          title="Delivery Pack"
          status="검토 대기"
          tone="warning"
          desc="산출물 패키지 내 누락 항목이 감지되었습니다. 검토 후 확정하세요."
          action="Delivery Pack 검토"
          onClick={() => setView("delivery")}
        />
        <FollowupCard
          title="기억과 다음 실행"
          status="동기화 완료"
          tone="success"
          desc="기억과 다음 실행 상태가 최신으로 정리되었습니다."
          action="메모리 확인"
          onClick={() => setView("memory")}
        />
        <FollowupCard
          title="증거 검증"
          status="완료"
          tone="success"
          desc="모든 증거 항목이 검증되었습니다."
          action="증거 보기"
          onClick={() => setView("evidence")}
        />
      </div>
    </div>
  );
}

function DomainCard({
  d,
  setView,
}: {
  d: { id: ViewState; label: string; status: string; tone: "success" | "warning" };
  setView: (v: ViewState) => void;
}) {
  return (
    <button
      onClick={() => setView(d.id)}
      className="text-left p-4 hover:bg-surface-2 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium">{d.label}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="pill">
          <span
            className="pill-dot"
            style={{
              background: d.tone === "success" ? "var(--success)" : "var(--warning)",
            }}
          />
          {d.status}
        </span>
        <span className="text-[11.5px] text-muted-foreground">상세 보기</span>
      </div>
    </button>
  );
}

function FollowupCard({
  title,
  status,
  tone,
  desc,
  action,
  onClick,
}: {
  title: string;
  status: string;
  tone: "success" | "warning";
  desc: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="panel p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium">{title}</span>
        <span className="pill">
          <span
            className="pill-dot"
            style={{ background: tone === "success" ? "var(--success)" : "var(--warning)" }}
          />
          {status}
        </span>
      </div>
      <p className="text-[12.5px] text-muted-foreground leading-relaxed">{desc}</p>
      <button
        onClick={onClick}
        className="mt-auto self-start text-[12px] text-primary hover:underline inline-flex items-center gap-1"
      >
        {action} <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ─────────────────────────────  DETAIL: BACK BAR  ───────────────────────────── */

function BackBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onBack}
        className="h-7 px-2 rounded-md text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-2 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 결과 대시보드로
      </button>
      <h1 className="text-[18px] font-semibold tracking-tight">{title}</h1>
      <div className="w-[120px]" />
    </div>
  );
}

function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">{title}</span>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SmallBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Copy;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-6.5 px-2 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-surface-3 inline-flex items-center gap-1 border border-border bg-surface-2"
      style={{ height: 26 }}
    >
      <Icon className="h-3 w-3" /> {label}
    </button>
  );
}

/* ─────────────────────────────  MEETING UNDERSTANDING  ───────────────────────────── */

function MeetingUnderstandingPanel({
  data,
  onBack,
}: {
  data: ExecutionMemoryResponse;
  onBack: () => void;
}) {
  const mu = data.meetingUnderstanding;
  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-6">
      <BackBar onBack={onBack} title="회의 이해" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="panel p-4 lg:col-span-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">목표</div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed">{mu.goal}</p>
        </div>
        <div className="panel p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            고객 컨텍스트
          </div>
          <p className="mt-1.5 text-[13px] text-foreground/85 leading-relaxed">
            {mu.customerContext}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <Section
          title="핵심 결정사항"
          actions={
            <SmallBtn icon={Copy} label="복사" onClick={() => copyText(mu.keyDecisions.join("\n"))} />
          }
        >
          <BulletList items={mu.keyDecisions} />
        </Section>

        <Section
          title="요구사항 목록"
          actions={
            <SmallBtn
              icon={Download}
              label="다운로드"
              onClick={() => downloadText("requirements.txt", mu.requirements.join("\n"))}
            />
          }
        >
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium pb-2">요구사항</th>
                <th className="text-left font-medium pb-2">우선순위</th>
                <th className="text-left font-medium pb-2">담당</th>
                <th className="text-left font-medium pb-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {(mu.requirements.length ? mu.requirements : ["-"]).map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2 pr-3 text-foreground">{r}</td>
                  <td className="py-2 pr-3">
                    <span className="pill">P{(i % 3) + 1}</span>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">PM</td>
                  <td className="py-2">
                    <span className="pill">
                      <span className="pill-dot" />
                      대기
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="누락 정보">
          <BulletList
            items={mu.missingInfo}
            chip={(i) => (i % 2 === 0 ? "높음" : "보통")}
            chipTone={(i) => (i % 2 === 0 ? "warning" : "muted")}
          />
        </Section>

        <Section
          title="리스크"
          actions={
            <SmallBtn
              icon={Download}
              label="내보내기"
              onClick={() => downloadText("risks.txt", mu.risks.join("\n"))}
            />
          }
        >
          <BulletList
            items={mu.risks}
            chip={(i) => (i % 2 === 0 ? "경고" : "주의")}
            chipTone={(i) => (i % 2 === 0 ? "danger" : "warning")}
          />
        </Section>
      </div>
    </div>
  );
}

function BulletList({
  items,
  chip,
  chipTone,
}: {
  items: string[];
  chip?: (i: number) => string;
  chipTone?: (i: number) => "danger" | "warning" | "muted";
}) {
  const list = items.length ? items : ["-"];
  return (
    <ul className="space-y-2">
      {list.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px]">
          <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
          <span className="flex-1 leading-relaxed">{it}</span>
          {chip && (
            <span
              className="pill"
              style={{
                borderColor:
                  chipTone?.(i) === "danger"
                    ? "color-mix(in oklab, var(--destructive) 50%, var(--border))"
                    : chipTone?.(i) === "warning"
                      ? "color-mix(in oklab, var(--warning) 40%, var(--border))"
                      : undefined,
                color:
                  chipTone?.(i) === "danger"
                    ? "var(--destructive)"
                    : chipTone?.(i) === "warning"
                      ? "var(--warning)"
                      : undefined,
              }}
            >
              {chip(i)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────  DELIVERY PACK  ───────────────────────────── */

function DeliveryPackPanel({
  data,
  onBack,
}: {
  data: ExecutionMemoryResponse;
  onBack: () => void;
}) {
  const dp = data.deliverablePack;
  const blocks: { title: string; content: string; filename: string }[] = [
    { title: "고객 메시지", content: dp.customerMessage, filename: "customer-message.txt" },
    { title: "브리프", content: dp.brief, filename: "brief.txt" },
    { title: "프롬프트", content: dp.lovablePrompt ?? "-", filename: "prompt.txt" },
    { title: "태스크 패키지", content: dp.tasks.join("\n"), filename: "tasks.txt" },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-6">
      <BackBar onBack={onBack} title="전달물 패키지" />

      <div className="panel p-4 mb-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Pack Title
          </div>
          <div className="text-[14px] font-medium mt-0.5">{dp.title}</div>
        </div>
        <span className="pill">{dp.type}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {blocks.map((b) => (
          <Section
            key={b.title}
            title={b.title}
            actions={
              <>
                <SmallBtn icon={Copy} label="복사" onClick={() => copyText(b.content)} />
                <SmallBtn
                  icon={Download}
                  label="다운로드"
                  onClick={() => downloadText(b.filename, b.content)}
                />
              </>
            }
          >
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-foreground/90">
              {b.content || "-"}
            </pre>
          </Section>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────  MEMORY & NEXT  ───────────────────────────── */

function MemoryNextExecutionPanel({
  data,
  onBack,
}: {
  data: ExecutionMemoryResponse;
  onBack: () => void;
}) {
  const em = data.executionMemory;
  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-6">
      <BackBar onBack={onBack} title="기억과 다음 실행" />

      <div className="panel p-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="pill">
            <span
              className="pill-dot"
              style={{ background: em.previousContextUsed ? "var(--success)" : "var(--muted-foreground)" }}
            />
            이전 컨텍스트 {em.previousContextUsed ? "사용됨" : "없음"}
          </span>
          <span className="text-[12px] text-muted-foreground">
            메모리는 다음 실행으로 자동 이어집니다.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Section title="지속 메모">
          <BulletList items={em.memoryToPersist} />
        </Section>

        <Section
          title="이어가기 프롬프트"
          actions={
            <SmallBtn icon={Copy} label="복사" onClick={() => copyText(em.continuationPrompt)} />
          }
        >
          <div className="rounded-md border border-border bg-surface-2 p-3">
            <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mb-1.5">
              추천 프롬프트
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/90">
              {em.continuationPrompt}
            </pre>
          </div>
        </Section>

        <Section title="다음 액션 제안">
          <ol className="space-y-2">
            {(em.nextActions.length ? em.nextActions : ["-"]).map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px]">
                <span className="h-5 w-5 rounded-md border border-border bg-surface-2 text-[11px] flex items-center justify-center shrink-0 text-muted-foreground">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </div>
  );
}

/* ─────────────────────────────  EVIDENCE  ───────────────────────────── */

function EvidenceVerificationPanel({
  data,
  onBack,
}: {
  data: ExecutionMemoryResponse;
  onBack: () => void;
}) {
  const h = data.harness;
  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-6">
      <BackBar onBack={onBack} title="증거 검증" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="space-y-3">
          <Section title="완료 증거 (Done Evidence)">
            <ul className="space-y-2">
              {(h.doneEvidence.length ? h.doneEvidence : ["-"]).map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[13px] rounded-md border border-border bg-surface-2 px-3 py-2"
                >
                  <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                  <span className="flex-1 leading-relaxed">{d}</span>
                  <span className="pill" style={{ color: "var(--success)" }}>
                    확인됨
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="누락 증거 (Missing Evidence)">
            <ul className="space-y-2">
              {(h.missingEvidence.length ? h.missingEvidence : ["-"]).map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[13px] rounded-md border border-border bg-surface-2 px-3 py-2"
                >
                  <Circle className="h-3 w-3 text-warning mt-1 shrink-0" />
                  <span className="flex-1 leading-relaxed">{d}</span>
                  <span className="pill" style={{ color: "var(--warning)" }}>
                    미확인
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="space-y-3">
          <Section title="품질 체크리스트">
            <ul className="space-y-1.5">
              {(h.qualityChecklist.length ? h.qualityChecklist : ["-"]).map((q, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px]">
                  <span
                    className={cx(
                      "mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0",
                      i % 2 === 0
                        ? "bg-primary/15 border-primary/50"
                        : "bg-surface-2 border-border",
                    )}
                  >
                    {i % 2 === 0 && <Check className="h-3 w-3 text-primary" />}
                  </span>
                  <span className="flex-1 leading-relaxed">{q}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="다음 검증 단계">
            <ol className="space-y-2">
              {[
                h.nextVerificationStep,
                "누락 증거 보완",
                "품질 체크리스트 재확인",
                "최종 승인 요청",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px]">
                  <span className="h-5 w-5 rounded-md border border-border bg-surface-2 text-[11px] flex items-center justify-center shrink-0 text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────  ERROR  ───────────────────────────── */

function ErrorState({
  message,
  onBackToInput,
  onRetry,
}: {
  message: string | null;
  onBackToInput: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-10">
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">처리 오류</span>
          <span className="pill" style={{ color: "var(--destructive)" }}>
            <span className="pill-dot" style={{ background: "var(--destructive)" }} />
            ERR_PROCESS_FAILED
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-[15px] font-medium">요청 처리에 실패했습니다</div>
            <div className="text-[12.5px] text-muted-foreground mt-1">
              오류 코드: ERR_PROCESS_FAILED
            </div>
            {message && (
              <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12.5px] text-foreground font-mono break-all">
                {message}
              </div>
            )}
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                VITE_N8N_WEBHOOK_URL
              </div>
              <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px] font-mono break-all">
                {N8N_WEBHOOK_URL_DEBUG}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border border-border bg-surface-2 p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                발생 원인
              </div>
              <ul className="space-y-1.5 text-[12.5px] text-foreground/85">
                <li>입력한 회의 정보가 불완전합니다</li>
                <li>필수 항목이 누락되었거나 형식이 맞지 않습니다</li>
                <li>시스템 일시적 오류입니다</li>
              </ul>
            </div>
            <div className="rounded-md border border-border bg-surface-2 p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                해결 방법
              </div>
              <ul className="space-y-1.5 text-[12.5px] text-foreground/85">
                <li>이전 단계로 돌아가 입력 정보를 확인하세요</li>
                <li>필수 항목을 모두 채우고 형식을 다시 확인하세요</li>
                <li>재시도 버튼으로 다시 제출해보세요</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border px-5 py-3 flex justify-end gap-2">
          <button
            onClick={onBackToInput}
            className="h-8 px-3 rounded-md text-[12px] border border-border bg-surface-2 hover:bg-surface-3 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 입력으로 돌아가기
          </button>
          <button
            onClick={onRetry}
            className="h-8 px-3 rounded-md text-[12px] bg-primary text-primary-foreground inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> 재시도
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────  RAW JSON DRAWER  ───────────────────────────── */

function RawJsonDrawer({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: unknown;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-[560px] bg-surface border-l border-border flex flex-col">
        <div className="h-12 px-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] font-medium">Raw n8n / Upstage response</span>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md hover:bg-surface-2 flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-[11.5px] leading-relaxed font-mono text-foreground/85 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/* ─────────────────────────────  DEBUG PANEL  ───────────────────────────── */

const PING_PAYLOAD = {
  customerName: "Ping",
  meetingTitle: "Ping",
  meetingNotes: "Ping",
  deliveryType: "website_brief",
  language: "ko",
} as const;

function DebugPanel() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);

  const ping = async () => {
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await callN8n(PING_PAYLOAD as unknown as UpflowRequest);
      setResult(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-40 w-[420px] max-w-[calc(100vw-1.5rem)] rounded-md border border-border bg-surface shadow-lg text-[12px] font-mono">
      <div className="flex items-center justify-between px-3 h-8 border-b border-border">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          n8n Debug
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          {open ? "접기" : "펼치기"}
        </button>
      </div>
      {open && (
        <div className="p-3 space-y-2 max-h-[60vh] overflow-auto">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              VITE_N8N_WEBHOOK_URL
            </div>
            <div className="break-all rounded border border-border bg-surface-2 px-2 py-1.5 text-[11px]">
              {N8N_WEBHOOK_URL_DEBUG}
            </div>
          </div>
          <button
            onClick={ping}
            disabled={loading}
            className="h-7 px-3 rounded-md text-[12px] bg-primary text-primary-foreground inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            웹훅 연결 테스트
          </button>
          {result !== null && (() => {
            const r = (result ?? {}) as Record<string, unknown>;
            const success = r.success !== false && !r._error;
            const warnings = Array.isArray(r._warnings) ? (r._warnings as unknown[]) : [];
            const errObj = (r._error ?? null) as Record<string, unknown> | null;
            const em = (r.executionMemory ?? {}) as Record<string, unknown>;
            const prevUsed = Boolean(em.previousContextUsed);
            const panels = ["meetingUnderstanding", "deliverablePack", "executionMemory", "harness"] as const;
            return (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className={cx("inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] border", success ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive")}>
                    success: {String(success)}
                  </span>
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] border border-border bg-surface-2">
                    warnings: {warnings.length}
                  </span>
                  <span className={cx("inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] border", errObj ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-surface-2 text-muted-foreground")}>
                    _error: {errObj ? String(errObj.code ?? "yes") : "null"}
                  </span>
                  <span className={cx("inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] border", prevUsed ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface-2 text-muted-foreground")}>
                    previousContextUsed: {String(prevUsed)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {panels.map((p) => {
                    const ok = r[p] && typeof r[p] === "object";
                    return (
                      <span key={p} className={cx("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] border", ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/40 bg-destructive/10 text-destructive")}>
                        {ok ? "✓" : "✗"} {p}
                      </span>
                    );
                  })}
                </div>
                {errObj && (
                  <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-[10.5px] break-all">
                    <div className="font-semibold">{String(errObj.code ?? "ERROR")}</div>
                    <div>{String(errObj.message ?? "")}</div>
                    {errObj.preview ? <div className="mt-1 opacity-80">preview: {String(errObj.preview)}</div> : null}
                  </div>
                )}
                {warnings.length > 0 && (
                  <ul className="rounded border border-border bg-surface-2 p-2 text-[10.5px] list-disc pl-4">
                    {warnings.map((w, i) => <li key={i}>{String(w)}</li>)}
                  </ul>
                )}
                <details>
                  <summary className="text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer">Raw JSON</summary>
                  <pre className="mt-1 rounded border border-border bg-surface-2 p-2 text-[10.5px] whitespace-pre-wrap break-all">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            );
          })()}
          {err && (
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-destructive">
                ✗ 실패
              </div>
              <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-[11px] break-all">
                {err}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Webhook URL
              </div>
              <div className="rounded border border-border bg-surface-2 p-2 text-[11px] break-all">
                {N8N_WEBHOOK_URL_DEBUG}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Payload
              </div>
              <pre className="rounded border border-border bg-surface-2 p-2 text-[10.5px] whitespace-pre-wrap break-all">
                {JSON.stringify(PING_PAYLOAD, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────  ROOT  ───────────────────────────── */

export default function UpflowDemo() {
  const [view, setView] = useState<ViewState>("input");
  const [form, setForm] = useState<UpflowRequest>({
    meetingTitle: "",
    transcript: "",
    deliveryType: "website_brief",
    recipient: "",
    tone: "professional",
  });
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);

  const data = useMemo<ExecutionMemoryResponse | null>(
    () => (raw ? normalizeResponse(raw) : null),
    [raw],
  );

  const run = async () => {
    setError(null);
    setView("loading");
    try {
      const result = await callN8n(form);
      setRaw(result);
      setView("dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setView("error");
    }
  };

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      <Sidebar view={view} setView={setView} hasResult={Boolean(data)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar view={view} />
        <main className="flex-1 overflow-auto">
          {view === "input" && (
            <MeetingInputForm
              form={form}
              setForm={setForm}
              onSubmit={run}
              onShowError={() => {
                setError("VITE_N8N_WEBHOOK_URL이 설정되지 않았거나 demo error 트리거됨");
                setView("error");
              }}
            />
          )}
          {view === "loading" && <ProcessingState onCancel={() => setView("input")} />}
          {view === "dashboard" && data && (
            <ResultDashboard
              data={data}
              setView={setView}
              onToggleJson={() => setJsonOpen((v) => !v)}
              jsonOpen={jsonOpen}
            />
          )}
          {view === "meeting" && data && (
            <MeetingUnderstandingPanel data={data} onBack={() => setView("dashboard")} />
          )}
          {view === "delivery" && data && (
            <DeliveryPackPanel data={data} onBack={() => setView("dashboard")} />
          )}
          {view === "memory" && data && (
            <MemoryNextExecutionPanel data={data} onBack={() => setView("dashboard")} />
          )}
          {view === "evidence" && data && (
            <EvidenceVerificationPanel data={data} onBack={() => setView("dashboard")} />
          )}
          {view === "error" && (
            <ErrorState
              message={error}
              onBackToInput={() => setView("input")}
              onRetry={run}
            />
          )}
          {/* Fallback when detail view selected but no data */}
          {["dashboard", "meeting", "delivery", "memory", "evidence"].includes(view) &&
            !data && (
              <div className="max-w-md mx-auto mt-20 text-center text-[13px] text-muted-foreground">
                먼저 입력 화면에서 실행을 시작하세요.
              </div>
            )}
        </main>
      </div>

      <RawJsonDrawer open={jsonOpen} onClose={() => setJsonOpen(false)} data={raw} />
      <DebugPanel />

      <style>{`
        .ui-input {
          width: 100%;
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 7px 10px;
          font-size: 13px;
          color: var(--foreground);
          outline: none;
          transition: border-color .12s ease, box-shadow .12s ease;
        }
        .ui-input:focus {
          border-color: color-mix(in oklab, var(--primary) 60%, var(--border));
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent);
        }
        textarea.ui-input { padding: 10px 12px; }
      `}</style>
    </div>
  );
}
