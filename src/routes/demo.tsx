import { createFileRoute } from "@tanstack/react-router";
import HandoffDemo from "@/components/HandoffDemo";

export const Route = createFileRoute("/demo")({
  component: DemoWorkbench,
});

function DemoWorkbench() {
  return <HandoffDemo />;
}
