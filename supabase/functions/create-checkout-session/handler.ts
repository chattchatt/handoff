// Creates a Polar Checkout session for a subscription plan.
//
// Flow: the browser POSTs { plan, returnTo } with the logged-in user's Supabase
// access token in the Authorization header. We validate the token, then create
// a Polar Checkout for the plan's product, tagging it with externalCustomerId =
// our Supabase user id. The browser redirects to the returned hosted URL. The
// actual plan grant happens later, in polar-webhook, after Polar confirms the
// subscription — never here.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { polarClient, productForPlan } from "../_shared/polar.ts";

export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse({ error: "missing_authorization" }, 401);

    // Validate the caller's JWT and resolve the user (anon client + the caller's
    // token; this is the supported server-side way to verify a Supabase session).
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return jsonResponse({ error: "invalid_session" }, 401);

    const body = (await req.json().catch(() => ({}))) as { plan?: string; returnTo?: string };
    const plan = body.plan;
    if (plan !== "pro" && plan !== "team") return jsonResponse({ error: "invalid_plan" }, 400);

    const productId = productForPlan(plan);
    if (!productId) return jsonResponse({ error: "product_not_configured" }, 500);

    const origin = req.headers.get("origin") ?? Deno.env.get("APP_URL") ?? "";
    const checkout = await polarClient().checkouts.create({
      products: [productId],
      // Polar links/creates the customer by this id, so the webhook can map the
      // resulting subscription back to our user with no separate customer record.
      externalCustomerId: user.id,
      customerEmail: user.email ?? undefined,
      successUrl: `${origin}${body.returnTo ?? "/app"}?billing=success`,
      metadata: { supabase_user_id: user.id },
    });

    return jsonResponse({ url: checkout.url });
  } catch (err) {
    console.error("create-checkout-session error", err);
    return jsonResponse({ error: "checkout_failed" }, 500);
  }
}
