/**
 * Client-side auth state (HOFF-P3-05).
 *
 * Reads /api/auth/me via react-query. The endpoint returns only a public user
 * projection — never the GitHub access token. Login is a full-page redirect to
 * the OAuth start endpoint; logout posts to the logout endpoint and refreshes.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type AuthMe = {
  loggedIn: boolean;
  user?: { login: string; name: string | null; avatarUrl: string | null };
};

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

async function fetchAuthMe(): Promise<AuthMe> {
  const res = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (!res.ok) return { loggedIn: false };
  return (await res.json()) as AuthMe;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
  });

  return {
    loggedIn: query.data?.loggedIn ?? false,
    user: query.data?.user,
    isLoading: query.isLoading,
    login: () => {
      window.location.href = "/api/auth/github/login";
    },
    logout: () => logout.mutate(),
    loggingOut: logout.isPending,
  };
}
