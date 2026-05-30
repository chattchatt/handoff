// Receives Polar webhook events and is the ONLY place a plan is granted or
// revoked. Polar signs events with the Standard Webhooks spec; validateEvent
// verifies the signature (this function runs with verify_jwt = false, see
// supabase/config.toml — there is no Supabase JWT on a webhook call). All DB
// writes use the service-role client.
import {
  validateEvent,
  WebhookVerificationError,
} from "https://esm.sh/@polar-sh/sdk@0.47.1/webhooks?target=denonext";
import { adminClient, planForProduct } from "../_shared/polar.ts";

const webhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET") ?? "";

// The Polar subscription payload (camelCase, as parsed by the SDK).
type PolarSubscription = {
  id: string;
  status: string; // active, trialing, past_due, canceled, revoked, ...
  currentPeriodEnd?: Date | string | null;
  customerId: string;
  productId: string;
  customer?: { externalId?: string | null } | null;
};

async function upsertFromSubscription(
  admin: ReturnType<typeof adminClient>,
  sub: PolarSubscription,
) {
  // externalId is the Supabase user id we set as externalCustomerId at checkout.
  const userId = sub.customer?.externalId ?? null;
  if (!userId) {
    console.error("polar webhook: no externalId for customer", sub.customerId);
    return;
  }
  // canceled/revoked/unpaid subscriptions drop the plan to null so the app gates.
  const active = sub.status === "active" || sub.status === "trialing";
  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null;
  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      polar_customer_id: sub.customerId,
      polar_subscription_id: sub.id,
      plan: active ? planForProduct(sub.productId) : null,
      status: sub.status,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function handler(req: Request): Promise<Response> {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers); // standardwebhooks needs lowercase keys

  let event;
  try {
    event = validateEvent(payload, headers, webhookSecret);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return new Response("invalid signature", { status: 403 });
    }
    console.error("polar webhook parse error", err);
    return new Response("bad request", { status: 400 });
  }

  const admin = adminClient();
  try {
    // subscription.* covers created/active/updated/canceled/revoked/past_due/
    // uncanceled — all carry the full subscription object, so one path handles them.
    if (typeof event.type === "string" && event.type.startsWith("subscription.")) {
      // deno-lint-ignore no-explicit-any
      await upsertFromSubscription(admin, (event as any).data as PolarSubscription);
    }
  } catch (err) {
    console.error("polar webhook handler error", event.type, err);
    return new Response("handler error", { status: 500 });
  }

  // Polar expects a 2xx; 202 acknowledges receipt.
  return new Response(JSON.stringify({ received: true }), {
    status: 202,
    headers: { "Content-Type": "application/json" },
  });
}
