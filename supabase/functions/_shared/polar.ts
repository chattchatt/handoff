// Shared Polar + Supabase clients for the Edge Functions.
//
// Polar is the Merchant of Record: it is the legal seller, remits global tax,
// and pays us out (South Korea is supported via Stripe Connect Express), so a
// Korea-based individual can sell without a business registration. We map our
// Supabase user to Polar via `externalCustomerId` = user.id, which means no
// pre-created customer record is needed before checkout.
import { Polar } from "https://esm.sh/@polar-sh/sdk@0.47.1?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Lazy factory (not a module-level singleton) so importing this module never
// constructs a client — keeps the functions testable without real credentials.
export function polarClient(): Polar {
  return new Polar({
    // "sandbox" for testing, "production" for live. Defaults to sandbox so a
    // misconfigured deploy can't accidentally take real money.
    server: (Deno.env.get("POLAR_SERVER") as "sandbox" | "production") || "sandbox",
    accessToken: Deno.env.get("POLAR_ACCESS_TOKEN") ?? "",
  });
}

// Service-role client: RLS-exempt, used only inside trusted server functions to
// write the subscriptions table. NEVER expose this key to the browser.
export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

// Maps a Polar product id back to our internal plan name. Product ids are
// provided as secrets so the same code works across sandbox/production.
export function planForProduct(productId: string | null | undefined): string | null {
  if (!productId) return null;
  if (productId === Deno.env.get("POLAR_PRODUCT_PRO")) return "pro";
  if (productId === Deno.env.get("POLAR_PRODUCT_TEAM")) return "team";
  return null;
}

export function productForPlan(plan: string): string | null {
  if (plan === "pro") return Deno.env.get("POLAR_PRODUCT_PRO") ?? null;
  if (plan === "team") return Deno.env.get("POLAR_PRODUCT_TEAM") ?? null;
  return null;
}
