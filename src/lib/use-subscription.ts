import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type Subscription = {
  plan: "pro" | "team" | null;
  status: string | null;
  currentPeriodEnd: string | null;
};

const NO_SUB: Subscription = { plan: null, status: null, currentPeriodEnd: null };

/**
 * Reads the current user's subscription from the RLS-protected subscriptions
 * table. Returns NO_SUB for anonymous users or while loading. The plan is the
 * source of truth for gating paid features; it is only ever written by the
 * Polar webhook, never by the browser.
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription>(NO_SUB);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;

    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) {
          setSubscription(NO_SUB);
          setReady(true);
        }
        return;
      }
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .maybeSingle();
      if (!active) return;
      setSubscription(
        data
          ? {
              plan: (data.plan as Subscription["plan"]) ?? null,
              status: (data.status as string) ?? null,
              currentPeriodEnd: (data.current_period_end as string) ?? null,
            }
          : NO_SUB,
      );
      setReady(true);
    };

    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isPaid = subscription.status === "active" || subscription.status === "trialing";
  return { subscription, isPaid, ready };
}
