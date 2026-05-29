import { useState } from "react";
import HandoffDemo, { AuthButton } from "@/components/HandoffDemo";
import { useAuth } from "@/lib/use-auth";

type Lang = "ko" | "en";

const GITHUB_URL = "https://github.com/chattchatt/handoff";

const copy = {
  ko: {
    nav: {
      demo: "데모",
      preview: "결과 예시",
      how: "작동 방식",
      github: "GitHub",
    },
    team: "E-Hong",
    project: "Handoff",
    heroEyebrow: "Agent Handoff 작업대",
    heroTitle: "흩어진 업무 맥락을 다음 사람이 바로 이어받게",
    heroBody:
      "회의록·메모·이슈·업무 요청을 붙여넣으면, 다음 담당자나 AI가 곧바로 일을 이어받을 수 있도록 핵심 요약·결정·해야 할 일·근거로 정리해 드립니다.",
    openGithub: "GitHub 열기",
    loginAria: "GitHub로 로그인",
    connectLabel: "GitHub 연결",
    logoutAria: "로그아웃",
    demoCta: "지금 정리해 보기",
    previewCta: "결과 예시 보기",
    workbenchCta: "작업대 열기",
    demoEyebrow: "직접 해보기",
    demoTitle: "업무 맥락을 붙여넣고 바로 정리해 보세요.",
    demoBody:
      "긴 회의록을 붙여넣거나 TXT·MD·PDF 파일을 올리면 핵심 요약, 결정 사항, 해야 할 일, 더 확인할 점, 근거 자료가 자동으로 만들어집니다.",
    previewEyebrow: "결과 화면",
    previewTitle: "이어받는 사람이 읽는 순서 그대로 정리됩니다.",
    previewBody:
      "다음 담당자에게 먼저 필요한 것은 지금 상태, 결정된 내용, 해야 할 일, 부족한 맥락, 그리고 원문 근거입니다.",
    howEyebrow: "작동 방식",
    howTitle: "흩어진 맥락을 실행 가능한 상태로 압축합니다.",
    howBody:
      "원문에서 목적과 결정 사항을 분리하고, 이어받는 사람이 바로 움직일 수 있도록 해야 할 일과 근거를 함께 묶어 줍니다.",
  },
  en: {
    nav: {
      demo: "Demo",
      preview: "Example",
      how: "How it works",
      github: "GitHub",
    },
    team: "E-Hong",
    project: "Handoff",
    heroEyebrow: "Agent Handoff Workbench",
    heroTitle: "Hand off scattered work so the next person picks it up instantly",
    heroBody:
      "Paste meeting notes, memos, issues, or requests and Handoff organizes them into a summary, decisions, next steps, and evidence — so the next teammate or AI can continue the work right away.",
    openGithub: "Open GitHub",
    loginAria: "Sign in with GitHub",
    connectLabel: "Connect GitHub",
    logoutAria: "Sign out",
    demoCta: "Organize it now",
    previewCta: "See an example",
    workbenchCta: "Open workbench",
    demoEyebrow: "Try it here",
    demoTitle: "Paste your work context and organize it instantly.",
    demoBody:
      "Paste a long transcript or upload a TXT, MD, or PDF file, and Handoff generates a summary, decisions, next steps, open questions, and evidence automatically.",
    previewEyebrow: "Result view",
    previewTitle: "Organized in the order the next person actually reads.",
    previewBody:
      "What the next teammate needs first is the current state, decisions, next steps, missing context, and the source evidence.",
    howEyebrow: "How it works",
    howTitle: "Compress scattered context into a ready-to-run state.",
    howBody:
      "Handoff separates intent and decisions from the raw input, then bundles next steps with the evidence needed to verify them.",
  },
} satisfies Record<Lang, Record<string, string | Record<string, string>>>;



type CardImportance = "confirmed" | "action" | "review" | "prompt";
type PreviewCard = { title: string; body: string; importance: CardImportance; tag: string };

const previewCards: Record<Lang, Array<PreviewCard>> = {
  ko: [
    {
      title: "핵심 요약",
      body: "현재 목표와 실행 상태를 한 문단으로 정리합니다.",
      importance: "confirmed",
      tag: "확정",
    },
    {
      title: "결정 사항",
      body: "이미 합의된 내용과 요구사항을 분리합니다.",
      importance: "confirmed",
      tag: "확정",
    },
    {
      title: "후속 작업",
      body: "이어받는 담당자가 바로 처리할 작업을 앞에 둡니다.",
      importance: "action",
      tag: "진행 필요",
    },
    {
      title: "보완 필요 사항",
      body: "실행 전 더 필요한 맥락과 리스크를 드러냅니다.",
      importance: "review",
      tag: "추가 확인",
    },
    {
      title: "사용한 맥락/근거 자료",
      body: "원문에서 어떤 근거를 사용했는지 추적합니다.",
      importance: "confirmed",
      tag: "확정",
    },
    {
      title: "AI 호출용 프롬프트",
      body: "필요한 경우 다음 Agent Run에 넘길 프롬프트를 제공합니다.",
      importance: "prompt",
      tag: "AI 전달용",
    },
  ],
  en: [
    {
      title: "Summary",
      body: "Current goal and runnable state in one short section.",
      importance: "confirmed",
      tag: "Confirmed",
    },
    {
      title: "Decisions",
      body: "Agreed decisions and requirements are separated.",
      importance: "confirmed",
      tag: "Confirmed",
    },
    {
      title: "Follow-up Tasks",
      body: "The next executor sees the immediate work first.",
      importance: "action",
      tag: "Action needed",
    },
    {
      title: "Missing Context",
      body: "Gaps and risks are exposed before execution.",
      importance: "review",
      tag: "Needs review",
    },
    {
      title: "Context / Evidence",
      body: "The source evidence behind the result stays traceable.",
      importance: "confirmed",
      tag: "Confirmed",
    },
    {
      title: "AI Prompt",
      body: "A continuation prompt is available when another Agent Run needs it.",
      importance: "prompt",
      tag: "For AI",
    },
  ],
};

const PREVIEW_IMPORTANCE_STYLE: Record<CardImportance, { bar: string; badge: string }> = {
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

const processSteps: Record<Lang, string[]> = {
  ko: ["원문 입력", "목표와 결정 추출", "후속 작업 정리", "근거 자료 연결"],
  en: ["Input context", "Extract goal and decisions", "Shape follow-up work", "Attach evidence"],
};

const glassSurface =
  "border border-white/[0.16] bg-white/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.05),0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl";

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "ko";
  return new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "ko";
}

function goToWorkbench() {
  window.history.pushState({}, "", "/app");
  window.dispatchEvent(new Event("popstate"));
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}


function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <img
        className={compact ? "h-8 w-8" : "h-11 w-11"}
        src="/handoff-logo.png"
        alt="Handoff logo"
      />
      <span className="grid leading-tight">
        <span
          className={
            compact ? "text-base font-semibold text-white" : "text-xl font-semibold text-white"
          }
        >
          Handoff
        </span>
      </span>
    </span>
  );
}

function SectionConnector() {
  return (
    <div className="relative z-10 flex justify-center" aria-hidden>
      <div className="flex flex-col items-center">
        <span className="h-14 w-px bg-gradient-to-b from-transparent via-white/15 to-white/25" />
        <span className="my-1 h-2 w-2 rotate-45 rounded-[2px] border border-white/30 bg-white/[0.10] shadow-[0_0_12px_rgba(151,179,255,0.35)]" />
        <span className="h-14 w-px bg-gradient-to-b from-white/25 via-white/15 to-transparent" />
      </div>
    </div>
  );
}

function SectionEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-2 text-xs font-bold tabular-nums text-[#d7dceb] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        {index}
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
        {label}
      </span>
    </div>
  );
}

export function HandoffLanding() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const auth = useAuth();
  const text = copy[lang];
  const nav = text.nav as Record<string, string>;

  function changeLang(nextLang: Lang) {
    setLang(nextLang);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLang);
    window.history.replaceState({}, "", url.toString());
  }


  return (
    <main
      className="relative isolate min-h-screen overflow-hidden bg-[#1A1F31] text-[#f6f4ee]"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_24%_22%,rgba(255,255,255,0.10),transparent_24%),radial-gradient(circle_at_72%_20%,rgba(151,179,255,0.10),transparent_28%),linear-gradient(180deg,rgba(3,4,7,0.03),rgba(3,4,7,0.38)_62%,rgba(3,4,7,0.84))]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.12] bg-[#1A1F31]/[0.58] shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            className="text-left"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <LogoLockup compact />
          </button>
          <nav className="hidden items-center gap-6 text-sm text-[#9aa3b5] md:flex">
            <button className="hover:text-white" onClick={() => scrollToId("demo")}>
              {nav.demo}
            </button>
            <button className="hover:text-white" onClick={() => scrollToId("preview")}>
              {nav.preview}
            </button>
            <button className="hover:text-white" onClick={() => scrollToId("how")}>
              {nav.how}
            </button>
            <a href={GITHUB_URL} className="hover:text-white">

              {nav.github}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-white/[0.12] bg-white/[0.06] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
              {(["ko", "en"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`h-8 rounded px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31] sm:px-3 ${lang === item ? "bg-white/[0.14] text-white" : "text-[#c7cfdd] hover:bg-[#5D7EEB]/[0.10] hover:text-white"}`}
                  onClick={() => changeLang(item)}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <AuthButton
              auth={auth}
              t={{
                loginAria: text.loginAria as string,
                logoutAria: text.logoutAria as string,
                connectLabel: text.connectLabel as string,
              }}
            />
          </div>
        </div>
      </header>

      <section className="relative z-10 isolate overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#1A1F31] to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(88vh-4.5rem)] max-w-7xl flex-col justify-center px-5 py-14">
          <div className="mx-auto w-full max-w-3xl min-w-0 text-center">
            <div className="mb-7 flex justify-center">
              <LogoLockup />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
              {text.heroEyebrow as string}
            </p>
            <h1 className="mt-5 max-w-full text-3xl font-semibold leading-tight text-[#fbfaf7] [overflow-wrap:anywhere] sm:text-4xl md:text-6xl">
              {text.heroTitle as string}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#c7cfdd] [overflow-wrap:anywhere] sm:text-base md:text-lg">
              {text.heroBody as string}
            </p>
            <div className="mx-auto mt-8 grid w-full max-w-sm grid-cols-1 gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center">
              <button
                type="button"
                className="min-w-0 rounded-md border border-white/[0.35] bg-white/[0.90] px-5 py-3 text-sm font-bold text-[#050609] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_16px_38px_rgba(0,0,0,0.28)] hover:bg-white"
                onClick={() => scrollToId("demo")}
              >
                {text.demoCta as string}
              </button>
              <button
                type="button"
                className="min-w-0 rounded-md border border-white/[0.18] bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#e8edf6] backdrop-blur-xl hover:bg-white/[0.10]"
                onClick={() => scrollToId("preview")}
              >
                {text.previewCta as string}
              </button>
              <button
                className="min-w-0 rounded-md border border-white/[0.12] bg-white/[0.035] px-5 py-3 text-sm font-semibold text-[#a8b2c4] hover:text-white"
                onClick={goToWorkbench}
              >
                {text.workbenchCta as string}
              </button>
            </div>
            <a
              className="mt-5 inline-block text-sm font-semibold text-[#c7cfdd] underline decoration-white/15 underline-offset-4 hover:text-white"
              href={GITHUB_URL}
            >
              {text.openGithub as string}
            </a>
          </div>
        </div>
      </section>

      <section id="demo" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
          {text.demoEyebrow as string}
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <h2 className="text-3xl font-semibold md:text-4xl">{text.demoTitle as string}</h2>
          <p className="max-w-3xl text-sm leading-6 text-[#a8b2c4] md:text-base">
            {text.demoBody as string}
          </p>
        </div>
        <div className={`mt-8 overflow-hidden rounded-xl ${glassSurface}`}>
          <HandoffDemo showDebugPanel={false} lang={lang} />
        </div>
      </section>

      <section id="preview" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div
          className={`grid gap-6 rounded-xl p-6 lg:grid-cols-[0.82fr_1.18fr] lg:p-8 ${glassSurface}`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
              {text.previewEyebrow as string}
            </p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              {text.previewTitle as string}
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#a8b2c4] md:text-base">
              {text.previewBody as string}
            </p>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-2">
            {previewCards[lang].map((item, index) => {
              const style = PREVIEW_IMPORTANCE_STYLE[item.importance];
              const baseClass =
                index === 2
                  ? "rounded-lg border border-white/[0.24] bg-white/[0.11] p-4 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:col-span-2"
                  : "rounded-lg border border-white/[0.12] bg-white/[0.04] p-4 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
              return (
                <div key={item.title} className={`relative overflow-hidden ${baseClass}`}>
                  <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${style.bar}`} />
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-[#7d8798]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${style.badge}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-[#f6f4ee]">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#c7cfdd]">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 pb-28 pt-16">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
              {text.howEyebrow as string}
            </p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{text.howTitle as string}</h2>
            <p className="mt-4 text-sm leading-6 text-[#a8b2c4] md:text-base">
              {text.howBody as string}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {processSteps[lang].map((item, index) => (
              <div key={item} className={`rounded-lg p-4 ${glassSurface}`}>
                <p className="text-xs font-semibold text-[#7d8798]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-5 text-sm font-semibold text-[#f6f4ee]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

export default HandoffLanding;
