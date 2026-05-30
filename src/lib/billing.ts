import { getSupabase } from "@/lib/supabase";

export type BillingPlan = "pro" | "team";

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL ?? ""}/functions/v1`;

async function callFunction(name: string, body: unknown): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("billing_unavailable");

  // The Edge Functions verify the user's JWT, so we forward the current session
  // access token. No session => the caller must log in first.
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("not_authenticated");

  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "request_failed");
  return json.url;
}

/**
 * Starts Polar Checkout for a plan and redirects the browser to the hosted
 * page. Throws "not_authenticated" if there is no session — callers should
 * trigger login first.
 */
export async function startCheckout(plan: BillingPlan, returnTo = "/app"): Promise<void> {
  const url = await callFunction("create-checkout-session", { plan, returnTo });
  window.location.href = url;
}

/** Opens the Polar Customer Portal (manage / cancel an existing subscription). */
export async function openBillingPortal(): Promise<void> {
  const url = await callFunction("create-portal-session", {});
  window.location.href = url;
}
