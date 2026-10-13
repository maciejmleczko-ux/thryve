# F3: migracja bazy (Supabase) krok po kroku

Dotyczy wersji 4.66.0. Dodaje trzy kolumny. Nic nie kasuje i nie zmienia istniejących danych.

| Tabela | Kolumna | Typ | Po co |
|---|---|---|---|
| `workouts` | `start_date` | `date` | dzień STARTU treningu (`date` zostaje dniem zapisu) |
| `workouts` | `plan_id` | `text` | id planu aktywnego w chwili zapisu (np. `plan_ppl`); puste = bez planu albo stary trening |
| `plans` | `meta` | `jsonb` | źródło, cel, poziom, sprzęt, opis planu |

Plik z SQL: `supabase/migrations/20261013_workouts_plan_meta.sql` (te same instrukcje są w `supabase-schema.sql`).

## 1. Uruchomienie

1. Wejdź na https://supabase.com/dashboard i wybierz projekt Mekkio.
2. Lewe menu: **SQL Editor**, potem **New query**.
3. Wklej całą zawartość `supabase/migrations/20261013_workouts_plan_meta.sql`.
4. Kliknij **Run** (albo Cmd+Enter). Wynik powinien brzmieć `Success. No rows returned`.

Można uruchomić ponownie bez szkody: każda instrukcja ma `if not exists`.

## 2. Sprawdzenie, że kolumny istnieją

W tym samym SQL Editorze uruchom:

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and ((table_name = 'workouts' and column_name in ('start_date', 'plan_id'))
    or (table_name = 'plans' and column_name = 'meta'))
order by table_name, column_name;
```

Oczekiwane 3 wiersze: `plans.meta` (jsonb), `workouts.plan_id` (text), `workouts.start_date` (date).

## 3. Co się dzieje przed i po migracji

**Przed migracją (nowa apka, stara baza).** Apka działa normalnie. Zapis treningów i planów w telefonie jest kompletny (nowe pola są lokalnie). Przy wysyłce do chmury baza odpowie błędem o nieistniejącej kolumnie; apka wtedy wysyła ten sam rekord bez nowych pól i do końca sesji nie próbuje z nimi ponownie. Nic nie jest gubione ani blokowane. Po zamknięciu i otwarciu apki próbuje znowu z nowymi polami. W konsoli (Safari Web Inspector) pojawi się ostrzeżenie `cloud push: brak kolumn 4.66.0 w bazie`.

**Po migracji.** Przy następnym uruchomieniu apki (restart, bo flaga fallbacku żyje tylko w pamięci sesji) rekordy, które mają nowe pola, wypchną się z nimi: plany Mekkio z `meta` (jednorazowo, kilkanaście wierszy) oraz każdy trening zapisany od 4.66.0. Stare treningi (bez `startDate`/`planId`) nie są wysyłane ponownie. Na drugim urządzeniu pobranie przywraca nowe pola do lokalnych danych. Brak kolumn w odpowiedzi nie jest błędem.

Kolejność nie ma znaczenia: migrację można uruchomić przed wydaniem 4.66.0 albo po nim. Bezpieczniej przed.

## 4. Uprawnienia i RLS

Bez zmian. Uprawnienia (`grant`) w tym projekcie są na poziomie tabel (`authenticated`: select/insert/update/delete na `plans` i `workouts`, `service_role`: select na `workouts`), więc nowe kolumny dziedziczą je automatycznie. Polityki RLS są na poziomie wiersza (`owner_id` / `user_id`), więc też obejmują nowe kolumny. Nowe tabele nie powstają, więc nie ma osobnego `grant` do `service_role`.

## 5. Cofnięcie

Nie jest potrzebne do działania, bo apka działa i bez kolumn. Jeśli jednak chcesz je usunąć (traci się zapisany plan i dzień startu w chmurze, lokalne dane w telefonach zostają):

```sql
alter table public.workouts drop column if exists start_date;
alter table public.workouts drop column if exists plan_id;
alter table public.plans    drop column if exists meta;
notify pgrst, 'reload schema';
```

Po usunięciu apka wraca do trybu fallbacku (wysyłka bez nowych pól), więc nic się nie psuje.
