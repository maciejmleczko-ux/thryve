-- Mekkio — Faza 2 (E0): konta użytkowników, bez modułu trenera.
-- Wklej całość w Supabase → SQL Editor → Run.
-- Bezpieczne do wielokrotnego uruchomienia (IF NOT EXISTS / OR REPLACE wszędzie, gdzie się da).

-- ---------------------------------------------------------------------
-- profiles — 1:1 z auth.users
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- auto-create a profile row the moment someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- plans — odpowiednik trainingPlans[] z localStorage
-- ---------------------------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  local_id text, -- id planu takie, jakie miał w localStorage — do dopasowania przy migracji
  name text not null,
  schedule jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plans_owner_id_idx on public.plans(owner_id);

alter table public.plans enable row level security;

drop policy if exists "plans: owner full access" on public.plans;
create policy "plans: owner full access" on public.plans
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ---------------------------------------------------------------------
-- workouts — odpowiednik workouts[] z localStorage
-- ---------------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_id text, -- id treningu z localStorage — do dopasowania przy migracji / sync
  date date not null,
  duration_min integer,
  exercises jsonb not null default '[]'::jsonb,
  kcal_estimated numeric,
  kcal_user numeric,
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_id_idx on public.workouts(user_id);
create index if not exists workouts_user_date_idx on public.workouts(user_id, date);

alter table public.workouts enable row level security;

drop policy if exists "workouts: owner full access" on public.workouts;
create policy "workouts: owner full access" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- updated_at auto-bump na plans (workouts jest append-only, nie edytujemy)
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- GRANTs — "Automatically expose new tables" było wyłączone przy
-- tworzeniu projektu (celowo), więc rola authenticated nie ma nawet
-- podstawowego dostępu do tabel bez tego. RLS powyżej i tak filtruje
-- WIERSZE (tylko właściciel); to tutaj odblokowuje samą TABELĘ.
-- anon (niezalogowany) świadomie nie dostaje nic.
-- ---------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.plans to authenticated;
grant select, insert, update, delete on public.workouts to authenticated;

-- Gotowe. Reszta (coaching_*, coach_feedback, coach_media) dochodzi
-- dopiero w fazie 3 (moduł trenera) — patrz osobna specyfikacja.
