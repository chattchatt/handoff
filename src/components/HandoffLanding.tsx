import { useState } from 'react';
import HandoffDemo from '@/components/HandoffDemo';
import HeroMemoryScene from '@/components/HeroMemoryScene';

type Lang = 'ko' | 'en';

const GITHUB_URL = 'https://github.com/chattchatt/handoff';
const CLONE_COMMAND = 'git clone https://github.com/chattchatt/handoff.git';

const copy = {
  ko: {
    nav: {
      demo: 'Demo',
      cli: 'CLI',
      github: 'GitHub',
    },
    heroEyebrow: 'Agent Execution Memory',
    heroTitle: '다음 Agent Run이 이어받을 수 있는 실행 기억.',
    heroBody:
      'CLI 한 줄로 회의록, 메모, 이슈를 다음 Agent Run이 이어받을 실행 기억으로 변환합니다.',
    copyRepo: 'Repo 복사',
    copyCommands: '명령어 복사',
    copied: '복사됨',
    copiedCommands: '명령어 복사됨',
    openGithub: 'GitHub 열기',
    demoCta: '아래에서 테스트',
    workbenchCta: 'Workbench',
    quickstart: 'Quickstart',
    terminalHint: 'Paste into your CLI',
    install: 'Install',
    configure: 'Configure',
    run: 'Run',
    copy: 'Copy',
    copiedShort: 'Copied',
    status: 'Ready for Handoff',
    demoEyebrow: 'IN-PAGE WORKBENCH',
    demoTitle: '스크롤해서 바로 Handoff를 만들어보세요.',
    demoBody:
      '회의록, 고객 메모, Slack 논의, 이슈 설명, 작업 요청을 붙여넣으면 다음 Agent가 읽을 기억, 증거, 다음 실행이 생성됩니다.',
    formatEyebrow: 'OUTPUT FORMAT',
    formatTitle: '레퍼런스 이미지는 이렇게 제품 언어로 번역했습니다.',
    formatBody:
      '입자 구체는 흩어진 맥락이 하나의 실행 기억으로 묶이는 장면, 딥필드는 남겨진 증거와 맥락의 밀도, 터널 움직임은 다음 Agent Run으로 이어지는 방향성을 표현합니다.',
    underHood: 'Hermes Core와 MCP 인터페이스는 제품 전면이 아니라 Agent와 개발자 도구가 호출하는 내부 실행면으로 둡니다.',
  },
  en: {
    nav: {
      demo: 'Demo',
      cli: 'CLI',
      github: 'GitHub',
    },
    heroEyebrow: 'Agent Execution Memory',
    heroTitle: 'Execution memory your next Agent Run can inherit.',
    heroBody:
      'One CLI path turns meetings, notes, and issues into execution memory your next Agent Run can inherit.',
    copyRepo: 'Copy repo',
    copyCommands: 'Copy commands',
    copied: 'Copied',
    copiedCommands: 'Commands copied',
    openGithub: 'Open GitHub',
    demoCta: 'Test below',
    workbenchCta: 'Workbench',
    quickstart: 'Quickstart',
    terminalHint: 'Paste into your CLI',
    install: 'Install',
    configure: 'Configure',
    run: 'Run',
    copy: 'Copy',
    copiedShort: 'Copied',
    status: 'Ready for Handoff',
    demoEyebrow: 'IN-PAGE WORKBENCH',
    demoTitle: 'Scroll down and create a Handoff on the page.',
    demoBody:
      'Paste a transcript, customer memo, Slack thread, issue, or request and inspect the memory, evidence, and next run your agent can inherit.',
    formatEyebrow: 'OUTPUT FORMAT',
    formatTitle: 'How the references translate into the product.',
    formatBody:
      'The particle sphere represents scattered context forming one runnable memory. The deep field expresses evidence density. The tunnel motion points toward the next Agent Run.',
    underHood: 'Hermes Core and the MCP interface stay under the hood as the runtime surface for agents and developer tools.',
  },
} satisfies Record<Lang, Record<string, string | Record<string, string>>>;

const commands = [
  ['install', CLONE_COMMAND],
  ['configure', 'cd handoff && handoff setup'],
  ['run', 'handoff run ./meeting.md'],
] as const;

const ALL_COMMANDS = commands.map(([, command]) => command).join('\n');

const memorySurfaces: Record<Lang, string[]> = {
  ko: ['목표 상태', '사용한 맥락', '실행 요청', '증거 기록', '다음 Agent Run'],
  en: ['Goal State', 'Context Used', 'Execution Requests', 'Evidence Ledger', 'Next Agent Run'],
};
const glassSurface = 'border border-white/[0.16] bg-white/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.05),0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl';

async function writeClipboardText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall back for embedded previews or browsers that block async clipboard writes.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'ko';
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ko';
}

function goToWorkbench() {
  window.history.pushState({}, '', '/app');
  window.dispatchEvent(new Event('popstate'));
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function CommandRow({
  label,
  command,
  lang,
}: {
  label: string;
  command: string;
  lang: Lang;
}) {
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f98aa]">{label}</p>
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
        {copied ? text.copiedShort as string : text.copy as string}
      </button>
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
    url.searchParams.set('lang', nextLang);
    window.history.replaceState({}, '', url.toString());
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
      className="relative isolate min-h-screen overflow-hidden bg-[#030407] text-[#f6f4ee]"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <HeroMemoryScene />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_24%_22%,rgba(255,255,255,0.10),transparent_24%),radial-gradient(circle_at_72%_20%,rgba(151,179,255,0.10),transparent_28%),linear-gradient(180deg,rgba(3,4,7,0.03),rgba(3,4,7,0.38)_62%,rgba(3,4,7,0.84))]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.12] bg-[#030407]/[0.58] shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button className="text-left text-lg font-semibold" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Handoff
          </button>
          <nav className="hidden items-center gap-6 text-sm text-[#9aa3b5] md:flex">
            <button className="hover:text-white" onClick={() => scrollToId('demo')}>{nav.demo}</button>
            <button className="hover:text-white" onClick={() => scrollToId('cli')}>{nav.cli}</button>
            <a href={GITHUB_URL} className="hover:text-white">{nav.github}</a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-white/[0.12] bg-white/[0.06] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
              {(['ko', 'en'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`h-8 rounded px-2 text-xs font-semibold sm:px-3 ${lang === item ? 'bg-white/[0.12] text-white' : 'text-[#7d8798] hover:text-white'}`}
                  onClick={() => changeLang(item)}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-md border border-white/[0.35] bg-white/[0.88] px-4 py-2 text-sm font-bold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] hover:bg-white"
              onClick={copyRepoCommand}
            >
              {repoCopied ? text.copied as string : text.copyRepo as string}
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#030407] to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-7xl flex-col justify-center px-5 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">{text.heroEyebrow as string}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#fbfaf7] md:text-6xl">
              {text.heroTitle as string}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#c7cfdd] md:text-lg">
              {text.heroBody as string}
            </p>
          </div>

          <div id="cli" className="mx-auto mt-9 w-full max-w-3xl rounded-xl border border-white/[0.28] bg-white/[0.74] p-2 text-[#07080b] shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_32px_120px_rgba(0,0,0,0.56)] backdrop-blur-2xl">
            <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff655a]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbf4c]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#36c275]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e6673]">Handoff CLI</p>
                  <p className="mt-0.5 text-sm font-medium text-[#1f2430]">{text.terminalHint as string}</p>
                </div>
              </div>
              <button
                type="button"
                className="h-9 w-fit rounded-md border border-black/10 bg-[#07080b]/[0.95] px-4 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_26px_rgba(0,0,0,0.24)] transition hover:bg-[#1a1f2a]"
                onClick={copyAllCommands}
              >
                {commandsCopied ? text.copiedCommands as string : text.copyCommands as string}
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#050609]/[0.94] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="font-mono text-[12px] text-[#9aa3b5]">quickstart.sh</p>
                <span className="rounded-full border border-[#9dc0ff]/[0.25] bg-[#9dc0ff]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-[#c7d9ff]">
                  {text.status as string}
                </span>
              </div>
              {commands.map(([key, command]) => (
                <CommandRow key={key} label={text[key] as string} command={command} lang={lang} />
              ))}
            </div>
          </div>

          <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-4 text-sm">
            <a className="font-semibold text-[#e8edf6] underline decoration-white/20 underline-offset-4 hover:text-white" href={GITHUB_URL}>
              {text.openGithub as string}
            </a>
            <button className="font-semibold text-[#c7cfdd] underline decoration-white/15 underline-offset-4 hover:text-white" onClick={() => scrollToId('demo')}>
              {text.demoCta as string}
            </button>
            <button className="font-semibold text-[#9aa3b5] underline decoration-white/10 underline-offset-4 hover:text-white" onClick={goToWorkbench}>
              {text.workbenchCta as string}
            </button>
          </div>
        </div>
      </section>

      <section id="demo" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">{text.demoEyebrow as string}</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <h2 className="text-3xl font-semibold md:text-4xl">{text.demoTitle as string}</h2>
          <p className="max-w-3xl text-sm leading-6 text-[#a8b2c4] md:text-base">{text.demoBody as string}</p>
        </div>
        <div className={`mt-8 overflow-hidden rounded-xl ${glassSurface}`}>
          <HandoffDemo showDebugPanel={false} lang={lang} />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-6">
        <div className={`grid gap-6 rounded-xl p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8 ${glassSurface}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7dceb]">{text.formatEyebrow as string}</p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{text.formatTitle as string}</h2>
            <p className="mt-4 text-sm leading-6 text-[#a8b2c4] md:text-base">{text.formatBody as string}</p>
            <p className="mt-4 text-sm leading-6 text-[#7d8798]">{text.underHood as string}</p>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-2">
            {memorySurfaces[lang].map((item, index) => (
              <div
                key={item}
                className={index === memorySurfaces[lang].length - 1 ? 'rounded-lg border border-white/[0.18] bg-white/[0.09] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] sm:col-span-2' : 'rounded-lg border border-white/[0.12] bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'}
              >
                <p className="text-xs font-semibold text-[#7d8798]">{String(index + 1).padStart(2, '0')}</p>
                <p className="mt-3 text-sm font-semibold text-[#f6f4ee]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HandoffLanding;
