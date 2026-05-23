import { createFileRoute } from "@tanstack/react-router";
import UpflowDemo from "@/components/UpflowDemo";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <UpflowDemo />;
}
