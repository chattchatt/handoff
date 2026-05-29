export type Lang = "ko" | "en";

export type ProcessRow = {
  index: string;
  label: string;
  title: string;
  body: string;
  video?: string;
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
  cta: { start: string; github: string; explore: string; pricing: string; viewAllPlans: string };
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
      start: "자료 넘기기",
      github: "GitHub로 시작하기",
      explore: "작동 방식 보기",
      pricing: "요금제 보기",
      viewAllPlans: "모든 플랜 보기",
    },
    hero: {
      eyebrow: "사람 + AI 에이전트 협업",
      titleA: "회의록도, PDF도,\n흩어진 메모도\n",
      titleAccent: "그냥 넘기세요",
      titleB: ".",
      body: "다시 정리하지 마세요. 넘기는 순간, 사람과 AI 에이전트로 이뤄진 당신의 팀이 이어받아 일합니다. 사람이 읽는 요약이 아니라, AI가 바로 실행하는 작업으로요.",
    },
    process: {
      pill: "HOW IT WORKS",
      titleA: "넘기면, 세 개의 엔진이",
      titleFaded: "이어받습니다.",
      body: "Upstage 3-API가 읽고, 뽑고, 씁니다. 그리고 GitHub 이슈로 발행됩니다.",
      rows: [
        {
          index: "01",
          label: "INPUT",
          title: "회의록 하나, PDF 한 장이면 충분합니다",
          body: "회의록·고객 메모·Slack 논의·이슈 설명을 붙여넣거나 PDF·DOCX·XLSX를 그대로 넘기세요. 다시 정리할 필요 없습니다.",
          video: "/videos/meeting.mp4",
        },
        {
          index: "02",
          label: "뽑기 · EXTRACT",
          title: "실행 가능한 작업으로 뽑아냅니다",
          body: "Information Extract가 작업·담당·맥락·완료 조건을 항목으로 뽑습니다. 자유로운 요약이 아니라 실행 단위로요.",
          video: "/videos/extract.mp4",
        },
        {
          index: "03",
          label: "쓰기 · HANDOFF",
          title: "이슈로 써서 팀에게 넘깁니다",
          body: "Solar가 사람과 AI가 읽을 이슈로 쓰고, GitHub 이슈로 발행합니다. 사람도 코딩 에이전트도 거기서 바로 이어받습니다.",
          video: "/videos/issue.mp4",
        },
      ],
    },
    services: {
      eyebrow: "FEATURES",
      title: "요약기가 아닙니다. 인수인계 도구입니다.",
      body: "더 똑똑한 모델이 아니라, 일을 잘 쪼개고 명세하고 검증을 붙입니다. 같은 모델이라도 결과물의 차원이 달라집니다.",
      items: [
        {
          index: "01",
          name: "실행 가능한 작업으로 분해",
          body: "통째로 던지면 얕은 결과 하나뿐입니다. HandOff는 일을 잘게 쪼개고 각 작업에 무엇을 어디까지 할지를 붙여, 팀 전체가 나눠 맡게 합니다.",
        },
        {
          index: "02",
          name: "진짜 문서 처리",
          body: "PDF도, 표도, 한국어 문서도. Upstage Document Parse·Information Extract·Solar 3-API가 읽고, 뽑고, 씁니다.",
        },
        {
          index: "03",
          name: "GitHub 이슈 발행",
          body: "정리된 작업을 GitHub 이슈로 올립니다. 사람도 코딩 에이전트도 거기서 바로 이어받습니다. 발행 시점의 PAT만 사용하고 어디에도 저장하지 않습니다.",
        },
        {
          index: "04",
          name: "사람 + AI 팀",
          body: "혼자 짊어지지 마세요. 넘기는 순간 사람과 AI 에이전트가 동시에 나눠 맡아 함께 책임집니다.",
        },
      ],
    },
    timeline: {
      pill: "시작하기",
      titleA: "세 단계로 ",
      titleFaded: "그냥",
      titleB: " 넘기세요.",
      body: "자료를 넘기는 것부터 GitHub 발행까지 — 몇 분이면 충분합니다.",
      steps: [
        {
          index: "01",
          title: "자료 넘기기",
          duration: "1분",
          body: "회의록·메모·PDF·DOCX를 붙여넣거나 업로드하세요. 다시 정리하지 마세요.",
        },
        {
          index: "02",
          title: "읽기 · 뽑기 · 쓰기",
          duration: "30초",
          body: "Upstage 3-API가 문서를 읽고, 작업으로 뽑아, 이슈로 씁니다.",
        },
        {
          index: "03",
          title: "GitHub로 넘기기",
          duration: "즉시",
          body: "사람과 AI 에이전트가 GitHub 이슈에서 바로 이어받습니다.",
        },
      ],
    },
    comparison: {
      eyebrow: "WHY HANDOFF",
      title: "그냥 던지는 것과 비교해 보세요.",
      body: "통째로 던지는 건 신입 한 명에게 '알아서 다 해줘' 하고 떠넘기는 것과 같습니다. 차이를 확인하세요.",
      leftTitle: "그냥 프롬프트에 던지기",
      leftChips: ["한 덩어리 결과", "얕은 할 일", "빠진 맥락", "혼자 떠안기"],
      leftBody:
        "AI에게 통째로 던지면 한 덩어리짜리 할 일 목록이 나옵니다. 얕고, 뭐가 빠졌는지도 모릅니다. 결국 당신이 다 짊어집니다.",
      rightTitle: "HandOff로 넘기기",
      rightChips: ["잘게 쪼갠 작업", "완료 조건 명시", "GitHub 이슈 발행", "사람+AI 협업"],
      rightBody:
        "일을 잘 쪼개고, 명세하고, 검증을 붙여 GitHub 이슈로 올립니다. 사람도 AI 에이전트도 동시에 이어받아 함께 해냅니다.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "자주 묻는 질문.",
      body: "HandOff에 대해 알아야 할 모든 것.",
      items: [
        {
          q: "HandOff란 무엇인가요?",
          a: "회의록·PDF·흩어진 메모를 다시 정리하지 않고 그냥 넘기면, 사람과 AI 에이전트로 이뤄진 당신의 팀이 이어받아 일하도록 만드는 도구입니다.",
        },
        {
          q: "그냥 ChatGPT에 붙여넣는 것과 뭐가 다른가요?",
          a: "ChatGPT는 한 덩어리짜리 할 일 목록을 줍니다. HandOff는 진짜 문서(PDF·표·한국어)를 다루고, 일을 실행 가능한 작업으로 쪼개 GitHub 이슈로 발행합니다.",
        },
        {
          q: "문서는 어떻게 처리되나요?",
          a: "Upstage Document Parse가 읽고, Information Extract가 작업으로 뽑고, Solar가 이슈로 씁니다. 읽기 · 뽑기 · 쓰기 한 줄기 흐름입니다.",
        },
        {
          q: "발행하면 AI가 알아서 다 끝내주나요?",
          a: "아닙니다. HandOff는 사람과 에이전트가 이어받을 수 있는 작업을 정확히 만들어 올립니다. 이슈 이후 실행은 GitHub 위의 사람·코딩 에이전트가 맡습니다.",
        },
        {
          q: "GitHub로 발행할 수 있나요?",
          a: "정리된 작업을 한 번의 클릭으로 GitHub 이슈로 발행할 수 있습니다. 발행 시점에 입력한 PAT만 사용하며 어디에도 저장하지 않습니다.",
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
      title: "다시 정리하지 마세요. 그냥 넘기세요.",
      body: "넘기는 순간 사람과 AI 에이전트가 이어받습니다. 설치도, 신용카드도 필요 없습니다.",
    },
    footer: {
      tagline: "회의록·PDF·흩어진 메모를 사람과 AI가 함께 일하는 작업으로. 그냥 넘기세요.",
      rights: "© 2026 HandOff. All rights reserved.",
      cols: [],
    },
  },
  en: {
    nav: { process: "How it works", services: "Features", pricing: "Pricing", faq: "FAQ" },
    cta: {
      start: "Hand it off",
      github: "Continue with GitHub",
      explore: "See how it works",
      pricing: "View Pricing",
      viewAllPlans: "View all plans",
    },
    hero: {
      eyebrow: "People + AI agents, together",
      titleA: "Meeting notes, PDFs,\nscattered memos —\n",
      titleAccent: "just hand them off",
      titleB: ".",
      body: "Stop re-organizing. The moment you hand it off, your team of people and AI agents picks up the work — not a summary to read, but tasks an AI can run right away.",
    },
    process: {
      pill: "HOW IT WORKS",
      titleA: "Hand it off, and three engines",
      titleFaded: "take over.",
      body: "Upstage's 3 APIs read, extract, and write. Then it's published as a GitHub issue.",
      rows: [
        {
          index: "01",
          label: "INPUT",
          title: "A doc or a transcript is enough",
          body: "Paste meeting notes, customer memos, Slack threads, or issues — or hand off PDF, DOCX, and XLSX files as-is. No re-organizing needed.",
          video: "/videos/meeting.mp4",
        },
        {
          index: "02",
          label: "EXTRACT",
          title: "Pulls out executable tasks",
          body: "Information Extract pulls tasks, owners, context, and done conditions as items — execution units, not a loose summary.",
          video: "/videos/extract.mp4",
        },
        {
          index: "03",
          label: "WRITE · HANDOFF",
          title: "Writes issues and hands them to the team",
          body: "Solar writes issues for people and AI to read, then publishes them to GitHub. People and coding agents pick them up right there.",
          video: "/videos/issue.mp4",
        },
      ],
    },
    services: {
      eyebrow: "FEATURES",
      title: "Not a summarizer. A handoff tool.",
      body: "Not a smarter model — it splits the work well, specs it, and adds verification. Same model, a different class of output.",
      items: [
        {
          index: "01",
          name: "Broken into executable tasks",
          body: "Throw it whole and you get one shallow result. HandOff splits the work and attaches what to do and how far, so the whole team can share it.",
        },
        {
          index: "02",
          name: "Real document handling",
          body: "PDFs, tables, Korean documents too. Upstage's Document Parse, Information Extract, and Solar read, extract, and write.",
        },
        {
          index: "03",
          name: "GitHub issue publishing",
          body: "Structured tasks go up as GitHub issues. People and coding agents pick them up right there. Only the PAT you enter at publish time is used — never stored.",
        },
        {
          index: "04",
          name: "People + AI team",
          body: "Stop carrying it alone. The moment you hand it off, people and AI agents share the load and own it together.",
        },
      ],
    },
    timeline: {
      pill: "GET STARTED",
      titleA: "Just hand it off in 3 ",
      titleFaded: "simple",
      titleB: " steps.",
      body: "From handing off the material to publishing on GitHub — it only takes minutes.",
      steps: [
        {
          index: "01",
          title: "Hand off the material",
          duration: "1 min",
          body: "Paste meeting notes, memos, PDFs, or DOCX — or upload them. No re-organizing.",
        },
        {
          index: "02",
          title: "Read · Extract · Write",
          duration: "30 sec",
          body: "Upstage's 3 APIs read the document, extract tasks, and write them as issues.",
        },
        {
          index: "03",
          title: "Hand off to GitHub",
          duration: "Instant",
          body: "People and AI agents pick up the work right from the GitHub issue.",
        },
      ],
    },
    comparison: {
      eyebrow: "WHY HANDOFF",
      title: "Compare it to just throwing it in.",
      body: "Dumping it whole is like telling a new hire 'figure it all out.' See the difference.",
      leftTitle: "Throw it in a prompt",
      leftChips: ["One blob result", "Shallow todos", "Missing context", "Carry it alone"],
      leftBody:
        "Throw it at an AI whole and you get a single blob of a todo list. Shallow, with no idea what's missing. You end up carrying it all.",
      rightTitle: "Hand it off with HandOff",
      rightChips: ["Split-up tasks", "Done conditions", "GitHub issues", "People + AI"],
      rightBody:
        "Split well, specced, verified, and published as GitHub issues. People and AI agents pick it up at once and get it done together.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions.",
      body: "Everything you need to know about HandOff.",
      items: [
        {
          q: "What is HandOff?",
          a: "Instead of re-organizing meeting notes, PDFs, and scattered memos, just hand them off — and your team of people and AI agents picks up the work.",
        },
        {
          q: "How is it different from pasting into ChatGPT?",
          a: "ChatGPT gives you one blob of a todo list. HandOff handles real documents (PDFs, tables, Korean), splits the work into executable tasks, and publishes them as GitHub issues.",
        },
        {
          q: "How are documents processed?",
          a: "Upstage Document Parse reads, Information Extract pulls out tasks, and Solar writes the issues. Read · Extract · Write, in one flow.",
        },
        {
          q: "Does the AI finish everything once it's published?",
          a: "No. HandOff produces tasks precisely enough for people and agents to pick up. Execution after the issue is handled by people and coding agents on GitHub.",
        },
        {
          q: "Can I publish to GitHub?",
          a: "Yes. Publish structured tasks to a GitHub issue in one click. Only the PAT you enter at publish time is used, and it's never stored.",
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
      title: "Stop re-organizing. Just hand it off.",
      body: "The moment you hand it off, people and AI agents pick it up. No install, no credit card.",
    },
    footer: {
      tagline: "Meeting notes, PDFs, scattered memos — into work people and AI do together. Just hand it off.",
      rights: "© 2026 HandOff. All rights reserved.",
      cols: [],
    },
  },
};
