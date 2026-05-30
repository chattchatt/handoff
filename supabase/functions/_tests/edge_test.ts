// Offline tests for the Edge Functions' security/validation boundary. These
// exercise the paths that reject BEFORE any Polar/Supabase network call, so
// they run without real credentials. (A real subscription still requires
// deployed functions with live secrets — see docs/POLAR_SETUP.md.)
//
// Run with a valid-format webhook secret so standardwebhooks can construct:
//   POLAR_WEBHOOK_SECRET=whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw \
//   deno test --allow-all --no-check supabase/functions/_tests/edge_test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handler as checkout } from "../create-checkout-session/handler.ts";
import { handler as portal } from "../create-portal-session/handler.ts";
import { handler as webhook } from "../polar-webhook/handler.ts";

const FN_URL = "https://proj.supabase.co/functions/v1/x";

Deno.test("checkout: OPTIONS preflight returns CORS 200", async () => {
  const res = await checkout(new Request(FN_URL, { method: "OPTIONS" }));
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("checkout: non-POST is rejected 405", async () => {
  const res = await checkout(new Request(FN_URL, { method: "GET" }));
  assertEquals(res.status, 405);
  assertEquals((await res.json()).error, "method_not_allowed");
});

Deno.test("checkout: missing Authorization is rejected 401", async () => {
  const res = await checkout(
    new Request(FN_URL, { method: "POST", body: JSON.stringify({ plan: "pro" }) }),
  );
  assertEquals(res.status, 401);
  assertEquals((await res.json()).error, "missing_authorization");
});

Deno.test("portal: non-POST is rejected 405", async () => {
  const res = await portal(new Request(FN_URL, { method: "GET" }));
  assertEquals(res.status, 405);
});

Deno.test("portal: missing Authorization is rejected 401", async () => {
  const res = await portal(new Request(FN_URL, { method: "POST", body: "{}" }));
  assertEquals(res.status, 401);
  assertEquals((await res.json()).error, "missing_authorization");
});

Deno.test("webhook: missing Polar signature headers is rejected 403", async () => {
  const res = await webhook(new Request(FN_URL, { method: "POST", body: "{}" }));
  assertEquals(res.status, 403);
  assertEquals(await res.text(), "invalid signature");
});

Deno.test("webhook: forged signature fails verification 403", async () => {
  const res = await webhook(
    new Request(FN_URL, {
      method: "POST",
      headers: {
        "webhook-id": "msg_123",
        "webhook-timestamp": "1700000000",
        "webhook-signature": "v1,ZGVhZGJlZWY=",
      },
      body: JSON.stringify({ type: "subscription.active", data: { id: "sub_1" } }),
    }),
  );
  assertEquals(res.status, 403);
  assertEquals(await res.text(), "invalid signature");
});
