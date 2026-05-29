import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HandoffRequest } from "./n8n";

const WEBHOOK_URL = "https://example.n8n.cloud/webhook/handoff";

// n8n.ts reads import.meta.env.VITE_N8N_WEBHOOK_URL at module-eval time, so the env
// must be stubbed BEFORE the module is imported. We therefore import callN8n lazily
// inside each test via a fresh module registry.
async function loadCallN8n() {
  vi.resetModules();
  vi.stubEnv("VITE_N8N_WEBHOOK_URL", WEBHOOK_URL);
  const mod = await import("./n8n");
  return mod.callN8n;
}

/** Capture the RequestInit.body that callN8n hands to fetch. */
function mockFetchCapturingBody(): { getBody: () => unknown } {
  let captured: unknown;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      captured = init?.body;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  return { getBody: () => captured };
}

describe("callN8n", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_N8N_WEBHOOK_URL", WEBHOOK_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends sourceFile as the binary File part (not text) in multipart FormData", async () => {
    const { getBody } = mockFetchCapturingBody();
    const callN8n = await loadCallN8n();

    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
    const file = new File([pdfBytes], "x.pdf", { type: "application/pdf" });

    const request: HandoffRequest = {
      meetingTitle: "Kickoff",
      transcript: "We agreed on scope.",
      deliveryType: "website_brief",
      recipient: "client@acme.com",
      tone: "professional",
      sourceFileName: "x.pdf",
      sourceFile: file,
    };

    await callN8n(request);

    const body = getBody();
    expect(body).toBeInstanceOf(FormData);
    const fd = body as FormData;

    // The "sourceFile" part must be the binary File itself — NOT a string.
    const sourceFilePart = fd.get("sourceFile");
    expect(typeof sourceFilePart).not.toBe("string");
    expect(sourceFilePart).toBeInstanceOf(File);
    const sentFile = sourceFilePart as File;
    expect(sentFile.name).toBe("x.pdf");
    expect(sentFile.type).toBe("application/pdf");
    expect(sentFile.size).toBe(pdfBytes.byteLength);
    // Round-trip the bytes to prove it carries binary content, not a coerced "[object File]".
    expect(new Uint8Array(await sentFile.arrayBuffer())).toEqual(pdfBytes);
  });

  it("includes the text fields alongside the binary part in the FormData", async () => {
    const { getBody } = mockFetchCapturingBody();
    const callN8n = await loadCallN8n();

    const file = new File([new Uint8Array([1, 2, 3])], "x.pdf", {
      type: "application/pdf",
    });

    const request: HandoffRequest = {
      meetingTitle: "Kickoff",
      transcript: "We agreed on scope.",
      deliveryType: "website_brief",
      recipient: "client@acme.com",
      tone: "professional",
      sourceFileName: "x.pdf",
      sourceFile: file,
    };

    await callN8n(request);

    const fd = getBody() as FormData;
    expect(fd).toBeInstanceOf(FormData);

    // Text fields are present as strings.
    expect(fd.get("meetingTitle")).toBe("Kickoff");
    expect(fd.get("transcript")).toBe("We agreed on scope.");
    expect(fd.get("deliveryType")).toBe("website_brief");
    expect(fd.get("recipient")).toBe("client@acme.com");
    expect(fd.get("tone")).toBe("professional");
    expect(fd.get("sourceFileName")).toBe("x.pdf");

    // sourceFile is NOT serialized into the text fields.
    expect(fd.get("meetingTitle")).not.toBeInstanceOf(File);
  });
});
