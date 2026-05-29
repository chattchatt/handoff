import { describe, expect, it } from "vitest";

import {
  buildAuthorizeUrl,
  parseCallbackParams,
  readSession,
  signSession,
  toPublicUser,
  type AuthEnv,
  type SessionPayload,
} from "./auth";

const env: AuthEnv = { SESSION_SECRET: "test-secret-key-which-is-long-enough" };

const session: SessionPayload = {
  token: "gho_thisIsASecretTokenValue",
  login: "octocat",
  name: "The Octocat",
  avatarUrl: "https://avatars.example/octocat.png",
};

describe("session cookie sign/read", () => {
  it("round-trips a valid signed session", async () => {
    const signed = await signSession(session, env);
    const read = await readSession(signed, env);
    expect(read).toEqual(session);
  });

  it("rejects a tampered body", async () => {
    const signed = await signSession(session, env);
    const [body, sig] = signed.split(".");
    const tampered = `${body}x.${sig}`;
    expect(await readSession(tampered, env)).toBeNull();
  });

  it("rejects a session signed with a different secret", async () => {
    const signed = await signSession(session, env);
    const other: AuthEnv = { SESSION_SECRET: "a-completely-different-secret-value" };
    expect(await readSession(signed, other)).toBeNull();
  });

  it("returns null for missing or malformed cookies", async () => {
    expect(await readSession(undefined, env)).toBeNull();
    expect(await readSession("", env)).toBeNull();
    expect(await readSession("no-dot-here", env)).toBeNull();
  });
});

describe("public projection", () => {
  it("never exposes the token", () => {
    const pub = toPublicUser(session) as Record<string, unknown>;
    expect(pub).toEqual({
      login: "octocat",
      name: "The Octocat",
      avatarUrl: "https://avatars.example/octocat.png",
    });
    expect("token" in pub).toBe(false);
  });
});

describe("authorize url + callback params", () => {
  it("builds an authorize url with repo scope and state", () => {
    const url = new URL(
      buildAuthorizeUrl("client123", "https://app.example/api/auth/github/callback", "xyz"),
    );
    expect(url.origin + url.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("client123");
    expect(url.searchParams.get("scope")).toBe("repo");
    expect(url.searchParams.get("state")).toBe("xyz");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://app.example/api/auth/github/callback",
    );
  });

  it("validates callback params", () => {
    expect(parseCallbackParams(new URLSearchParams("code=abc&state=def"))).toEqual({
      code: "abc",
      state: "def",
    });
    expect(parseCallbackParams(new URLSearchParams("state=def"))).toBeNull();
    expect(parseCallbackParams(new URLSearchParams("code=abc"))).toBeNull();
  });
});
