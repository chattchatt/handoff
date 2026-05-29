import { createFileRoute } from "@tanstack/react-router";
import HandoffLanding from "@/components/HandoffLanding";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "HandOff — Agent Handoff Workbench" },
      {
        name: "description",
        content:
          "흩어진 업무 맥락을 목표·결정·후속 작업·근거로 정리해, 다음 사람이나 AI 에이전트가 그대로 이어받는 실행 기억으로 바꿉니다.",
      },
      { property: "og:title", content: "HandOff — Agent Handoff Workbench" },
      {
        property: "og:description",
        content: "흩어진 업무 맥락을 다음 사람·AI가 그대로 이어받는 실행 기억으로 바꾸세요.",
      },
      { property: "og:url", content: "https://view-capture-match.lovable.app/" },
    ],
  }),
});

function Index() {
  return <HandoffLanding />;
}
