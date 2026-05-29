import { createFileRoute } from "@tanstack/react-router";
import HandoffLanding from "@/components/HandoffLanding";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "daval.cloud — AI 자동화 전문 대행" },
      {
        name: "description",
        content:
          "반복 업무는 AI에게, 성장은 당신에게. 워크플로우 분석부터 맞춤 자동화 구축, 운영까지 daval.cloud가 처음부터 끝까지 대행합니다.",
      },
      { property: "og:title", content: "daval.cloud — AI 자동화 전문 대행" },
      {
        property: "og:description",
        content: "반복 업무는 AI에게, 성장은 당신에게. AI 자동화를 처음부터 끝까지 대행합니다.",
      },
      { property: "og:url", content: "https://view-capture-match.lovable.app/" },
    ],
  }),
});

function Index() {
  return <HandoffLanding />;
}
