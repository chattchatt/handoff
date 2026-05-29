import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
};

function deriveUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const asString = (value: unknown): string => (typeof value === "string" ? value : "");
  // GitHub identity fields land in user_metadata: user_name (login), name, avatar_url.
  const login =
    asString(meta.user_name) || asString(meta.preferred_username) || asString(user.email);
  return {
    id: user.id,
    login,
    name: asString(meta.name) || asString(meta.full_name) || login,
    avatarUrl: asString(meta.avatar_url) || asString(meta.picture),
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  // GitHub API token from the OAuth session. Supabase only includes provider_token
  // right after sign-in (it is dropped on a silent token refresh), so we keep the
  // last non-null value and clear it on sign-out. Used to list repos and create
  // issues directly from the browser — no separately pasted PAT.
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(deriveUser(data.session?.user));
      if (data.session?.provider_token) setProviderToken(data.session.provider_token);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
      setUser(deriveUser(session?.user));
      if (session?.provider_token) setProviderToken(session.provider_token);
      if (event === "SIGNED_OUT") setProviderToken(null);
      setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "github",
      // `repo` scope lets the session token create issues in the user's repos
      // (public and private). The user consents to this on the GitHub screen.
      options: { scopes: "repo", redirectTo: window.location.origin + "/app" },
    });
  }, []);

  const logout = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProviderToken(null);
  }, []);

  return {
    loggedIn: Boolean(user),
    user,
    providerToken,
    ready,
    configured: isSupabaseConfigured,
    login,
    logout,
  };
}
