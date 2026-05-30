import { createFileRoute } from "@tanstack/react-router";
import HandoffDemo from "@/components/HandoffDemo";
import { BillingBanner } from "@/components/BillingBanner";

export const Route = createFileRoute("/app")({
  component: AppWorkbench,
});

function AppWorkbench() {
  return (
    <>
      <BillingBanner />
      <HandoffDemo />
    </>
  );
}
