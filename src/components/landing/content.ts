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
    nav: { process: "프로세스", services: "서비스", pricing: "요금제", faq: "자주 묻는 질문" },
    cta: {
      start: "무료로 시작하기",
      explore: "서비스 알아보기",
      pricing: "요금제 보기",
      viewAllPlans: "모든 플랜 보기",
    },
    hero: {
      eyebrow: "AI 자동화 전문 대행",
      titleA: "반복 업무는 ",
      titleAccent: "AI",
      titleB: "에게,\n성장은 당신에게.",
      body: "업무 자동화를 전문가가 대행합니다. 워크플로우 분석부터 맞춤 자동화 구축, 운영까지. daval.cloud가 비즈니스 자동화를 처음부터 끝까지 대행합니다.",
    },
    process: {
      pill: "PROCESS",
      titleA: "아이디어에서 결과까지,",
      titleFaded: "네 번의 터치.",
      body: "실제 화면으로 보는 daval.cloud의 협업 방식.",
      rows: [
        {
          index: "01",
          label: "REQUEST",
          title: "엑셀 한 장과 한 문단이면 충분합니다",
          body: "반복되는 업무를 그대로 적어 보내세요. 자동화 엔지니어가 직접 받아봅니다.",
        },
        {
          index: "02",
          label: "COLLABORATE",
          title: "대화로 요구사항을 다듬습니다",
          body: "코멘트로 범위를 조율하고, 견적을 확정하기 전에 충분히 이야기합니다.",
        },
        {
          index: "03",
          label: "APPROVE",
          title: "승인하는 순간 크레딧이 차감됩니다",
          body: "견적과 잔액, 승인 후 잔액까지 한 화면에서 확인하고 한 번의 클릭으로 확정하세요.",
        },
        {
          index: "04",
          label: "DELIVER",
          title: "결과는 파일이 아니라 대시보드에 쌓입니다",
          body: "모든 실행이 하나의 링크에 쌓입니다. 다운로드 없이 언제든 다시 보고 공유하세요.",
        },
      ],
    },
    services: {
      eyebrow: "SERVICES",
      title: "자동화에 필요한 모든 것을 대행합니다.",
      body: "워크플로우 분석부터 맞춤 구축, 크레딧 기반 운영, 지속적인 최적화까지 — 전문가가 자동화의 전 과정을 관리합니다.",
      items: [
        {
          index: "01",
          name: "워크플로우 분석",
          body: "현재 업무 프로세스를 분석해 자동화 기회를 찾아냅니다. 반복적인 수작업, 데이터 처리 병목, 비효율적인 커뮤니케이션 흐름을 진단합니다.",
        },
        {
          index: "02",
          name: "맞춤 자동화 구축",
          body: "분석을 바탕으로 비즈니스에 최적화된 AI 자동화 워크플로우를 설계하고 구축합니다. n8n 기반 워크플로우는 AES-256-GCM으로 암호화되어 안전하게 보호됩니다.",
        },
        {
          index: "03",
          name: "크레딧 기반 운영",
          body: "구축된 자동화는 크레딧 시스템으로 간단하게 실행됩니다. 투명한 사용량 기반 요금제로 서버 비용이나 유지보수 걱정 없이 운영하세요.",
        },
        {
          index: "04",
          name: "지속적인 최적화",
          body: "운영 데이터를 기반으로 자동화 성능을 모니터링하고 끊임없이 개선합니다. 성공률, ROI, 실행 비용을 실시간 대시보드에서 확인하고 최적화 제안을 받아보세요.",
        },
      ],
    },
    timeline: {
      pill: "진행 방식",
      titleA: "간단한 3단계로 ",
      titleFaded: "자동화를",
      titleB: " 시작하세요.",
      body: "요청 제출부터 견적 확인, 납품까지 — 모든 단계에서 투명하게 진행 상황을 공유합니다.",
      steps: [
        {
          index: "01",
          title: "요청 제출",
          duration: "5분",
          body: "자동화하고 싶은 업무를 설명하고 요청을 제출하세요. 파일 첨부, 참고 URL, 기대 효과 등을 자유롭게 적어주세요.",
        },
        {
          index: "02",
          title: "견적 확인 & 승인",
          duration: "24시간",
          body: "전문가가 요청을 검토하고 비용과 기간이 포함된 견적을 보내드립니다. 견적에 동의하면 크레딧이 자동 차감되고 개발이 시작됩니다.",
        },
        {
          index: "03",
          title: "납품 & 운영",
          duration: "자동화",
          body: "완성된 자동화는 암호화된 .daval 파일로 납품됩니다. 대시보드에서 실행 현황, 성공률, ROI를 실시간으로 확인하고 관리하세요.",
        },
      ],
    },
    comparison: {
      eyebrow: "WHY DAVAL.CLOUD",
      title: "직접 만드는 것과 비교해 보세요.",
      body: "개발자 채용부터 서버 관리까지 — 자동화를 직접 구축하는 것과 daval.cloud에 맡기는 것의 차이를 확인하세요.",
      leftTitle: "직접 자동화 구축",
      leftChips: ["개발자 필요", "높은 초기 비용", "긴 개발 기간", "유지보수 부담"],
      leftBody:
        "개발자 채용, n8n/Zapier 학습, 서버 관리, 보안 설정… 자동화 하나를 만드는 데 수개월이 걸립니다.",
      rightTitle: "daval.cloud에 맡기기",
      rightChips: ["전문가 대행", "크레딧 요금제", "빠른 납품", "AES-256 보안"],
      rightBody:
        "요청만 제출하면 분석부터 구축까지 전문가가 모두 처리합니다. 크레딧 기반으로 사용한 만큼만 지불하세요.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "자주 묻는 질문.",
      body: "daval.cloud에 대해 알아야 할 모든 것.",
      items: [
        {
          q: "daval.cloud란 무엇인가요?",
          a: "daval.cloud는 AI 자동화 전문 대행 서비스입니다. 워크플로우 분석부터 맞춤 자동화 구축, 운영, 최적화까지 전문가가 전 과정을 대행합니다.",
        },
        {
          q: "크레딧은 어떻게 작동하나요?",
          a: "크레딧은 자동화 실행에 사용되는 사용량 기반 단위입니다. 미리 충전해 두고 자동화가 실행될 때마다 차감되며, 서버 비용이나 유지보수 비용은 별도로 들지 않습니다.",
        },
        {
          q: ".daval 파일이란 무엇인가요?",
          a: "완성된 자동화는 AES-256-GCM으로 암호화된 .daval 파일로 납품됩니다. 워크플로우가 안전하게 보호되며 대시보드를 통해 바로 실행할 수 있습니다.",
        },
        {
          q: "요청부터 납품까지 얼마나 걸리나요?",
          a: "요청 검토와 견적 전달은 보통 24시간 이내에 이뤄집니다. 납품까지의 전체 기간은 자동화의 복잡도에 따라 견적 단계에서 안내해 드립니다.",
        },
        {
          q: "어떤 종류의 자동화를 만들 수 있나요?",
          a: "데이터 수집·정리, 리포트 생성, 이메일·메시지 발송, 시스템 간 연동 등 반복적인 업무라면 대부분 자동화할 수 있습니다.",
        },
        {
          q: "Zapier나 Make와 어떻게 다른가요?",
          a: "도구를 직접 배우고 설정할 필요가 없습니다. 요청만 제출하면 전문가가 분석부터 구축, 운영까지 대행하고, 사용한 만큼만 크레딧으로 지불합니다.",
        },
      ],
    },
    pricing: {
      eyebrow: "PRICING",
      title: "간단하고 투명한 요금제",
      body: "사용한 만큼만 지불하세요. 숨은 비용도, 서버 비용도 없습니다.",
      plans: [
        {
          name: "Starter",
          tagline: "가볍게 시작하기 좋아요",
          price: "₩10,000",
          credits: "100 크레딧",
          perCredit: "크레딧당 ₩100",
          cta: "구매하기",
        },
        {
          name: "Growth",
          tagline: "성장하는 팀을 위한 최고의 선택",
          price: "₩45,000",
          credits: "500 크레딧",
          perCredit: "크레딧당 ₩90",
          popular: true,
          cta: "구매하기",
        },
        {
          name: "Scale",
          tagline: "본격적인 자동화가 필요할 때",
          price: "₩80,000",
          credits: "1,000 크레딧",
          perCredit: "크레딧당 ₩80",
          cta: "구매하기",
        },
        {
          name: "Enterprise",
          tagline: "대규모 조직을 위한 맞춤형 플랜",
          cta: "모든 플랜 보기",
          enterprise: true,
        },
      ],
    },
    finalCta: {
      eyebrow: "START NOW",
      title: "반복 업무를 AI에게 넘기세요.",
      body: "무료로 가입하고 첫 자동화 요청을 제출하세요. 신용카드가 필요 없습니다.",
    },
    footer: {
      tagline: "AI 자동화를 처음부터 끝까지 대행하는 daval.cloud.",
      rights: "© 2026 daval.cloud. All rights reserved.",
      cols: [
        { title: "제품", links: ["프로세스", "서비스", "요금제", "FAQ"] },
        { title: "회사", links: ["소개", "블로그", "채용", "문의"] },
        { title: "법적 고지", links: ["이용약관", "개인정보처리방침", "보안"] },
      ],
    },
  },
  en: {
    nav: { process: "Process", services: "Services", pricing: "Pricing", faq: "FAQ" },
    cta: {
      start: "Get Started Free",
      explore: "Explore Services",
      pricing: "View Pricing",
      viewAllPlans: "View all plans",
    },
    hero: {
      eyebrow: "AI Automation Agency",
      titleA: "Let ",
      titleAccent: "AI",
      titleB: " handle the routine.\nYou focus on growth.",
      body: "Our experts handle your business automation end-to-end. From workflow analysis to custom automation building and operations — daval.cloud delivers results without the technical burden.",
    },
    process: {
      pill: "PROCESS",
      titleA: "From idea to outcome,",
      titleFaded: "in four touches.",
      body: "How we collaborate on daval.cloud, shown on real screens.",
      rows: [
        {
          index: "01",
          label: "REQUEST",
          title: "An Excel file and one paragraph is enough",
          body: "Describe the work you keep repeating. A real automation engineer reads it.",
        },
        {
          index: "02",
          label: "COLLABORATE",
          title: "Shape the scope through conversation",
          body: "Align requirements in comments before the quote is fixed.",
        },
        {
          index: "03",
          label: "APPROVE",
          title: "Credits deduct the moment you approve",
          body: "See the quote, your balance, and the balance after approval on one screen — confirm with a single click.",
        },
        {
          index: "04",
          label: "DELIVER",
          title: "Results live in a dashboard, not a file",
          body: "Every run stacks into one link you can revisit anytime. Share without downloads.",
        },
      ],
    },
    services: {
      eyebrow: "SERVICES",
      title: "We handle everything in automation.",
      body: "From workflow analysis to custom building, credit-based operations, and continuous optimization — our experts manage the entire automation process.",
      items: [
        {
          index: "01",
          name: "Workflow Analysis",
          body: "We analyze your current business processes to identify automation opportunities. We diagnose repetitive manual tasks, data processing bottlenecks, and inefficient communication flows.",
        },
        {
          index: "02",
          name: "Custom Automation Build",
          body: "Based on our analysis, we design and build AI automation workflows optimized for your business. n8n-based workflows are encrypted with AES-256-GCM for secure protection.",
        },
        {
          index: "03",
          name: "Credit-Based Operations",
          body: "Built automations run simply through our credit system. With transparent pay-as-you-go pricing, operate without worrying about server costs or maintenance.",
        },
        {
          index: "04",
          name: "Continuous Optimization",
          body: "We monitor automation performance based on operational data and continuously improve it. Check success rates, ROI, and execution costs on your real-time dashboard.",
        },
      ],
    },
    timeline: {
      pill: "OUR PROCESS",
      titleA: "Start automation in 3 ",
      titleFaded: "simple",
      titleB: " steps.",
      body: "From request submission to quote review and delivery — we share transparent progress updates at every step.",
      steps: [
        {
          index: "01",
          title: "Submit Request",
          duration: "5 min",
          body: "Describe the work you want to automate and submit a request. Feel free to attach files, reference URLs, and expected outcomes.",
        },
        {
          index: "02",
          title: "Review Quote & Approve",
          duration: "24 hours",
          body: "Our experts review your request and send a quote with cost and timeline. Once you approve, credits are deducted and development begins.",
        },
        {
          index: "03",
          title: "Delivery & Operations",
          duration: "Automated",
          body: "Completed automations are delivered as encrypted .daval files. Monitor execution status, success rates, and ROI in real-time from your dashboard.",
        },
      ],
    },
    comparison: {
      eyebrow: "WHY DAVAL.CLOUD",
      title: "Compare with building it yourself.",
      body: "From hiring developers to managing servers — see the difference between building automation yourself and leaving it to daval.cloud.",
      leftTitle: "Build Automation Yourself",
      leftChips: ["Developers needed", "High upfront cost", "Long development time", "Maintenance burden"],
      leftBody:
        "Hiring developers, learning n8n/Zapier, managing servers, setting up security… It takes months to build a single automation.",
      rightTitle: "Leave It to daval.cloud",
      rightChips: ["Expert service", "Credit pricing", "Fast delivery", "AES-256 security"],
      rightBody:
        "Just submit a request and our experts handle everything from analysis to building. Pay only for what you use with credit-based pricing.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions.",
      body: "Everything you need to know about daval.cloud.",
      items: [
        {
          q: "What is daval.cloud?",
          a: "daval.cloud is an AI automation agency. Our experts handle the entire process from workflow analysis to custom building, operations, and optimization.",
        },
        {
          q: "How do credits work?",
          a: "Credits are usage-based units consumed when automations run. Top up in advance and credits are deducted per run — with no separate server or maintenance fees.",
        },
        {
          q: "What are .daval files?",
          a: "Completed automations are delivered as .daval files encrypted with AES-256-GCM, keeping your workflows secure and ready to run from the dashboard.",
        },
        {
          q: "How long from request to delivery?",
          a: "Review and quoting usually happen within 24 hours. The full delivery timeline depends on complexity and is shared during the quote step.",
        },
        {
          q: "What types of automation can you build?",
          a: "Most repetitive work — data collection and cleanup, report generation, email/message dispatch, and system-to-system integrations — can be automated.",
        },
        {
          q: "How is daval.cloud different from Zapier or Make?",
          a: "You never have to learn or configure the tools yourself. Submit a request and experts handle analysis, building, and operations — you pay only for the credits you use.",
        },
      ],
    },
    pricing: {
      eyebrow: "PRICING",
      title: "Simple, transparent pricing",
      body: "Pay only for what you use. No hidden fees, no server costs.",
      plans: [
        {
          name: "Starter",
          tagline: "Perfect for trying out",
          price: "₩10,000",
          credits: "100 Credits",
          perCredit: "₩100 per credit",
          cta: "Buy Now",
        },
        {
          name: "Growth",
          tagline: "Best value for growing teams",
          price: "₩45,000",
          credits: "500 Credits",
          perCredit: "₩90 per credit",
          popular: true,
          cta: "Buy Now",
        },
        {
          name: "Scale",
          tagline: "For serious automation needs",
          price: "₩80,000",
          credits: "1,000 Credits",
          perCredit: "₩80 per credit",
          cta: "Buy Now",
        },
        {
          name: "Enterprise",
          tagline: "Tailored for large organizations",
          cta: "View all plans",
          enterprise: true,
        },
      ],
    },
    finalCta: {
      eyebrow: "START NOW",
      title: "Hand off repetitive tasks to AI.",
      body: "Sign up free and submit your first automation request. No credit card required.",
    },
    footer: {
      tagline: "daval.cloud handles AI automation end-to-end.",
      rights: "© 2026 daval.cloud. All rights reserved.",
      cols: [
        { title: "Product", links: ["Process", "Services", "Pricing", "FAQ"] },
        { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
        { title: "Legal", links: ["Terms", "Privacy", "Security"] },
      ],
    },
  },
};
