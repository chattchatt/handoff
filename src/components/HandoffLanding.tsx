import { useState } from "react";
import HandoffDemo from "@/components/HandoffDemo";
import HeroMemoryScene from "@/components/HeroMemoryScene";

type Lang = "ko" | "en";

const GITHUB_URL = "https://github.com/chattchatt/handoff";
const CLONE_COMMAND = "git clone https://github.com/chattchatt/handoff.git";

const copy = {
  ko: {
    nav: {
      demo: "Demo",
      preview: "Preview",
      how: "How",
      cli: "CLI",
      github: "GitHub",
    },
    team: "E-Hong",
    project: "HandOff",
    heroEyebrow: "Agent Execution Memory",
    heroTitle: "회의록과 문서를 AI가 실행할 수 있는 작업 기억으로",
    heroBody:
      "HandOff는 회의록, 고객 메모, Slack 논의, 이슈 설명을 이어받는 담당자가 바로 사용할 수 있는 작업 브리프, 후속 작업, 근거 자료로 정리합니다.",
    copyRepo: "Repo 복사",
    copyCommands: "명령어 복사",
    copied: "복사됨",
    copiedCommands: "명령어 복사됨",
    openGithub: "GitHub 열기",
    demoCta: "실행 기억 만들기",
    previewCta: "예시 보기",
    workbenchCta: "Workbench",
    quickstart: "고급 사용자용 CLI",
    terminalHint: "CLI가 필요한 팀은 아래 명령으로 로컬 실행면을 준비할 수 있습니다.",
    install: "Install",
    configure: "Configure",
    run: "Run",
    copy: "Copy",
    copiedShort: "Copied",
    status: "Advanced path",
    demoEyebrow: "IN-PAGE DEMO",
    demoTitle: "먼저 페이지 안에서 실행 기억을 만들어보세요.",
    demoBody:
      "긴 원문을 붙여넣거나 TXT/MD/PDF를 선택하면 핵심 요약, 결정 사항, 후속 작업, 보완 필요 사항, 근거 자료가 생성됩니다.",
    previewEyebrow: "RESULT DASHBOARD",
    previewTitle: "결과는 이어받는 담당자가 읽는 순서로 정리됩니다.",
    previewBody:
      "사용자에게 먼저 필요한 것은 내부 패키지가 아니라 현재 상태, 결정, 후속 작업, 부족한 맥락, 원문 근거입니다.",
    howEyebrow: "HOW IT WORKS",
    howTitle: "흩어진 맥락을 실행 가능한 기억으로 압축합니다.",
    howBody:
      "입력 원문에서 목적과 결정 사항을 분리하고, 이어받는 담당자가 바로 움직일 수 있도록 후속 작업과 검증 근거를 묶습니다.",
    underHood:
      "Hermes Core와 MCP 인터페이스는 제품 전면이 아니라 Agent와 개발자 도구가 호출하는 내부 실행면으로 둡니다.",
    teamEyebrow: "PROJECT",
    teamTitle: "HandOff by E-Hong",
    teamBody:
      "팀과 프로젝트의 첫 신호를 화면 상단과 Hero에 고정해, 사용자가 무엇을 쓰는지 바로 알 수 있게 했습니다.",
  },
  en: {
    nav: {
      demo: "Demo",
      preview: "Preview",
      how: "How",
      cli: "CLI",
      github: "GitHub",
    },
    team: "E-Hong",
    project: "HandOff",
    heroEyebrow: "Agent Execution Memory",
    heroTitle: "Turn meeting notes and documents into work memory AI can execute",
    heroBody:
      "HandOff turns transcripts, customer notes, Slack threads, and issues into work briefs, follow-up tasks, and evidence the next executor can inherit.",
    copyRepo: "Copy repo",
    copyCommands: "Copy commands",
    copied: "Copied",
    copiedCommands: "Commands copied",
    openGithub: "Open GitHub",
    demoCta: "Create memory",
    previewCta: "View example",
    workbenchCta: "Workbench",
    quickstart: "Advanced CLI",
    terminalHint: "Teams that need the CLI can prepare the local runtime with these commands.",
    install: "Install",
    configure: "Configure",
    run: "Run",
    copy: "Copy",
    copiedShort: "Copied",
    status: "Advanced path",
    demoEyebrow: "IN-PAGE DEMO",
    demoTitle: "Create an execution memory directly on the page.",
    demoBody:
      "Paste long context or select TXT/MD/PDF and inspect summary, decisions, follow-up tasks, missing context, and evidence.",
    previewEyebrow: "RESULT DASHBOARD",
    previewTitle: "The output follows the order a next executor actually reads.",
    previewBody:
      "The user-facing result starts with current state, decisions, follow-up tasks, missing context, and source evidence instead of internal packages.",
    howEyebrow: "HOW IT WORKS",
    howTitle: "Compress scattered context into runnable memory.",
    howBody:
      "HandOff separates intent and decisions from the raw input, then bundles follow-up work with the evidence needed for verification.",
    underHood:
      "Hermes Core and the MCP interface stay under the hood as the runtime surface for agents and developer tools.",
    teamEyebrow: "PROJECT",
    teamTitle: "HandOff by E-Hong",
    teamBody:
      "The project and team are visible from the first viewport so users immediately know what they are using.",
  },
} satisfies Record<Lang, Record<string, string | Record<string, string>>>;

const commands = [
  ["install", CLONE_COMMAND],
  ["configure", "cd handoff && handoff setup"],
  ["run", "handoff run ./meeting.md"],
] as const;

const ALL_COMMANDS = commands.map(([, command]) => command).join("\n");

const previewCards: Record<Lang, Array<{ title: string; body: string }>> = {
  ko: [
    { title: "핵심 요약", body: "현재 목표와 실행 상태를 한 문단으로 정리합니다." },
    { title: "결정 사항", body: "이미 합의된 내용과 요구사항을 분리합니다." },
    { title: "후속 작업", body: "이어받는 담당자가 바로 처리할 작업을 앞에 둡니다." },
    { title: "보완 필요 사항", body: "실행 전 더 필요한 맥락과 리스크를 드러냅니다." },
    { title: "사용한 맥락/근거 자료", body: "원문에서 어떤 근거를 사용했는지 추적합니다." },
    {
      title: "AI 호출용 프롬프트",
      body: "필요한 경우 다음 Agent Run에 넘길 프롬프트를 제공합니다.",
    },
  ],
  en: [
    { title: "Summary", body: "Current goal and runnable state in one short section." },
    { title: "Decisions", body: "Agreed decisions and requirements are separated." },
    { title: "Follow-up Tasks", body: "The next executor sees the immediate work first." },
    { title: "Missing Context", body: "Gaps and risks are exposed before execution." },
    { title: "Context / Evidence", body: "The source evidence behind the result stays traceable." },
    {
      title: "AI Prompt",
      body: "A continuation prompt is available when another Agent Run needs it.",
    },
  ],
};

const processSteps: Record<Lang, string[]> = {
  ko: ["원문 입력", "목표와 결정 추출", "후속 작업 정리", "근거 자료 연결"],
  en: ["Input context", "Extract goal and decisions", "Shape follow-up work", "Attach evidence"],
};

const glassSurface =
  "border border-white/[0.16] bg-white/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.05),0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl";

async function writeClipboardText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall back for embedded previews or browsers that block async clipboard writes.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

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

function CommandRow({ label, command, lang }: { label: string; command: string; lang: Lang }) {
  const [copied, setCopied] = useState(false);
  const text = copy[lang];

  async function handleCopy() {
    if (await writeClipboardText(command)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  return (
    <div className="group grid gap-3 border-t border-white/10 bg-white/[0.015] px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f98aa]">
          {label}
        </p>
        <code className="mt-2 flex min-w-0 items-start gap-3 break-all font-mono text-[14px] leading-6 text-[#f7f8fb] sm:break-normal sm:whitespace-nowrap">
          <span className="select-none text-[#8fb3ff]">$</span>
          <span>{command}</span>
        </code>
      </div>
      <button
        type="button"
        className="h-9 rounded-md border border-white/50 bg-white/90 px-3 text-xs font-bold text-[#050609] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_24px_rgba(0,0,0,0.25)] transition hover:bg-white"
        onClick={handleCopy}
      >
        {copied ? (text.copiedShort as string) : (text.copy as string)}
      </button>
    </div>
  );
}

function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <img
        className={compact ? "h-8 w-8" : "h-11 w-11"}
        src="/handoff-logo.svg"
        alt="HandOff logo"
      />
      <span className="grid leading-tight">
        <span
          className={
            compact ? "text-base font-semibold text-white" : "text-xl font-semibold text-white"
          }
        >
          HandOff
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9aa3b5]">
          E-Hong
        </span>
      </span>
    </span>
  );
}

function CliQuickstart({
  lang,
  commandsCopied,
  onCopy,
}: {
  lang: Lang;
  commandsCopied: boolean;
  onCopy: () => void;
}) {
  const text = copy[lang];

  return (
    <div
      id="cli"
      className="mx-auto w-full max-w-4xl rounded-xl border border-white/[0.28] bg-white/[0.74] p-2 text-[#07080b] shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_32px_120px_rgba(0,0,0,0.44)] backdrop-blur-2xl"
    >
      <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff655a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbf4c]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#36c275]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e6673]">
              Handoff CLI
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#1f2430]">
              {text.terminalHint as string}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="h-9 w-fit rounded-md border border-black/10 bg-[#07080b]/[0.95] px-4 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_26px_rgba(0,0,0,0.24)] transition hover:bg-[#1a1f2a]"
          onClick={onCopy}
        >
          {commandsCopied ? (text.copiedCommands as string) : (text.copyCommands as string)}
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#050609]/[0.94] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="font-mono text-[12px] text-[#9aa3b5]">quickstart.sh</p>
          <span className="rounded-full border border-[#5D7EEB]/[0.25] bg-[#5D7EEB]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-[#c7d9ff]">
            {text.status as string}
          </span>
        </div>
        {commands.map(([key, command]) => (
          <CommandRow key={key} label={text[key] as string} command={command} lang={lang} />
        ))}
      </div>
    </div>
  );
}

export function HandoffLanding() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [repoCopied, setRepoCopied] = useState(false);
  const [commandsCopied, setCommandsCopied] = useState(false);
  const text = copy[lang];
  const nav = text.nav as Record<string, string>;

  function changeLang(nextLang: Lang) {
    setLang(nextLang);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLang);
    window.history.replaceState({}, "", url.toString());
  }

  async function copyRepoCommand() {
    if (await writeClipboardText(CLONE_COMMAND)) {
      setRepoCopied(true);
      window.setTimeout(() => setRepoCopied(false), 1500);
    }
  }

  async function copyAllCommands() {
    if (await writeClipboardText(ALL_COMMANDS)) {
      setCommandsCopied(true);
      window.setTimeout(() => setCommandsCopied(false), 1500);
    }
  }

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden bg-[#1A1F31] text-[#f6f4ee]"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <HeroMemoryScene />
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
            <button className="hover:text-white" onClick={() => scrollToId("cli")}>
              {nav.cli}
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
            <button
              type="button"
              className="hidden rounded-md border border-white/[0.35] bg-white/[0.88] px-4 py-2 text-sm font-bold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] hover:bg-white sm:block"
              onClick={copyRepoCommand}
            >
              {repoCopied ? (text.copied as string) : (text.copyRepo as string)}
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 isolate overflow-hidden border-b border-white/10">
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
            {previewCards[lang].map((item, index) => (
              <div
                key={item.title}
                className={
                  index === 2
                    ? "rounded-lg border border-white/[0.24] bg-white/[0.11] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:col-span-2"
                    : "rounded-lg border border-white/[0.12] bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                }
              >
                <p className="text-xs font-semibold text-[#7d8798]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 text-sm font-semibold text-[#f6f4ee]">{item.title}</p>
                <p className="mt-2 text-xs leading-5 text-[#9aa3b5]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
              {text.howEyebrow as string}
            </p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{text.howTitle as string}</h2>
            <p className="mt-4 text-sm leading-6 text-[#a8b2c4] md:text-base">
              {text.howBody as string}
            </p>
            <p className="mt-4 text-sm leading-6 text-[#7d8798]">{text.underHood as string}</p>
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

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
          {text.quickstart as string}
        </p>
        <CliQuickstart lang={lang} commandsCopied={commandsCopied} onCopy={copyAllCommands} />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8">
        <div
          className={`flex flex-col gap-5 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8 ${glassSurface}`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">
              {text.teamEyebrow as string}
            </p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{text.teamTitle as string}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a8b2c4]">
              {text.teamBody as string}
            </p>
          </div>
          <LogoLockup />
        </div>
      </section>
    </main>
  );
}

export default HandoffLanding;
