import { useEffect, useState } from "react";

// Shows a dismissible banner after returning from Checkout. Polar
// redirects to `?billing=success` (paid) or `?billing=cancel` (backed out).
// The plan itself is granted asynchronously by the webhook, so success copy
// avoids promising the plan is already live.
export function BillingBanner() {
  const [state, setState] = useState<"success" | "cancel" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("billing");
    if (value === "success" || value === "cancel") {
      setState(value);
      // Clean the URL so a refresh doesn't re-show the banner.
      const url = new URL(window.location.href);
      url.searchParams.delete("billing");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  if (!state) return null;

  const isSuccess = state === "success";
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3 text-sm ${
        isSuccess ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-[var(--d-muted)]"
      }`}
    >
      <span>
        {isSuccess
          ? "결제가 완료됐어요. 플랜이 곧 반영됩니다."
          : "결제가 취소됐어요. 언제든 다시 시작할 수 있어요."}
      </span>
      <button
        onClick={() => setState(null)}
        className="shrink-0 rounded px-2 py-1 text-xs opacity-70 hover:opacity-100"
      >
        닫기
      </button>
    </div>
  );
}
