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
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(deriveUser(session?.user));
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
      options: { redirectTo: window.location.origin + "/app" },
    });
  }, []);

  const logout = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return {
    loggedIn: Boolean(user),
    user,
    ready,
    configured: isSupabaseConfigured,
    login,
    logout,
  };
}
