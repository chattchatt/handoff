import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public client values. The publishable/anon key is public by Supabase design —
// Row Level Security (see supabase/schema.sql) is what protects user data.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Browser-only singleton. The client is never created during SSR (no window) and
// is null when env is missing, so the app still builds and runs anonymously.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // SPA/SSR OAuth: persist the session and let supabase-js parse the
        // PKCE / access_token callback from the URL automatically on load.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return client;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
