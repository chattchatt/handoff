-- Run this in the Supabase SQL Editor (same place schema.sql was run).
-- Stores one subscription row per user. Reads are owner-scoped via RLS; all
-- writes happen only from the polar-webhook Edge Function using the service-role
-- key, which bypasses RLS — so there is no user-facing insert/update policy.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  polar_customer_id text,
  polar_subscription_id text,
  plan text,                                  -- 'pro' | 'team' | null (none)
  status text,                                -- Polar status: active, trialing, past_due, canceled, revoked, ...
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx
  on public.subscriptions (polar_customer_id);

alter table public.subscriptions enable row level security;

-- Owner may read their own subscription. No insert/update/delete policy: the
-- webhook writes with the service-role key (RLS-exempt), and the browser must
-- never be able to grant itself a plan.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
