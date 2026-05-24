-- analytics_cache table
-- Run this once in Supabase SQL Editor
-- Stores: narasi cache (TTL 1hr) — keyed by anon user_id

create table if not exists public.analytics_cache (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  cache_type   text not null,
  payload      jsonb not null,
  agg_snapshot jsonb,
  created_at   timestamptz default now() not null,
  expires_at   timestamptz not null,
  constraint analytics_cache_user_type_unique unique (user_id, cache_type)
);

create index if not exists idx_analytics_cache_lookup
  on public.analytics_cache (user_id, cache_type, expires_at);

alter table public.analytics_cache enable row level security;

create policy "Users manage own cache"
  on public.analytics_cache for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
