-- 4.66.0 (etap F3 "Fundament: dane"): trzy nowe kolumny. Idempotentne, bezpieczne do ponownego uruchomienia.
-- Uruchom raz w Supabase: SQL Editor -> New query -> wklej -> Run. Opis: docs/f3-migracja.md
--
-- workouts.start_date  dzien STARTU treningu (lokalny, RRRR-MM-DD); `date` zostaje dniem zapisu
-- workouts.plan_id     local_id planu aktywnego w chwili zapisu (tekst, np. 'plan_ppl'); null = bez planu / nieznany
-- plans.meta           jsonb: {source:'mekkio'|'own'|'ai'|'import', goal, level, equipment:[], description}
--
-- Uprawnienia i RLS bez zmian: GRANT-y na tabelach (authenticated: pelny CRUD, service_role: select na
-- workouts) obejmuja nowe kolumny automatycznie, a polityki RLS sa na poziomie wiersza (owner_id/user_id).
-- plan_id celowo BEZ klucza obcego: wskazuje local_id (tekst), a plan moze byc pozniej usuniety
-- (wtedy trening zostaje, a klient traktuje plan jako nieznany).

alter table public.workouts add column if not exists start_date date;
alter table public.workouts add column if not exists plan_id text;
alter table public.plans    add column if not exists meta jsonb;

-- Odswiez cache schematu PostgREST, zeby API widzialo kolumny od razu.
notify pgrst, 'reload schema';
