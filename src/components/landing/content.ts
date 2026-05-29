export type Lang = "ko" | "en";

export type ProcessRow = {
  index: string;
  label: string;
  title: string;
  body: string;
};

export type Service = {
  index: string;
  name: string;
  body: string;
};

export type Step = {
  index: string;
  title: string;
  duration: string;
  body: string;
};

export type Faq = { q: string; a: string };

export type Plan = {
  name: string;
  tagline: string;
  price?: string;
  credits?: string;
  perCredit?: string;
  popular?: boolean;
  cta: string;
  enterprise?: boolean;
};

type Content = {
  nav: { process: string; services: string; pricing: string; faq: string };
  cta: { start: string; explore: string; pricing: string; viewAllPlans: string };
  hero: {
    eyebrow: string;
    titleA: string;
    titleAccent: string;
    titleB: string;
    body: string;
  };
  process: {
    pill: string;
    titleA: string;
    titleFaded: string;
    body: string;
    rows: ProcessRow[];
  };
  services: { eyebrow: string; title: string; body: string; items: Service[] };
  timeline: {
    pill: string;
    titleA: string;
    titleFaded: string;
    titleB: string;
    body: string;
    steps: Step[];
  };
  comparison: {
    eyebrow: string;
    title: string;
    body: string;
    leftTitle: string;
    leftChips: string[];
    leftBody: string;
    rightTitle: string;
    rightChips: string[];
    rightBody: string;
  };
  faq: { eyebrow: string; title: string; body: string; items: Faq[] };
  pricing: { eyebrow: string; title: string; body: string; plans: Plan[] };
  finalCta: { eyebrow: string; title: string; body: string };
  footer: { tagline: string; rights: string; cols: { title: string; links: string[] }[] };
};

export const copy: Record<Lang, Content> = {
  ko: {
    nav: { process: "작동 방식", services: "기능", pricing: "요금제", faq: "자주 묻는 질문" },
    cta: {
      start: "워크벤치 열기",
      explore: "작동 방식 보기",
      pricing: "요금제 보기",
      viewAllPlans: "모든 플랜 보기",
    },
    hero: {
      eyebrow: "Agent Handoff Workbench",
      titleA: "흩어진 업무 맥락을\n",
      titleAccent: "실행 기억",
      titleB: "으로.",
      body: "회의록, 문서, Slack 논의를 붙여넣으면 HandOff가 목표·결정·후속 작업·근거로 정리합니다. 다음 사람이나 AI 에이전트가 묻지 않고 그대로 이어받습니다.",
    },
    process: {
      pill: "HOW IT WORKS",
      titleA: "입력에서 인수인계까지,",
      titleFaded: "네 단계.",
      body: "실제 화면으로 보는 HandOff의 작동 방식.",
      rows: [
        {
          index: "01",
          label: "INPUT",
          title: "회의록 한 장, 문서 하나면 충분합니다",
          body: "회의록·고객 메모·Slack 논의·이슈 설명을 붙여넣거나 PDF·DOCX·XLSX 파일을 업로드하세요.",
        },
        {
          index: "02",
          label: "PARSE",
          title: "문서를 자동으로 분석합니다",
          body: "Upstage Document Parse가 문서를 읽고, Information Extract가 핵심 정보를 구조화합니다.",
        },
        {
          index: "03",
          label: "STRUCTURE",
          title: "실행 기억과 근거로 정리됩니다",
          body: "목표·결정·후속 작업·보완 필요 사항·근거 자료가 한 화면에 정리됩니다.",
        },
        {
          index: "04",
          label: "HANDOFF",
          title: "다음 사람·AI가 그대로 이어받습니다",
          body: "AI 호출용 프롬프트와 함께 넘기거나, 한 번의 클릭으로 GitHub 이슈로 발행하세요.",
        },
      ],
    },
    services: {
      eyebrow: "FEATURES",
      title: "인수인계에 필요한 모든 것.",
      body: "맥락 정리부터 AI 프롬프트 생성, 근거 추적, GitHub 발행까지 — 한 곳에서.",
      items: [
        {
          index: "01",
          name: "실행 기억",
          body: "목표, 결정 사항, 제약, 관찰을 구조화해 다음 Agent Run이 그대로 이어받을 수 있는 실행 상태로 만듭니다.",
        },
        {
          index: "02",
          name: "근거 자료",
          body: "완료 근거, 보완 필요 근거, 품질 체크리스트를 분리해 무엇이 끝났고 무엇이 남았는지 명확히 합니다.",
        },
        {
          index: "03",
          name: "AI 실행 프롬프트",
          body: "사람용 Todo가 아니라, AI 에이전트에게 그대로 전달하면 작업을 바로 실행하는 프롬프트를 생성합니다.",
        },
        {
          index: "04",
          name: "GitHub 이슈 발행",
          body: "정리된 실행 기억을 한 번의 클릭으로 GitHub 이슈로 발행합니다. 발행 시점의 PAT만 사용하고 어디에도 저장하지 않습니다.",
        },
      ],
    },
    timeline: {
      pill: "시작하기",
      titleA: "세 단계로 ",
      titleFaded: "인수인계를",
      titleB: " 끝내세요.",
      body: "맥락 입력부터 정리, 인수인계까지 — 몇 분이면 충분합니다.",
      steps: [
        {
          index: "01",
          title: "맥락 붙여넣기",
          duration: "1분",
          body: "회의록·메모·문서를 붙여넣거나 PDF·DOCX·XLSX 파일을 업로드하세요.",
        },
        {
          index: "02",
          title: "실행 기억 생성",
          duration: "30초",
          body: "HandOff가 목표·결정·후속 작업·근거로 자동 정리합니다.",
        },
        {
          index: "03",
          title: "인수인계 & 발행",
          duration: "즉시",
          body: "AI 호출용 프롬프트와 함께 넘기거나 GitHub 이슈로 발행하세요.",
        },
      ],
    },
    comparison: {
      eyebrow: "WHY HANDOFF",
      title: "그냥 넘기는 것과 비교해 보세요.",
      body: "맥락 없이 넘긴 업무는 결국 다시 묻게 됩니다. HandOff와의 차이를 확인하세요.",
      leftTitle: "맨손으로 인수인계",
      leftChips: ["맥락 유실", "반복되는 재질문", "흩어진 근거", "재현 불가"],
      leftBody:
        "회의록은 길고, 결정은 흩어지고, 무엇이 끝났는지 알 수 없습니다. 이어받는 사람은 처음부터 다시 시작합니다.",
      rightTitle: "HandOff로 인수인계",
      rightChips: ["구조화된 실행 기억", "AI 즉시 실행", "근거 추적", "GitHub 발행"],
      rightBody:
        "목표·결정·후속 작업·근거가 한 상태로 정리됩니다. 다음 사람이나 AI가 묻지 않고 바로 이어받습니다.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "자주 묻는 질문.",
      body: "HandOff에 대해 알아야 할 모든 것.",
      items: [
        {
          q: "HandOff란 무엇인가요?",
          a: "HandOff는 Agent Handoff Workbench입니다. 흩어진 업무 맥락을 목표·결정·후속 작업·근거로 정리해, 다음 사람이나 AI 에이전트가 그대로 이어받을 수 있는 실행 기억으로 만듭니다.",
        },
        {
          q: "어떤 입력을 넣을 수 있나요?",
          a: "회의록, 고객 메모, Slack 논의, 이슈 설명, 작업 요청을 붙여넣거나 PDF·DOCX·XLSX·TXT 파일을 업로드할 수 있습니다.",
        },
        {
          q: "문서는 어떻게 분석되나요?",
          a: "n8n 런타임이 Upstage Document Parse로 문서를 읽고, Information Extract로 핵심 정보를 구조화한 뒤, Solar LLM이 실행 기억으로 변환합니다.",
        },
        {
          q: "AI 실행 프롬프트가 무엇인가요?",
          a: "사람용 Todo 목록이 아니라, AI 에이전트에게 그대로 전달하면 작업을 바로 실행할 수 있는 실행 입력입니다.",
        },
        {
          q: "GitHub로 발행할 수 있나요?",
          a: "정리된 실행 기억을 한 번의 클릭으로 GitHub 이슈로 발행할 수 있습니다. 발행 시점에 입력한 PAT만 사용하며 어디에도 저장하지 않습니다.",
        },
        {
          q: "내 데이터는 안전한가요?",
          a: "히스토리는 GitHub 로그인 후 계정별로 저장되며, 발행용 토큰은 브라우저 메모리에만 존재하다가 발행 후 사라집니다.",
        },
      ],
    },
    pricing: {
      eyebrow: "PRICING",
      title: "간단하고 투명한 요금제",
      body: "개인은 무료로 시작하고, 팀은 함께 확장하세요.",
      plans: [
        {
          name: "Free",
          tagline: "개인 사용에 충분해요",
          price: "₩0",
          credits: "월 20회 실행",
          perCredit: "기본 기능 포함",
          cta: "시작하기",
        },
        {
          name: "Pro",
          tagline: "꾸준히 쓰는 사람을 위해",
          price: "₩19,000",
          credits: "월 무제한 실행",
          perCredit: "PDF·DOCX·XLSX 분석",
          popular: true,
          cta: "구매하기",
        },
        {
          name: "Team",
          tagline: "팀의 인수인계를 한 곳에",
          price: "₩49,000",
          credits: "5인 워크스페이스",
          perCredit: "공유 히스토리",
          cta: "구매하기",
        },
        {
          name: "Enterprise",
          tagline: "대규모 조직을 위한 맞춤형 플랜",
          cta: "문의하기",
          enterprise: true,
        },
      ],
    },
    finalCta: {
      eyebrow: "START NOW",
      title: "맥락을 잃지 말고 넘기세요.",
      body: "지금 워크벤치를 열고 첫 실행 기억을 만들어 보세요. 설치도, 신용카드도 필요 없습니다.",
    },
    footer: {
      tagline: "흩어진 업무 맥락을 실행 기억으로 바꾸는 HandOff.",
      rights: "© 2026 HandOff. All rights reserved.",
      cols: [
        { title: "제품", links: ["작동 방식", "기능", "요금제", "FAQ"] },
        { title: "회사", links: ["소개", "블로그", "문의"] },
        { title: "법적 고지", links: ["이용약관", "개인정보처리방침", "보안"] },
      ],
    },
  },
  en: {
    nav: { process: "How it works", services: "Features", pricing: "Pricing", faq: "FAQ" },
    cta: {
      start: "Open Workbench",
      explore: "See how it works",
      pricing: "View Pricing",
      viewAllPlans: "View all plans",
    },
    hero: {
      eyebrow: "Agent Handoff Workbench",
      titleA: "Turn scattered context\ninto ",
      titleAccent: "execution memory",
      titleB: ".",
      body: "Paste meeting notes, docs, and Slack threads — HandOff structures them into goals, decisions, follow-up tasks, and evidence. The next person or AI agent picks up exactly where you left off.",
    },
    process: {
      pill: "HOW IT WORKS",
      titleA: "From input to handoff,",
      titleFaded: "in four steps.",
      body: "How HandOff works, shown on real screens.",
      rows: [
        {
          index: "01",
          label: "INPUT",
          title: "A doc or a transcript is enough",
          body: "Paste meeting notes, customer memos, Slack threads, or issues — or upload PDF, DOCX, and XLSX files.",
        },
        {
          index: "02",
          label: "PARSE",
          title: "Documents are analyzed automatically",
          body: "Upstage Document Parse reads the file and Information Extract structures the key details.",
        },
        {
          index: "03",
          label: "STRUCTURE",
          title: "Organized into memory and evidence",
          body: "Goals, decisions, follow-up tasks, missing context, and evidence land on one screen.",
        },
        {
          index: "04",
          label: "HANDOFF",
          title: "The next person or AI inherits it",
          body: "Hand it off with an AI-ready prompt, or publish it to a GitHub issue in one click.",
        },
      ],
    },
    services: {
      eyebrow: "FEATURES",
      title: "Everything a handoff needs.",
      body: "Context structuring, AI prompt generation, evidence tracking, and GitHub publishing — in one place.",
      items: [
        {
          index: "01",
          name: "Execution Memory",
          body: "Structure goals, decisions, constraints, and observations into a state your next Agent Run can inherit as-is.",
        },
        {
          index: "02",
          name: "Evidence Ledger",
          body: "Separate done evidence, missing evidence, and a quality checklist so it's clear what's finished and what's left.",
        },
        {
          index: "03",
          name: "AI Run Prompt",
          body: "Generate a prompt that runs the work directly when handed to an AI agent — an execution input, not a human todo.",
        },
        {
          index: "04",
          name: "GitHub Publishing",
          body: "Publish your execution memory to a GitHub issue in one click. Only the PAT you enter at publish time is used — never stored.",
        },
      ],
    },
    timeline: {
      pill: "GET STARTED",
      titleA: "Finish the handoff in 3 ",
      titleFaded: "simple",
      titleB: " steps.",
      body: "From pasting context to structuring and handing off — it only takes minutes.",
      steps: [
        {
          index: "01",
          title: "Paste context",
          duration: "1 min",
          body: "Paste meeting notes, memos, or docs, or upload a PDF, DOCX, or XLSX file.",
        },
        {
          index: "02",
          title: "Create memory",
          duration: "30 sec",
          body: "HandOff auto-structures goals, decisions, tasks, and evidence.",
        },
        {
          index: "03",
          title: "Hand off & publish",
          duration: "Instant",
          body: "Hand it off with an AI prompt or publish to a GitHub issue.",
        },
      ],
    },
    comparison: {
      eyebrow: "WHY HANDOFF",
      title: "Compare with handing off blind.",
      body: "Work handed off without context gets re-asked. See the difference with HandOff.",
      leftTitle: "Hand off by hand",
      leftChips: ["Lost context", "Repeated questions", "Scattered evidence", "Not reproducible"],
      leftBody:
        "Transcripts are long, decisions are scattered, and no one knows what's done. The next person starts over.",
      rightTitle: "Hand off with HandOff",
      rightChips: ["Structured memory", "Instant AI run", "Evidence tracking", "GitHub publishing"],
      rightBody:
        "Goals, decisions, tasks, and evidence in one state. The next person or AI picks up without asking.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions.",
      body: "Everything you need to know about HandOff.",
      items: [
        {
          q: "What is HandOff?",
          a: "HandOff is an Agent Handoff Workbench. It turns scattered work context into execution memory — goals, decisions, follow-up tasks, and evidence — that the next person or AI agent can inherit as-is.",
        },
        {
          q: "What can I feed it?",
          a: "Paste meeting notes, customer memos, Slack threads, issue descriptions, or work requests, or upload PDF, DOCX, XLSX, and TXT files.",
        },
        {
          q: "How are documents analyzed?",
          a: "An n8n runtime reads files with Upstage Document Parse, structures key details with Information Extract, then converts them into execution memory with the Solar LLM.",
        },
        {
          q: "What is the AI run prompt?",
          a: "It's not a human todo list — it's an execution input you can hand straight to an AI agent to run the work immediately.",
        },
        {
          q: "Can I publish to GitHub?",
          a: "Yes. Publish your execution memory to a GitHub issue in one click. Only the PAT you enter at publish time is used, and it's never stored.",
        },
        {
          q: "Is my data safe?",
          a: "History is saved per account after GitHub login, and the publishing token lives only in browser memory until it's used.",
        },
      ],
    },
    pricing: {
      eyebrow: "PRICING",
      title: "Simple, transparent pricing",
      body: "Start free as an individual, scale together as a team.",
      plans: [
        {
          name: "Free",
          tagline: "Plenty for personal use",
          price: "$0",
          credits: "20 runs / month",
          perCredit: "Core features",
          cta: "Get started",
        },
        {
          name: "Pro",
          tagline: "For everyday use",
          price: "$15",
          credits: "Unlimited runs",
          perCredit: "PDF·DOCX·XLSX parsing",
          popular: true,
          cta: "Buy now",
        },
        {
          name: "Team",
          tagline: "Your team's handoffs in one place",
          price: "$39",
          credits: "5-seat workspace",
          perCredit: "Shared history",
          cta: "Buy now",
        },
        {
          name: "Enterprise",
          tagline: "Tailored for large organizations",
          cta: "Contact us",
          enterprise: true,
        },
      ],
    },
    finalCta: {
      eyebrow: "START NOW",
      title: "Hand off without losing context.",
      body: "Open the workbench and create your first execution memory. No install, no credit card.",
    },
    footer: {
      tagline: "HandOff turns scattered work context into execution memory.",
      rights: "© 2026 HandOff. All rights reserved.",
      cols: [
        { title: "Product", links: ["How it works", "Features", "Pricing", "FAQ"] },
        { title: "Company", links: ["About", "Blog", "Contact"] },
        { title: "Legal", links: ["Terms", "Privacy", "Security"] },
      ],
    },
  },
};
