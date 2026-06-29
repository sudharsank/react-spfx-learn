-- =============================================================
-- Auth Gate — Supabase Setup
-- Run this in the Supabase SQL editor before deploying.
-- =============================================================

-- 1. user_profiles — stores each user's persona per portal
create table if not exists user_profiles (
  user_id    uuid references auth.users(id) on delete cascade not null,
  portal     text not null check (portal in ('react', 'spfx')),
  persona    text not null check (persona in ('spark', 'builder', 'craftsman', 'consultant', 'architect', 'explorer')),
  created_at timestamptz default now(),
  primary key (user_id, portal)
);

alter table user_profiles enable row level security;

create policy "Users read own profile"
  on user_profiles for select using (auth.uid() = user_id);

create policy "Users insert own profile"
  on user_profiles for insert with check (auth.uid() = user_id);

create policy "Users update own profile"
  on user_profiles for update using (auth.uid() = user_id);

-- 2. portal_stats — daily visitor count per portal
create table if not exists portal_stats (
  portal  text not null,
  date    date not null default current_date,
  count   int  not null default 0,
  primary key (portal, date)
);

alter table portal_stats enable row level security;

create policy "Public read portal_stats"
  on portal_stats for select using (true);

-- 3. RPC for safe increment (security definer bypasses RLS)
create or replace function increment_portal_stat(p_portal text)
returns void
language plpgsql
security definer
as $$
begin
  insert into portal_stats (portal, date, count)
  values (p_portal, current_date, 1)
  on conflict (portal, date)
  do update set count = portal_stats.count + 1;
end;
$$;
