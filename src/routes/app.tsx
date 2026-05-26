import { createFileRoute } from "@tanstack/react-router";
import HandoffDemo from "@/components/HandoffDemo";

export const Route = createFileRoute("/app")({
  component: AppWorkbench,
});

function AppWorkbench() {
  return <HandoffDemo />;
}
