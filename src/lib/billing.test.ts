import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SUPABASE_URL = "https://proj.supabase.co";
const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;

// billing.ts reads import.meta.env.VITE_SUPABASE_URL at module-eval time, so the
// env and the getSupabase mock must be set up BEFORE importing the module.
type SessionResult = { data: { session: { access_token: string } | null } };

async function loadBilling(session: SessionResult["data"]["session"]) {
  vi.resetModules();
  vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
  vi.doMock("@/lib/supabase", () => ({
    getSupabase: () => ({
      auth: { getSession: async (): Promise<SessionResult> => ({ data: { session } }) },
    }),
  }));
  return import("./billing");
}

function mockFetch(response: { ok: boolean; body: unknown }) {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
    return new Response(JSON.stringify(response.body), {
      status: response.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Capture navigation instead of letting jsdom attempt a real one.
function stubNavigation(): { get: () => string } {
  let href = "";
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { href: "", assign: (u: string) => (href = u) },
  });
  Object.defineProperty(window.location, "href", {
    configurable: true,
    get: () => href,
    set: (u: string) => (href = u),
  });
  return { get: () => href };
}

describe("startCheckout", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.doUnmock("@/lib/supabase");
    vi.resetModules();
  });

  it("POSTs to the checkout function with the bearer token and plan, then redirects", async () => {
    const fetchMock = mockFetch({ ok: true, body: { url: "https://buy.polar.sh/abc" } });
    const nav = stubNavigation();
    const { startCheckout } = await loadBilling({ access_token: "tok_123" });

    await startCheckout("pro");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${FUNCTIONS_BASE}/create-checkout-session`);
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer tok_123");
    expect(JSON.parse(init?.body as string)).toEqual({ plan: "pro", returnTo: "/app" });
    expect(nav.get()).toBe("https://buy.polar.sh/abc");
  });

  it("throws not_authenticated when there is no session (no network call)", async () => {
    const fetchMock = mockFetch({ ok: true, body: {} });
    const { startCheckout } = await loadBilling(null);

    await expect(startCheckout("team")).rejects.toThrow("not_authenticated");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces the function error code when the request fails", async () => {
    mockFetch({ ok: false, body: { error: "price_not_configured" } });
    const { startCheckout } = await loadBilling({ access_token: "tok_123" });

    await expect(startCheckout("pro")).rejects.toThrow("price_not_configured");
  });
});
