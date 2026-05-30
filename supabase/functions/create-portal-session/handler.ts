// Opens the Polar Customer Portal so a subscribed user can update payment
// details, switch plan, or cancel. Requires a logged-in caller (verify_jwt =
// true). We look the customer up by externalCustomerId = our Supabase user id,
// so no Polar customer id needs to be stored. Returns the hosted portal URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { polarClient } from "../_shared/polar.ts";

export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse({ error: "missing_authorization" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return jsonResponse({ error: "invalid_session" }, 401);

    try {
      const session = await polarClient().customerSessions.create({
        externalCustomerId: user.id,
      });
      return jsonResponse({ url: session.customerPortalUrl });
    } catch {
      // No Polar customer yet (never subscribed) — nothing to manage.
      return jsonResponse({ error: "no_customer" }, 404);
    }
  } catch (err) {
    console.error("create-portal-session error", err);
    return jsonResponse({ error: "portal_failed" }, 500);
  }
}
