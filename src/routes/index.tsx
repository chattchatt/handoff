import { createFileRoute } from "@tanstack/react-router";
import HandoffLanding from "@/components/HandoffLanding";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "HandOff — 그냥 넘기세요" },
      {
        name: "description",
        content:
          "회의록·PDF·흩어진 메모를 다시 정리하지 마세요. 그냥 넘기면 사람과 AI 에이전트로 이뤄진 당신의 팀이 이어받아 일합니다.",
      },
      { property: "og:title", content: "HandOff — 그냥 넘기세요" },
      {
        property: "og:description",
        content: "넘기는 순간, 사람과 AI 에이전트가 실행 가능한 작업으로 이어받습니다.",
      },
      { property: "og:url", content: "https://view-capture-match.lovable.app/" },
    ],
  }),
});

function Index() {
  return <HandoffLanding />;
}
