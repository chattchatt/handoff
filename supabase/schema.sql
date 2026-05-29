-- Run this in Supabase SQL Editor.
-- Per-account Handoff history, scoped to the authenticated user via Row Level Security.

create table if not exists public.handoffs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text,
  request jsonb,
  response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists handoffs_user_created_idx
  on public.handoffs (user_id, created_at desc);

alter table public.handoffs enable row level security;

drop policy if exists "handoffs_select_own" on public.handoffs;
create policy "handoffs_select_own" on public.handoffs
  for select using (auth.uid() = user_id);

drop policy if exists "handoffs_insert_own" on public.handoffs;
create policy "handoffs_insert_own" on public.handoffs
  for insert with check (auth.uid() = user_id);

drop policy if exists "handoffs_update_own" on public.handoffs;
create policy "handoffs_update_own" on public.handoffs
  for update using (auth.uid() = user_id);

drop policy if exists "handoffs_delete_own" on public.handoffs;
create policy "handoffs_delete_own" on public.handoffs
  for delete using (auth.uid() = user_id);
