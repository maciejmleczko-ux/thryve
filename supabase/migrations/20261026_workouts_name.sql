-- 4.97.0: własna nazwa treningu (edycja z ekranu treningu w Historii). Idempotentne.
-- Uruchom raz w Supabase: SQL Editor -> New query -> wklej -> Run.
-- workouts.name  tekst; null = nazwa automatyczna (z planu aktywnego przy zapisie). GRANT-y i RLS bez zmian (kolumna dziedziczy).
alter table public.workouts add column if not exists name text;
notify pgrst, 'reload schema';
