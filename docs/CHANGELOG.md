# Mekkio (Thryve): dziennik techniczny

Pełna historia aplikacji od pierwszego commita (2026-08-21) do teraz: każda wersja, data, co się zmieniło i który commit to zrobił. Służy do szybkiego odnalezienia, **kiedy i dlaczego** coś się zmieniło, oraz do cofnięcia zmiany, jeśli coś się zepsuje.

- **Aktualna wersja:** 4.47.21 (2026-09-29)
- **Liczba wersji:** 223 · **commitów:** 552
- Wpisy są ułożone od najnowszego. Nowy wpis dopisuje się na górze sekcji „Dziennik wersji” przy każdym bumpie `APP_VERSION`.

## Spis treści

1. [Jak z tego korzystać](#jak-z-tego-korzystać)
2. [Zasady wersjonowania](#zasady-wersjonowania)
3. [Architektura w skrócie](#architektura-w-skrócie)
4. [Oś czasu: najważniejsze etapy](#oś-czasu-najważniejsze-etapy)
5. [Dziennik wersji](#dziennik-wersji)

---

## Jak z tego korzystać

Każdy wpis ma skrót commita (np. `bdaa94e`). Z nim w terminalu (w folderze `THRYVE`):

```bash
git show bdaa94e
```
Pełny opis commita i dokładny diff: co i dlaczego się zmieniło.

```bash
git log --oneline --grep="Trener AI"
```
Wszystkie commity z danym słowem w opisie.

```bash
git show 4b0796a:index.html > /tmp/index-4.43.1.html
```
Podgląd całej aplikacji w danej wersji, bez ruszania bieżącego kodu.

```bash
git revert bdaa94e
```
Cofnięcie jednego commita nowym commitem. Historia zostaje nietknięta.

Szukanie: `Cmd+F` po nazwie ekranu (GYM, Dashboard, Stats, BUILDER), funkcji (sync, kcal, AI) albo numerze wersji.

**Uwaga o nazwach:** commity do ~4.36 są po angielsku, późniejsze po polsku. Sekcje przemianowano w 4.41.0: GYM → Trening, HISTORY → Dziennik, BUILDER → Kreator, STATS → Postępy. W kodzie i starszych wpisach zostały stare nazwy.

---

## Zasady wersjonowania

`MAJOR.MINOR.PATCH`, numer w stałej `APP_VERSION` w `index.html`. Widać go w panelu konta.

| Część | Kiedy | Wpis „Co nowego” w apce |
|---|---|---|
| MAJOR (x.0.0) | duża nowa funkcja zmieniająca apkę | tak |
| MINOR (4.x.0) | nowa funkcja lub widoczna zmiana UI/UX | tak |
| PATCH (4.44.x) | poprawki, drobne błędy, refaktor | zwykle nie (popup się nie pokazuje) |

Wpisy dla użytkownika (PL + EN) siedzą w obiekcie `CHANGELOG` w `index.html`. Ekran „Historia zmian” w panelu konta pokazuje je wszystkie. Ten dokument jest ich technicznym odpowiednikiem: obejmuje **każdą** wersję, także PATCH, i podaje commity.

Service worker (`sw.js`) działa w trybie network-first, więc nowa wersja dociera bez zmiany `CACHE_NAME` (obecnie `mekkio-cache-v24`). Nazwę cache podbija się tylko przy zmianie samego `sw.js` albo listy plików w cache.

---

## Architektura w skrócie

Stan na 4.44.0.

| Element | Gdzie | Uwagi |
|---|---|---|
| Biblioteki | `vendor/supabase-2.117.2.js` | od 4.47.3 lokalnie zamiast CDN |
| Aplikacja | `index.html` | jeden plik: CSS w `<style>`, JS w `<script>`. PWA na iPhone'a |
| Service worker | `sw.js` | network-first, tylko własna domena, bez cache'owania Supabase |
| Manifest / ikony | `manifest.json`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.png` | |
| Animacja sukcesu | `lottie.min.js`, `success.json` | ekran końca treningu (od 4.11.0) |
| Ikony ćwiczeń | `icons/exercises/` | render 3D od 4.43.0 |
| Polityka prywatności | `polityka-prywatnosci.html` | od 4.40.0 (RODO) |
| Schemat bazy | `supabase-schema.sql` | idempotentny, można puszczać ponownie |
| Edge Functions | `supabase/functions/ai-proxy`, `supabase/functions/delete-account`, `supabase/functions/apple-store-token`, `supabase/functions/_shared/apple.ts` | proxy do Claude, usuwanie konta (unieważnia też token Apple), zapis tokenu Apple po logowaniu; sekrety `APPLE_TEAM_ID`/`APPLE_KEY_ID`/`APPLE_PRIVATE_KEY` |
| Zasady ruchu / animacji | `CLAUDE.md` + tokeny `--m-*` w `:root` | od 4.42.4 |
| Hosting (główny) | Cloudflare Workers (static assets): **app.mekkio.app** | od 2026-09-28; repo `mekkio`, build `sh scripts/build-web.sh` → `dist/` (tylko pliki apki), `wrangler.jsonc` |
| Hosting (lustro) | GitHub Pages: `maciejmleczko-ux.github.io/thryve/` | stare ikony na pulpicie; jeden `git push` idzie do obu repo (`origin` ma dwa push URL). Inny adres = osobny localStorage |

**Dane lokalne (localStorage, prefiks `fitlog_`, sufiks `_v1`):** `workouts`, `runs`, `training_plans`, `starred_plan`, `deleted_builtin_plans`, `custom_exercises`, `exercise_notes`, `exercise_order`, `weight_log`, `body_data`, `avatar`, `kcal_factor`, `profile_name`, `gym_session_draft`, `gym_session_timing`, `gym_today_swaps`, `onboard_seen`, `install_prompt_dismissed`, `last_seen_version`, `workout_reminder` (4.47.8), `health` (4.47.14, Apple Zdrowie: enabled/lastSync), `update_snooze` (4.47.21, `{build, until}`). Wpisy wagi ze Zdrowia mają `src:"health"` (4.47.16). Pola treningu tylko lokalne: `startedAt`, `endedAt`, `kcalWatch`, `kcalWatchSrc`.

**Chmura (Supabase, od 4.35.0):** tabele `profiles` (plus kolumny JSON: `weight_log`, `body_data`, `ai_preferences`, `custom_exercises`, `exercise_notes`; tekst: `avatar`), `plans` (od 4.47.19 z kolumną `periodized`), `workouts`, `ai_usage`, `apple_tokens` (refresh token z Sign in with Apple, tylko `service_role`, klient nigdy nie czyta — do unieważnienia przy usuwaniu konta). RLS włączone na wszystkich. Logowanie: e-mail + hasło, Google, Apple (natywnie w apce iOS od 4.47.2). Tryb gościa działa bez konta. Nie synchronizują się: biegi (`runs`, tylko odczyt, nowych nie da się dodać) i lista usuniętych wbudowanych planów. Ulubione ćwiczenia usunięte w 4.44.1.

---

## Oś czasu: najważniejsze etapy

| Okres | Wersje | Co się wydarzyło |
|---|---|---|
| 21.08 | przed 2.1.1 | Start jako **Thryve**: jeden plik HTML, ekrany GYM / RUNNING / HISTORY / STATS według Figmy v2.0, analityka GoatCounter |
| 22–23.08 | 2.1.1 → 2.6.0 | PWA (manifest, service worker, auto-reload), lokalny profil, popup „Co nowego” i semver, przesuwanie między zakładkami, formularz opinii |
| 24.08 | 2.7.0 → 3.5.0 | Karty do udostępniania, pływające menu (pigułka), **wersja angielska (3.0.0)**, własne ćwiczenia, przeciąganie kafli, pierwsze plany treningowe (beta) |
| 24–26.08 | **4.0.0** → 4.7.1 | **Plany treningowe oficjalnie**: wybór planu na starcie, ulubione, filtr sprzętu, udostępnianie planu kodem, kettlebell, rozgrzewka/rozciąganie, popup logowania serii |
| 27.08–01.09 | 4.7.1 (build 1–128) | Ukryty podgląd **redesignu v3 z Figmy**: Dashboard, GYM v2, Plans v2, edytor planu v2, History v2, Stats v2, nowe menu. Rozwijane jako numerowane buildy w jednej wersji |
| 01.09 | 4.8.0 → 4.10.2 | **Zmiana nazwy na Mekkio**, v3 staje się główną wersją apki, ekran ładowania, ekran końca treningu |
| 02.09 | 4.10.3 → 4.10.40 | Wielkie sprzątanie: tokeny designu (kolory, promienie, typografia, font Geist), usunięcie całego starego UI v2 (etapy L5), tłumaczenia i18n nowych ekranów |
| 02–09.09 | 4.11.0 → 4.17.x | Animacja Lottie po treningu, podsumowania, karta na Instagram, wspólna powłoka bottom sheet `.m-sheet`, zamiana ćwiczenia, notatki, „Powtórz ostatni trening” |
| 09.09 | 4.18.0 → 4.23.x | **Panel konta** (tryb gościa), dziennik wagi, **kalorie na trening** (model tonażowy v2), automatyczna kolejność ćwiczeń, avatar, kopia zapasowa w panelu |
| 10–11.09 | 4.24.0 → 4.34.0 | Statystyki: rekordy e1RM, karuzela wykresów, ring tygodniowy „kometa”, swipe w kalendarzu, animowane menu, **kalistenika**, pominięte dni planu, nowa ikona apki |
| 12–15.09 | 4.35.0 → 4.36.x | **Konta w chmurze (Supabase)** i synchronizacja, logowanie Google, poprawki klawiatury iOS, koniec czerwonego tła GYM/BUILDER |
| 16–17.09 | 4.37.0 → 4.39.x | **Trener AI** (Edge Function → Claude): analiza ostatniego treningu, preferencje, podpowiedzi przy ćwiczeniach |
| 17–21.09 | 4.40.0 → 4.41.x | **RODO**: usuwanie konta, polityka prywatności. Nowe nazwy sekcji. Walka z paskiem iOS 27 |
| 22–24.09 | 4.42.0 → 4.43.0 | **Periodyzacja falująca** w Kreatorze, kolejność antagonistyczna, system ruchu Mekkio + `CLAUDE.md`, sheety nad klawiaturą, **ikony ćwiczeń 3D** |
| 25.09 | 4.43.1 → 4.44.0 | Audyt: sync edycji, XSS, service worker, limit AI. **Sync własnych ćwiczeń i notatek**, scalanie danych gościa przy logowaniu |

---

## Dziennik wersji

Każdy wpis: numer wersji, typ (MAJOR/MINOR/PATCH), daty, opis dla użytkownika (jeśli wersja go ma), lista commitów od najnowszego. Pełne uzasadnienie zmian jest w opisie commita (`git show <hash>`).

<!-- NOWE WPISY DOPISUJ PONIŻEJ TEJ LINII (najnowszy na górze) -->

### 4.47.21 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (funkcja natywna).

- **Okno „Nowa wersja Mekkio” w apce natywnej.** Nowy plik `version.json` (w `dist/` przez `build-web.sh`) trzyma numer najnowszego buildu iOS i link (`itms-beta://testflight.apple.com/join/HUNzwchQ`, po premierze link do App Store). `checkNativeUpdate()` przy starcie (3 s, po ekranie ładowania) i przy powrocie do apki (co najmniej 5 min odstępu) porównuje go z `App.getInfo().build`; plik pobiera przez `CapacitorHttp` (brak CORS dla `capacitor://localhost`). Systemowy alert z `@capacitor/dialog`: „Aktualizuj” otwiera TestFlight, „Później” wycisza ten build na 12 h (`fitlog_update_snooze_v1`). **Zasada:** `version.json` podbijać w pushu PO wgraniu i przetworzeniu buildu, nie wcześniej.

**Commity:**

- `f624075` 2026-09-29 — „Periodyzacja falująca” → „Zmienna intensywność” (4.47.20)
- `310da49` 2026-09-29 — Build 20 (4.47.20)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.20 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (zmiana nazwy).

- Przełącznik „Periodyzacja falująca” w Kreatorze nazywa się teraz **„Zmienna intensywność”** (EN: „Variable intensity”), z prostszym opisem. W kodzie bez zmian (`plan.periodized`, klasy `pev2-periodize-*`). Stare wpisy w „Historii zmian” zostają z dawną nazwą.

**Commity:**

- `442f64f` 2026-09-29 — Periodyzacja falująca synchronizuje się z chmurą (kolumna plans.periodized) (4.47.19, build 19)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.19 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (poprawka).

- **Periodyzacja falująca sama się wyłączała.** Flaga `plan.periodized` nigdy nie trafiała do chmury: `cloudPlanRow()` jej nie wysyłał, tabela `plans` nie miała kolumny, a pull budował plan z wiersza bez niej. Na tym samym urządzeniu ratował ją spread lokalnego planu, ale po wylogowaniu i zalogowaniu albo na drugim urządzeniu (PWA ↔ apka natywna mają osobne dane) plan wracał bez periodyzacji. Nowa kolumna `plans.periodized boolean not null default false` (migracja na produkcji + `supabase-schema.sql`), wysyłana w `cloudPlanRow()` (więc wchodzi też do `planSig` i sam przełącznik oznacza plan do wysłania) i czytana przy pullu. Starsze wersje apki wysyłają upsert bez tej kolumny, więc jej nie zerują.

**Commity:**

- `cd50200` 2026-09-29 — Dymki według Figmy, „Pobierz moje dane” dla zalogowanych, eksport przez arkusz udostępniania, PrivacyInfo, Geist lokalnie (4.47.18, build 18)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.18 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (poprawki wyglądu i apki natywnej).

- **Dymek `toast()` według Figmy 448:5703:** czarne tło, tekst #fdfbff Geist 12 px do lewej, promień 8,65 px, szerokość `min(349px, 100% − 40px)`. Interlinia 1,35 zamiast figmowych 12,12 px, żeby dłuższy komunikat w dwóch liniach był czytelny.
- **Kopia zapasowa zależna od konta:** zalogowany widzi sekcję „Twoje dane” z „Pobierz moje dane” (eksport, RODO art. 20), bez importu; gość bez zmian (kopia + import). `.acct-row[hidden]` naprawione (display:flex nadpisywał `hidden`). Polityka prywatności zaktualizowana.
- **Eksport w apce natywnej:** WKWebView ignorował `<a download>`, a apka i tak pokazywała „Kopia zapasowa pobrana”. Teraz plik idzie przez `@capacitor/filesystem` (katalog cache) do systemowego arkusza udostępniania (`@capacitor/share`).
- **`PrivacyInfo.xcprivacy`** w targecie App: brak śledzenia, FileTimestamp C617.1 (Filesystem nie ma własnego manifestu), zbierane dane zgodne z App Privacy (e-mail, imię, ID, zdrowie, fitness, treści użytkownika; wszystko App Functionality).
- **Geist lokalnie** (`vendor/geist/`, latin + latin-ext, font zmienny 300–900) zamiast Google Fonts: poprawna czcionka offline i w apce natywnej bez żądania sieciowego.

**Commity:**

- `2ff1e40` 2026-09-29 — Kalorie z zegarka: ikona zegarka i etykieta „z zegarka” zamiast „szacunek” (4.47.17, build 17)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.17 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (funkcja natywna).

- **Kalorie z zegarka nie są już podpisane „szacunek”.** Karta treningu w Historii pokazuje ikonę zegarka (nowa ikona `watch` z Phosphora w `PH`) i „z zegarka”; przy ręcznej poprawce przekreślona wartość bazowa to „zegarek N” zamiast „szac. N”. Ekran gratulacji (`refreshGymFinKcal`) po dopasowaniu: „Kalorie · z zegarka” z ikoną. Okno edycji kalorii zmienia podtytuł i zastrzeżenie, gdy trening ma `kcalWatch`.

**Commity:**

- `9f612db` 2026-09-29 — Apple Zdrowie: waga czytana zawsze z 90 dni, wpisy oznaczone src:health (4.47.16, build 16)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.16 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (poprawka funkcji natywnej).

- **Waga ze Zdrowia nie trafiała do dziennika** (test na iPhonie z wagą Xiaomi): kursor `weightSince` przesuwał się do przodu także wtedy, gdy pierwsze zapytanie nic nie zwróciło, więc pomiary z 15/22/24.09 zostały pominięte na stałe. Do tego Xiaomi dosyła pomiary późno i ze starym znacznikiem czasu, czego kursor też nie łapał. Teraz każdy sync czyta całe ostatnie 90 dni; wpisy dodane ze Zdrowia mają `src:"health"` i aktualizują się nowszym pomiarem z tego dnia, a ręczna edycja (`logWeight`) zdejmuje znacznik, więc ręczny wpis dalej wygrywa. `weightSince` usunięte.
- `saveHealthSheet`: błąd przy syncu albo odświeżaniu ekranu nie blokuje już komunikatu po „Zapisz” (wcześniej nie pojawiał się żaden).

**Commity:**

- `c81a38c` 2026-09-29 — Build 15 (4.47.15)
- `2c85091` 2026-09-29 — Linki do polityki w apce natywnej przez in-app Safari; opinie z tematem i Reply-To (4.47.15)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.15 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (poprawki).

- **Linki `target="_blank"` w apce natywnej nic nie robiły** (WKWebView nie otwiera nowych okien) — dotyczyło „Polityka Prywatności” w panelu konta i w oknie logowania. Globalny handler kliknięć (tylko `IS_NATIVE`) otwiera takie linki w in-app Safari (`@capacitor/browser`), adres rozwiązywany względem `https://app.mekkio.app/`.
- **Opinie → support@mekkio.app:** wspólny `feedbackPayload()` dla obu formularzy; `_subject` „Mekkio · {Błąd|Pomysł|Inne} · v{wersja}”, nowe pole `platforma`, a u zalogowanego `email` (Formspree używa go jako Reply-To, więc odpowiedź z Gmaila idzie wprost do użytkownika). Adres docelowy ustawia się w panelu Formspree (formularz `xkjwaqpo`), nie w kodzie.
- Polityka Prywatności: Formspree dopisany do podmiotów przetwarzających.

**Commity:**

- `b546057` 2026-09-29 — Apple Zdrowie: waga i kalorie z zegarka (4.47.14, build 14)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.14 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (funkcja tylko w apce natywnej, w wersji web nic się nie zmienia).

**Apple Zdrowie (HealthKit, tylko odczyt).** Wtyczka `capacitor-health` 8.4.0 (`capPlugin('HealthPlugin')`), entitlement `com.apple.developer.healthkit`, `NSHealthShareUsageDescription` (+ `NSHealthUpdateUsageDescription` „nic nie zapisuje”, na wypadek walidacji binarki). Panel konta → sekcja „Apple Zdrowie” (tylko `IS_NATIVE`) → `#healthSheet` (przełącznik + opis danych, zgoda RODO art. 9, podpowiedź o Garminie/Polarze). `syncHealthData()`:
1. **Waga** → `weightLog`: najnowszy pomiar z każdego dnia, dni wpisane ręcznie wygrywają; przy każdym syncu całe ostatnie 90 dni (od 4.47.16; wpisy ze Zdrowia oznaczone `src:"health"` aktualizują się, ręczne nie). Przez `weight_log` trafia do chmury.
2. **Kalorie z zegarka** → nowe pole `kcalWatch` (+ `kcalWatchSrc`) na treningu z ostatnich 14 dni, dopasowanie po nakładaniu się czasu (≥ 50% krótszego z dwóch) z DOWOLNEGO źródła w Zdrowiu (Apple Watch, Garmin Connect, Polar Flow…). Okno czasowe: nowe `startedAt`/`endedAt` zapisywane w `saveWorkout()`, dla starszych treningów fallback: czas zapisu z `id` minus `durationMin`. Priorytet wyświetlania: `kcalUser` > `kcalWatch` > szacunek; `kcalWatch` uczy też osobisty mnożnik kalorii (`kcalEditRatios`). „Wróć do…” w arkuszu kalorii wraca do odczytu z zegarka, jeśli jest. Pola lokalne, nie w `cloudWorkoutRow`.
3. Uruchamiane: przy starcie, przy powrocie do apki (`visibilitychange`, throttle 60 s) i 10 s po zapisaniu treningu — bo Garmin/Polar docierają do Zdrowia z opóźnieniem. Brak danych = normalny stan (iOS nie mówi, czy odmówiono odczytu).
4. **Nic z tego nie idzie do Trenera AI** (payload `last_workout_summary` nie zawiera kcal ani wagi ciała) — wymóg 5.1.3.

Polityka Prywatności zaktualizowana (29.09): sekcja Apple Zdrowie, podstawa art. 9 ust. 2 lit. a RODO, Apple jako podmiot (logowanie + cofnięcie autoryzacji), Google Workspace do maili. Logika dopasowania sprawdzona w przeglądarce na atrapie wtyczki (Apple Watch, Garmin, brak dopasowania, waga vs wpis ręczny). **Do zrobienia w App Store Connect:** zmienić w notatkach dla recenzenta zdanie „No HealthKit access is requested”.

**Commity:**

- `5b5b280` 2026-09-29 — Usunięcie tymczasowej diagnostyki Apple (4.47.13)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.13 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (sprzątanie po diagnostyce).

**5.1.1(v) potwierdzone na żywo (build 13):** logowanie Apple → wiersz w `apple_tokens` → „Usuń konto” → `delete-account` unieważnił token u Apple (mail od Apple „Aplikacja Mekkio odrzuciła funkcję Zaloguj się, używając konta Apple”, Mekkio zniknęło z „Aplikacje korzystające z Apple ID”), w bazie zero wierszy w `auth.users`/`apple_tokens`/`plans` dla tego konta. Usunięte tymczasowe `appleDebugLog()`, `showAppleDebugLog()` i wiersz „🐞 Debug Apple” z 4.47.10–4.47.11; `storeAppleToken()` przy nieudanym zapisie loguje teraz do konsoli treść odpowiedzi (`{ok:false, reason}`), `await` przed `closeAuthSheet()` zostaje. Klucz `fitlog_apple_debug_v1` może zostać w localStorage testerów builda 12–13 (nieszkodliwy).

**Commity:**

- `4aad8ac` 2026-09-29 — Dialog „Usunąć konto?” nad panelem konta (4.47.12)
- `255044c` 2026-09-29 — Build 13
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.12 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (poprawka warstw).

„Usuń konto” w panelu konta „nic nie robiło”: `mConfirm()` otwierał `#mConfirmOverlay` (`.onboard-overlay`, `z-index:90`) **pod** panelem konta (`.acct-overlay`, `z-index:95`), więc dialog „Usunąć konto?” był niewidoczny. Ten sam rodzaj błędu co toast w 4.47.6. `#mConfirmOverlay{z-index:9650}` — nad arkuszami konta (9600), pod toastem (9700). Przy okazji potwierdzona przyczyna pustego `apple_tokens`: log diagnostyczny z 4.47.11 pokazał `db_upsert_failed` — projekt nie nadaje automatycznie uprawnień DML nowym tabelom, `service_role` nie miał `SELECT/INSERT/UPDATE/DELETE` na `apple_tokens`. Naprawione `GRANT` w bazie i w `supabase-schema.sql` (`b8b550f`); zapis tokenu potwierdzony na żywo (`{"ok":true}`, wiersz w bazie). Tymczasowy „🐞 Debug Apple” zostaje do końca testu usuwania konta.

**Commity:**

- `b8b550f` 2026-09-29 — apple_tokens: GRANT dla service_role
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.11 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (build diagnostyczny, do usunięcia po znalezieniu przyczyny).

Toasty z 4.47.10 nie zadziałały — użytkownik nie zobaczył żadnego, mimo potwierdzonego świeżego logowania (Edge Function logi pokazują zero wywołań `apple-store-token`, ale sam system logów Supabase też nie pokazywał ŻADNEJ aktywności z ostatniej godziny, więc podejrzenie o opóźnienie w logach, nie tylko o brakujące żądanie). Toast mógł zniknąć pod pełnoekranowym dialogiem „Dane innego konta” albo zostać ucięty przez `location.reload()` zanim zdążył się pokazać. Zamiana na trwalszy mechanizm: `appleDebugLog(step, extra)` zapisuje każdy krok (`authorize_ok` z długością `authorizationCode`/`identityToken`, `signin_ok`, `store_start`, `store_no_session`, `store_fetch_done` ze statusem HTTP i treścią odpowiedzi, `store_fetch_threw`, `outer_catch`) do `localStorage` (`fitlog_apple_debug_v1`, ostatnie 12 wpisów) — zapis jest synchroniczny, więc przeżywa reload. Nowy tymczasowy wiersz „🐞 Debug Apple” w panelu konta (`showAppleDebugLog()`) pokazuje log przez `alert()` — blokujący, nie znika sam, nie da się go przegapić ani ubić reloadem.

**Commity:**

- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)
- poprzedni wpis (4.47.10): `02a1f52` 2026-09-29 — Build diagnostyczny: toast pokazujący status zapisu tokenu Apple

### 4.47.10 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (build diagnostyczny, do usunięcia po znalezieniu przyczyny).

`await` z 4.47.9 nie pomógł — logi Edge Functions pokazują **zero** żądań do `apple-store-token` mimo potwierdzonego, świeżego logowania Apple (dialog „Dane innego konta” + `last_sign_in_at` zgodny co do sekundy). Skoro żądanie nigdy nie wychodzi z klienta, podejrzenie pada na `response.authorizationCode` — być może puste przy ponownym uwierzytelnieniu tym samym Apple ID, którego apka już wcześniej używała. Dodane tymczasowe `toast()` (oznaczone `// TYMCZASOWE` w kodzie): brak kodu → komunikat od razu; obecny kod → wynik zapisu (status HTTP + treść odpowiedzi) 2,4 s po zamknięciu arkusza logowania, żeby nie nadpisał się z innym komunikatem. **Do usunięcia w następnej wersji, gdy przyczyna się potwierdzi.**

**Commity:**

- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)
- poprzedni wpis (4.47.9): `682ac1b` 2026-09-29 — Napraw ucinany zapis tokenu Apple przy przeładowaniu

### 4.47.9 · PATCH · 2026-09-29

Bez wpisu „Co nowego” (poprawka niewidocznego błędu z 4.47.7).

Testowe logowanie na buildzie 8 wykazało, że `apple_tokens` zostawało puste mimo poprawnie działającego logowania Apple — `storeAppleToken()` był wywołany jako fire-and-forget (bez `await`), a `signInWithIdToken()`'s zdarzenie `SIGNED_IN` potrafi natychmiast doprowadzić do dialogu „Dane innego konta” (`syncCloudData()`) i `location.reload()` w reakcji na „Zastąp” — przeładowanie strony ucina każde niedokończone żądanie sieciowe, w tym wysyłkę tokenu do `apple-store-token`. `nativeSignInWithApple()` teraz robi `await storeAppleToken(...)` przed `closeAuthSheet()`, więc zapis tokenu (albo jego udokumentowana porażka w logach) kończy się, zanim cokolwiek innego może przeładować stronę. `storeAppleToken()` nadal połyka własne błędy, więc `await` niczego nie blokuje poza opóźnieniem zamknięcia arkusza o czas jednej wymiany z Apple.

**Commity:**

- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)
- poprzedni wpis (4.47.8): `fb44c05` 2026-09-28 — Przypomnienie o treningu — lokalne powiadomienia (guideline 4.2)

### 4.47.8 · PATCH · 2026-09-28

Bez wpisu „Co nowego” (w wersji web nic się nie zmienia — funkcja tylko w apce natywnej).

Druga funkcja natywna pod guideline 4.2 (po haptyce): **przypomnienie o treningu**, lokalne powiadomienie przez `@capacitor/local-notifications`. Panel konta → nowa sekcja „Powiadomienia” (widoczna tylko gdy `IS_NATIVE`, ukryta na web/PWA) → `#reminderSheet` (wzorzec `editKcalSheet`): przełącznik + godzina. Dni bierze z `planActiveDays()` aktywnego planu, mapowane na konwencję iOS (`weekday`, 1 = niedziela). `scheduleWorkoutReminders()` przelicza wszystko od zera (cancel-all + reschedule) przy starcie apki i przy zapisie arkusza — celowo NIE na żywo przy każdej zmianie planu (dużo miejsc mutuje `starredPlanId`/`schedule`; hint w arkuszu mówi, że dni są z obecnego planu). Zgoda systemowa proszona dopiero przy włączeniu przełącznika (`requestPermissions()`); odmowa → toast z odesłaniem do Ustawień. Nowy toggle CSS (`.acct-toggle*`) zgodny z tokenami ruchu: kolor przez `ease`, pozycja gałki przez `var(--m-dur-quick) var(--m-ease)`.

**Commity:**

- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)
- poprzedni wpis (4.47.7): `fbb5177` 2026-09-28 — Unieważnianie Sign in with Apple przy usuwaniu konta (5.1.1(v))

### 4.47.7 · PATCH · 2026-09-28

Bez wpisu „Co nowego” (wymóg App Store, niewidoczny dla użytkownika).

Guideline 5.1.1(v): usuwanie konta musi też unieważniać autoryzację Sign in with Apple, inaczej Mekkio zostaje widoczne w „Apps Using Your Apple ID” mimo skasowanego konta. Nowa tabela `apple_tokens` (`supabase-schema.sql`) — refresh token Apple, bez żadnej policy dla `anon`/`authenticated`, czyta/pisze go wyłącznie `service_role`. `supabase/functions/_shared/apple.ts`: podpisuje świeży ES256 `client_secret` (JWT) do endpointów Apple przy każdym wywołaniu — bez 6-miesięcznej rotacji, w przeciwieństwie do sekretu Supabase; wymaga sekretów `APPLE_TEAM_ID`/`APPLE_KEY_ID`/`APPLE_PRIVATE_KEY` (ten sam klucz `.p8` co provider Apple w Supabase). Nowa funkcja `apple-store-token`: po natywnym logowaniu Apple `nativeSignInWithApple()` wysyła jednorazowy `authorizationCode` (wcześniej odrzucany), funkcja wymienia go u Apple na `refresh_token` i zapisuje w `apple_tokens`. `delete-account`: przed skasowaniem konta odczytuje ten token i woła `POST /auth/revoke` u Apple; błąd niekrytyczny — usunięcie konta (RODO) i tak przechodzi dalej. Całość bez wpływu na konta logujące się e-mailem albo Google. **Wymaga ręcznej konfiguracji w Supabase (sekrety Edge Functions) i weryfikacji na prawdziwym Apple ID przed wysłaniem do App Review — patrz notatka w pamięci projektu.**

**Commity:**

- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)
- poprzedni wpis (4.47.6): `6dba7c3` 2026-09-28 — Napraw niewidoczny toast pod arkuszami konta

### 4.47.6 · PATCH · 2026-09-28

Bez wpisu „Co nowego” (poprawka widoczności).

Toast (`.toast`, potwierdzenia typu „Wysłaliśmy link do resetu hasła”) miał `z-index:50`, a arkusze panelu konta (`#authSheet`, `#weightSheet` itd.) są celowo podniesione na `z-index:9600`. Każdy toast wywołany przy otwartym arkuszu konta renderował się pod nim, więc był niewidoczny — złapane przy teście resetu hasła (4.47.5): po kliknięciu „Zapomniałeś hasła?” nic nie było widać, mimo że mail poszedł. `.toast` → `z-index:9700`. Przy okazji `#newPasswordSheet` (nowy w 4.47.5) dopisany do listy arkuszy z `z-index:9600` — wcześniej pominięty.

**Commity:**

- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)
- poprzedni wpis (4.47.5): `f2ec4a8` 2026-09-28 — Reset hasła: ekran „Nowe hasło” po powrocie z linku, redirectTo

### 4.47.5 · PATCH · 2026-09-28

Bez wpisu „Co nowego” (naprawa resetu hasła).

Reset hasła nigdy nie działał do końca: `requestPasswordReset()` tylko wysyłał maila, a po powrocie z linku nie było żadnego miejsca na nowe hasło. Teraz: `onAuthStateChange` łapie `PASSWORD_RECOVERY` i otwiera `#newPasswordSheet` („NOWE HASŁO”, dwa pola, `submitNewPassword()` → `auth.updateUser({password})`, walidacja min. 6 znaków i zgodności, komunikaty PL, w tym wygasły link). `resetPasswordForEmail` dostaje `redirectTo`: w apce natywnej deep link `app.mekkio://auth-callback` (kod PKCE wymienia istniejący listener `appUrlOpen`), w przeglądarce adres bieżącej strony. Sheet dopisany do `ACCT_SHEETS` i `mSheetDrag`. Wymaga w Supabase: Site URL `https://app.mekkio.app`, w Redirect URLs `https://app.mekkio.app/**` i `app.mekkio://auth-callback`, własny SMTP (od tego zależą też szablony maili z `supabase/email-templates/`).

**Commity:**

- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)
- poprzedni wpis (4.47.4): `4f65903` 2026-09-28 — Szablony maili Supabase w barwach Mekkio + logo do maili, `8a000f6` — Zastrzeżenia zdrowotne przy kaloriach i Trenerze AI

### 4.47.4 · PATCH · 2026-09-28

Bez wpisu „Co nowego” (drobny druk).

Zastrzeżenia zdrowotne pod wymagania App Store (kalorie i porady AI): `.ai-popup-note` pod analizą w oknie Trenera AI, `.acct-hint` pod sekcją „Trener AI” w panelu konta i pod polem kalorii w `#editKcalSheet`. Teksty PL, bez wersji EN (te ekrany jeszcze bez `T_EN`). TestFlight build **1.0 (5)** poszedł bez tych zmian, następny build (6) je zawiera.

**Commity:**

- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)
- poprzedni wpis (4.47.3): `ff14f75` 2026-09-28 — Haptyka: nowy rekord osobno od zwykłego końca, ostrzeżenie przy usuwaniu (build 5)

### 4.47.3 · PATCH · 2026-09-28

Bez wpisu „Co nowego” (drobne poprawki).

- `mConfirm({title,text,ok,cancel,danger})`: własne okno tak/nie (`#mConfirmOverlay`, wzór `.onboard-box`) zamiast `confirm()` przy zmianie konta i usuwaniu konta. W apce natywnej iOS `confirm()` pokazywało angielskie „Cancel/Ok”. Pozostałe `confirm()` (usuwanie planu, wpisu, czyszczenie dni) jeszcze systemowe.
- Nieaktualne teksty „dane tylko na tym urządzeniu”: `onboardNote` (PL+EN) zachęca do konta; `#acctBackupHint` zależy od `cloudSession`.
- supabase-js 2.117.2 w `vendor/` (bajt w bajt jak z jsDelivr, sha384 zgodny z poprzednim SRI), ładowany lokalnie; `build-web.sh` kopiuje `vendor/`.
- `haptic(kind)` przez `@capacitor/haptics` (tylko apka natywna): medium przy pierwszym zapisie ćwiczenia, light przy edycji, success na ekranie końca treningu. TestFlight build **1.0 (4)**.

**Commity:**

- `52a7322` 2026-09-28 — Natywne logowanie Apple i Google w repo (4.47.2)
- `7ca46a1` 2026-09-28 — Polskie okna potwierdzenia konta, aktualne teksty o chmurze, supabase-js lokalnie
- `2e1e6bf` 2026-09-28 — Haptyki w apce natywnej (build 4)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.2 · PATCH · 2026-09-28

Bez wpisu „Co nowego” (w wersji web nic się nie zmienia).

Natywne logowanie w apce iOS (TestFlight build **1.0 (3)**, przetestowane na iPhonie). Apple: systemowe okno przez `@capacitor-community/apple-sign-in`, nonce SHA-256, `signInWithIdToken` (client ID `app.mekkio`). Google: in-app Safari (`@capacitor/browser`) + deep link `app.mekkio://auth-callback` (dodany w Supabase Redirect URLs), klient Supabase w trybie PKCE tylko w apce natywnej, `exchangeCodeForSession` w listenerze `appUrlOpen`. Pluginy przez `Capacitor.Plugins` (`capPlugin()`), bo bez bundlera nie ma `Capacitor.registerPlugin`. Entitlement Sign in with Apple, schemat URL `app.mekkio`. Build 2 miał tymczasowo ukryte przyciski OAuth w apce natywnej (`917518f`), build 3 je przywraca. Do poprawy: okno „dane innego konta” (`confirm()`) ma w apce natywnej angielskie „Cancel/Ok”.

**Commity:**

- `98716d6` 2026-09-28 — Powłoka natywna iOS w repo (4.47.1)
- `917518f` 2026-09-28 — Natywna apka: ukryte logowanie Apple/Google do czasu wersji natywnej (build 2)
- `46364db` 2026-09-28 — Natywne logowanie Apple i Google w apce iOS (build 3)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.1 · PATCH · 2026-09-28

Bez wpisu „Co nowego” (w wersji web nic się nie zmienia).

Powłoka natywna iOS (Capacitor 8, SPM) w `native/`, bundle `app.mekkio`, team `RRFD32759F`. `npm run sync` (w `native/`) buduje `dist/`, kopiuje do `native/www` i synchronizuje projekt Xcode. `IS_NATIVE` (`window.Capacitor`) w `index.html` wyłącza service worker i prompt instalacji (`isStandaloneApp()` zwraca true). Ikona 1024 z `icon-512.png`, splash #FF3300 z wordmarkiem, tło webview #FF3300, tylko iPhone w pionie, `ITSAppUsesNonExemptEncryption=false`. Pierwszy build **1.0 (1)** wysłany do App Store Connect (TestFlight). W apce natywnej działa na razie tylko logowanie e-mailem.

**Commity:**

- `ce7e720` 2026-09-28 — Logowanie przez Apple (4.47.0)
- `0663aca` 2026-09-28 — Powłoka Capacitor 8 (iOS, app.mekkio) w native/
- `93846d4` 2026-09-28 — Natywna apka: ikona, pomarańczowy ekran startowy, podpisywanie
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.47.0 · MINOR · 2026-09-28

**Dla użytkownika (wpis „Co nowego”):**

> **Logowanie przez Apple.** Zalogujesz się teraz przez Apple: jedno dotknięcie i Face ID. Możesz też ukryć swój e-mail. Apple poda nam wtedy losowy adres, a treningi i tak zobaczysz na każdym swoim urządzeniu.

Czarny przycisk „Kontynuuj z Apple” nad Google w `#authSheet` (Apple wymaga co najmniej równej widoczności). `signInWithGoogle()` → `signInWithOAuthProvider(provider)`. Adres przekaźnikowy `@privaterelay.appleid.com` pokazany w panelu konta jako „Ukryty e-mail (Apple)”. Konfiguracja: Services ID `app.mekkio.web` (domena i callback Supabase), klucz `CYPKZ2CHPZ` (.p8 poza repo, `*.p8` w `.gitignore`), Team `RRFD32759F`, Supabase Apple provider z Client IDs `app.mekkio.web,app.mekkio`. **Client secret (JWT z .p8) wygasa 2027-03-30**, trzeba go wygenerować ponownie i podmienić w Supabase. Unieważnianie tokenu Apple przy usuwaniu konta (5.1.1(v)) jeszcze niezrobione, potrzebne przed App Store.

Przy okazji (bez zmiany wersji): hosting przeniesiony na Cloudflare Workers, **app.mekkio.app** (repo `mekkio`, `wrangler.jsonc`, `scripts/build-web.sh`); `mekkio.app` i `www` przekierowują tam 302; `github.io/thryve` zostaje lustrem dla starych ikon; meta tagi podglądu linków wskazują na app.mekkio.app.

**Commity:**

- `32d7823` 2026-09-28 — Skrypt budujący dla Cloudflare Pages (app.mekkio.app)
- `3ebe639` 2026-09-28 — Konfiguracja Cloudflare Workers (static assets) dla app.mekkio.app
- `ab5f1b8` 2026-09-28 — CHANGELOG: hosting na app.mekkio.app + lustro github.io/thryve
- `1827be4` 2026-09-28 — Meta tagi podglądu linków wskazują na app.mekkio.app
- `bdbcbb2` 2026-09-28 — Logowanie przez Apple w arkuszu logowania
- `a920b9f` 2026-09-28 — Zrobione ćwiczenie: ptaszek w rogu + mocniejsze wyszarzenie (4.46.0)
- wpis dodany w commicie z podbiciem wersji (hash w kolejnej wersji)

### 4.46.0 · MINOR · 2026-09-28

**Dla użytkownika (wpis „Co nowego”):**

> **Ptaszek przy zrobionym ćwiczeniu.** Na ekranie GYM zrobione ćwiczenie ma teraz pomarańczowy ptaszek w rogu kafla, a jego ikona i nazwa są mocniej wyszarzone. Od razu widać, co masz już za sobą.

Stan `added` w `buildExerciseTileV2()` (jedyne źródło: siatka GYM, ćwiczenie w bieżącej sesji) nie przyciemnia już całego kafla (`grayscale` + `opacity:.5`), tylko ikonę i etykietę (`opacity:.28`). Białe tło kafla zostaje, więc nie zlewa się z lawendowym panelem. W rogu `.gymv2-tile-done` z `PLAN_EX_CHECK_SVG` (22 px), wybrany wariant D z symulacji. Przy okazji 12 ikon z testu `PNG_ORANGE` wróciło do szarych.

**Commity:**

- `c6f204a` 2026-09-28 — Przywróć szare ikony zamiast testowych pomarańczowych
- wpis dodany w tym samym commicie co zmiana stanu „zrobione” (hash w kolejnej wersji)

### 4.45.2 · PATCH · 2026-09-25

Bez wpisu „Co nowego” (dokończenie podmiany ikon z 4.43.0).

Statystyki (kafle „Progres ćwiczeń”, 40 px) i lista ćwiczeń w Historii (30 px) pokazywały jeszcze stare płaskie SVG. `statsV2ExerciseIconSvg()` → `statsV2ExerciseIconHtml()`: ta sama kolejność co `buildExerciseTileV2()` (PNG z `icons/exercises/`, potem stare SVG, własne ćwiczenie → `own_excercise.png` zamiast `PH.barbell`), plus jawne wymiary `<img>` w obu kontenerach. Zmiana funkcji trafiła przypadkiem już do `f9a9892` (commit z 4.45.1 zrobiony z równoległej sesji), CSS rozmiarów dopiero tutaj.

**Commity (1):**

- `eb63741` 2026-09-25 — Nowe ikony PNG także w Statystykach i Historii (4.45.2)

### 4.45.1 · PATCH · 2026-09-25

**Dla użytkownika (wpis „Co nowego”):**

> Zdjęcie profilowe zapisuje się teraz na koncie, więc po zalogowaniu na innym telefonie zobaczysz je od razu.

Zdjęcie jest trzymane w nowej kolumnie `profiles.avatar` (data URL JPEG 160×160, ~10 KB, limit 200 KB w bazie) i działa jak imię: ostatnia zmiana wygrywa, usunięcie zdjęcia na jednym telefonie usuwa je też na drugim. Apka zapamiętuje, jakie kolumny ma profil w chmurze (`profileCols` w stanie synchronizacji), więc pole dodane w nowszej wersji apki, zanim uruchomiono migrację SQL, zostaje tylko lokalnie zamiast blokować synchronizację wagi i reszty profilu.

**Commity (1):**

- `f9a9892` 2026-09-25 — Synchronizacja zdjęcia profilowego z chmurą (4.45.1) — zawiera też funkcję ikon Statystyk/Historii z 4.45.2

### 4.45.0 · MINOR · 2026-09-25

**Dla użytkownika (wpis „Co nowego”):**

> **Nowa ikona aplikacji i ekran startowy.** Ikona na ekranie głównym i w Safari to teraz znak Mekkio na pomarańczowym tle. Ekran startowy po uruchomieniu dostał ten sam branding — pełny logotyp zamiast starego znaku, bez hasła pod spodem.

**Commity (2):**

- `6238172` 2026-09-25 — Nowa ikona aplikacji + przeprojektowany ekran startowy (Figma 379:8548)
- `9f88790` 2026-09-25 — Test: 12 ikon z akcentem pomarańczowym (PNG_ORANGE)

### 4.44.1 · PATCH · 2026-09-25

Bez wpisu „Co nowego” (zmiana niewidoczna dla użytkownika).

**Commity (2):**

- `b2fef0b` 2026-09-25 — Dodaj dziennik techniczny docs/CHANGELOG.md (wszystkie wersje od 2.1.1) + zasada w CLAUDE.md
- `ecfe0c2` 2026-09-25 — Usuń martwy kod ulubionych ćwiczeń (4.44.1)

### 4.44.0 · MINOR · 2026-09-25

**Dla użytkownika (wpis „Co nowego”):**

> **Ćwiczenia i notatki na koncie.** Własne ćwiczenia i notatki do ćwiczeń zapisują się teraz na koncie, więc zobaczysz je na każdym telefonie, na którym się zalogujesz. Jeśli wcześniej używałeś apki bez konta, po zalogowaniu nic nie przepada: ćwiczenia, notatki, waga i własne plany dołączą do konta.

**Commity (1):**

- `bdaa94e` 2026-09-25 — Sync własnych ćwiczeń i notatek + scalanie przy logowaniu gościa (4.44.0)

### 4.43.1 · PATCH · 2026-09-25

**Dla użytkownika (wpis „Co nowego”):**

> Edycje planów, nowe wpisy wagi, zmiany w profilu i ręczne korekty kalorii zapisują się teraz w chmurze. Wcześniej po ponownym otwarciu apki potrafiły wrócić do starszej wersji.

**Commity (2):**

- `f8691ea` 2026-09-25 — Pierwsze logowanie gościa: scalanie wagi z chmurą po datach zamiast pomijania
- `4b0796a` 2026-09-25 — Poprawki po audycie: sync edycji z chmurą, XSS, SW, limit AI (4.43.1)

### 4.43.0 · MINOR · 2026-09-24

**Dla użytkownika (wpis „Co nowego”):**

> **Nowe ikony ćwiczeń.** Ikony ćwiczeń w BUILDERZE i GYM to teraz renderowane grafiki 3D, nie płaskie linie jak wcześniej — zmiana obejmuje całą bibliotekę, ok. 60 ćwiczeń.

**Commity (4):**

- `ec84824` 2026-09-24 — Odśwież render reverse_pec_deck.png
- `e41ad07` 2026-09-24 — Dopasuj wysokość kafli search/add + napraw wypalone SVG do nowej proporcji
- `4f88387` 2026-09-24 — Ikona 3D dla własnych ćwiczeń (fallback zamiast ph('barbell'))
- `2e659c2` 2026-09-24 — Nowe ikony ćwiczeń: renderowane 3D zamiast płaskich SVG

### 4.42.6 · PATCH · 2026-09-24

**Commity (1):**

- `bbea395` 2026-09-24 — Sheety nad klawiaturą iOS: przypięcie do widocznego obszaru zamiast limitu wysokości

### 4.42.5 · PATCH · 2026-09-23

**Commity (1):**

- `969c4d8` 2026-09-23 — Bump wersji do 4.42.5 (PATCH, bez wpisu w CHANGELOG)

### 4.42.4 · PATCH · 2026-09-23

**Commity (4):**

- `1180383` 2026-09-23 — CLAUDE.md: link do sekcji Motion w Mekkio Design Guide
- `c090fb9` 2026-09-23 — Mekkio motion system: jedno źródło krzywych i czasów animacji
- `e1537ee` 2026-09-23 — Dodaj CLAUDE.md: obowiązkowy wzorzec animacji dla nowych ekranów
- `923b0c2` 2026-09-23 — Bump wersji do 4.42.4 (PATCH, bez wpisu w CHANGELOG)

### 4.42.3 · PATCH · 2026-09-23

**Commity (2):**

- `ff5216f` 2026-09-23 — Sheety: ściąganie w dół za dowolne miejsce panelu, nie tylko za uchwyt
- `5080a66` 2026-09-23 — Bump wersji do 4.42.3 (PATCH, bez wpisu w CHANGELOG)

### 4.42.2 · PATCH · 2026-09-23

**Commity (2):**

- `deabc14` 2026-09-23 — Natywny feeling: działający press na iOS i kaflach, płynne sheety, kulka menu na GPU
- `b6b974f` 2026-09-23 — Bump wersji do 4.42.2 (PATCH, bez wpisu w CHANGELOG)

### 4.42.1 · PATCH · 2026-09-22 → 2026-09-23

**Commity (3):**

- `f281913` 2026-09-23 — Zakładki bez slide'u, tańsze przejścia toastu/kropek/suwaka
- `112bbf8` 2026-09-22 — Dobieraj dynamicznie który wariant zakresu powtórzeń z e-booka pasuje
- `2805917` 2026-09-22 — Bump wersji do 4.42.1 (PATCH, bez wpisu w CHANGELOG)

### 4.42.0 · MINOR · 2026-09-22

**Dla użytkownika (wpis „Co nowego”):**

> **Periodyzacja falująca w Kreatorze.** Nowy przełącznik przy nazwie planu — „Periodyzacja falująca”. Włączony, każde ćwiczenie w dniu rotuje między czterema poziomami intensywności (Max / Objętość / Siła / Gęstość) zamiast trzymać jeden stały zakres powtórzeń. Ćwiczenia złożone w tym samym dniu startują cykl z innego miejsca, więc nie wszystkie wypadają ciężko naraz. W oknie logowania zobaczysz etykietę dzisiejszego poziomu i dopasowaną do niego podpowiedź ciężaru — pierwszy raz na danym poziomie appka szacuje ciężar startowy na podstawie Twoich wyników na innych poziomach.

**Commity (6):**

- `b9025f2` 2026-09-22 — Usuń liczby powtórzeń z czarnej wskazówki periodyzacji
- `5e36f22` 2026-09-22 — Doprecyzuj "1-2 powtórzeń w zapasie" -> "przed upadkiem mięśniowym"
- `c45cd69` 2026-09-22 — Sortuj ad-hoc dodane ćwiczenia w GYM tą samą kolejnością co BUILDER
- `c42bf5d` 2026-09-22 — Ułóż auto-porządkowanie BUILDERA metodą antagonistyczną
- `b57c2a5` 2026-09-22 — Dodaj szacowany ciężar startowy dla nowego poziomu periodyzacji
- `c39ccf9` 2026-09-22 — Dodaj periodyzację falującą (wersje wykonania) do BUILDERA

### 4.41.11 · PATCH · 2026-09-22

**Commity (1):**

- `f7224ef` 2026-09-22 — Rozszerz naprawę powrotu-z-tła: notatka ćwiczenia i przycisk ZAPISZ PLAN

### 4.41.10 · PATCH · 2026-09-22

**Commity (1):**

- `1c80b72` 2026-09-22 — Napraw menu i popup GYM po powrocie z tła, dodaj szkic niezakończonej serii

### 4.41.9 · PATCH · 2026-09-21

**Commity (1):**

- `86518f5` 2026-09-21 — Górny odstęp +5 px pod paskiem statusu (zmienna --top-inset)

### 4.41.8 · PATCH · 2026-09-21

**Commity (1):**

- `629a5c6` 2026-09-21 — Cofnij eksperyment z usunięciem black-translucent (nie usunął paska iOS 27)

### 4.41.7 · PATCH · 2026-09-21

**Commity (1):**

- `b654806` 2026-09-21 — Eksperyment: usuń black-translucent, żeby iOS 27 nie rysował blura nad górą PWA

### 4.41.6 · PATCH · 2026-09-21

**Commity (1):**

- `35fe87b` 2026-09-21 — Usuń skrypt podmieniający theme-color (nie pomógł na jasny pasek iOS 27)

### 4.41.5 · PATCH · 2026-09-21

**Commity (1):**

- `f5851c4` 2026-09-21 — PWA iOS 27: pomarańczowy theme-color na splashu, żeby nie było jasnego paska u góry

### 4.41.4 · PATCH · 2026-09-21

**Commity (1):**

- `17e0354` 2026-09-21 — PWA iOS 27: ciemny theme-color przy otwartym popupie, żeby nie było jasnego paska u góry

### 4.41.3 · PATCH · 2026-09-21

**Commity (1):**

- `5aa5ebc` 2026-09-21 — Postęp tygodniowy: ponad plan liczy się jako np. 3/2, ring robi drugie okrążenie

### 4.41.2 · PATCH · 2026-09-19

**Commity (1):**

- `506c522` 2026-09-19 — Powtórz trening: rozgrzewka na początku i rozciąganie na końcu zawsze

### 4.41.1 · PATCH · 2026-09-19

**Commity (1):**

- `26d368b` 2026-09-19 — Powtórz trening: puste pola serii z podpowiedzią zamiast wpisanych wartości

### 4.41.0 · MINOR · 2026-09-18

**Dla użytkownika (wpis „Co nowego”):**

> Sekcje mają nowe nazwy: GYM to teraz Trening, HISTORY to Dziennik, BUILDER to Kreator, a STATS to Postępy.

**Commity (1):**

- `dc32f21` 2026-09-18 — Zmień nazwy sekcji na czytelniejsze: GYM/HISTORY/BUILDER/STATS -> Trening/Dziennik/Kreator/Postępy

### 4.40.0 · MINOR · 2026-09-17

**Dla użytkownika (wpis „Co nowego”):**

> W panelu konta jest teraz opcja usunięcia konta — kasuje Twoje dane w chmurze (treningi, plany, profil) bezpowrotnie, na wszystkich urządzeniach.

**Commity (2):**

- `62b8e9a` 2026-09-17 — RODO: dodaj Politykę Prywatności
- `31daedf` 2026-09-17 — RODO: dodaj samodzielne usuwanie konta

### 4.39.1 · PATCH · 2026-09-17

**Commity (1):**

- `3950c8a` 2026-09-17 — Napraw zamianę ćwiczenia w Powtórz, zegar treningu i tagi kalisteniki

### 4.39.0 · MINOR · 2026-09-17

**Dla użytkownika (wpis „Co nowego”):**

> **Sugestie Trenera AI przy ćwiczeniach w GYM.** Jeśli Trener AI wskazał dla danego ćwiczenia konkretną wskazówkę na następny trening, zobaczysz ją teraz od razu w oknie logowania serii — fioletowa etykieta „Sugestia Trenera AI” zamiast zwykłej wskazówki. Dla pozostałych ćwiczeń bez zmian.

**Commity (3):**

- `de37e9c` 2026-09-17 — Trener AI popup: usuń tło-kółko za przyciskiem zamknięcia
- `f2036f9` 2026-09-17 — "Co nowego": AI-owe wpisy zawsze na czarnym boxie, rozbite od reszty
- `cd879a2` 2026-09-17 — Bump APP_VERSION to 4.39.0, changelog: sugestie AI w GYM

### 4.38.0 · MINOR · 2026-09-17

**Dla użytkownika (wpis „Co nowego”):**

> **Trener AI: pełny widok i głębsza analiza.** Karta „Trener AI” otwiera teraz pełny widok zamiast rozwijania w miejscu — krótkie podsumowanie treningu, komentarz o ćwiczeniach ze spadkiem sił lub realnym postępem, i czytelna lista konkretnych wskazówek na następny trening, jedna pod drugą. W panelu konta możesz ustawić swój cel treningowy i czego unikać (np. kontuzje) — Trener AI dopasuje sugestie do tego.

**Commity (5):**

- `0c89c01` 2026-09-17 — Dodaj odstęp 14px między ikonką a tekstem "Sugestia Trenera AI"
- `7ddfcce` 2026-09-17 — Wskazówka treningowa: reużyj sugestii Trenera AI, bez nowych wywołań
- `d218f2a` 2026-09-17 — Zwiększ dzienny limit AI z 20 do 25 wywołań
- `1e21958` 2026-09-17 — Napraw: panel Konto przeświecał zza sheeta "Preferencje Trenera AI"
- `2f4078a` 2026-09-17 — Bump APP_VERSION to 4.38.0, changelog: Trener AI update

### 4.37.0 · MINOR · 2026-09-16 → 2026-09-17

**Dla użytkownika (wpis „Co nowego”):**

> **Trener AI na Dashboardzie.** Nowa czarna karta „Trener AI”, zaraz pod podsumowaniem tygodnia. Rozwiń ją, żeby zobaczyć krótkie podsumowanie ostatniego treningu i konkretną sugestię na następny — na przykład ile dorzucić do konkretnego ćwiczenia. Widoczna tylko po zalogowaniu.

**Commity (13):**

- `d38b9e7` 2026-09-17 — Napraw zbędną linię między "Na następny trening" a pierwszym ćwiczeniem
- `55a0f17` 2026-09-17 — Trener AI popup: dopasowanie 1:1 do zaktualizowanego Figma (320:16638)
- `9f0fd93` 2026-09-16 — Trener AI: strukturalny popup — podsumowanie / analiza / lista akcji
- `c2a53b9` 2026-09-16 — Trener AI: 1px ramka wszędzie, poświata -30%, czarna sekcja w koncie
- `28e66e1` 2026-09-16 — Trener AI: rozbudowa pkt 1+2 — trend per ćwiczenie, cele/ograniczenia usera
- `dd78330` 2026-09-16 — Trener AI: przełącz z Haiku na Sonnet 5
- `4efe359` 2026-09-16 — Trener AI popup: usuń kafelki (duplikat Historii), większy font, prostszy język
- `74a6b3c` 2026-09-16 — Trener AI: "pro tip"-owa analiza — balans partii, RPE, fade, 7-dniowy kontekst
- `ff49393` 2026-09-16 — Trener AI: popup zamiast rozwijania w miejscu (mockup)
- `f9b0be1` 2026-09-16 — Zaktualizuj opis w "Co nowego" — ostatni trening, nie ostatni tydzień
- `8862a4d` 2026-09-16 — Trener AI: analiza ostatniego treningu zamiast całego tygodnia
- `a4bdbf5` 2026-09-16 — "Co nowego": karta 4.37.0 w stylu boxa Trener AI, jednorazowo
- `d664300` 2026-09-16 — Bump APP_VERSION to 4.37.0, changelog: Trener AI

### 4.36.3 · PATCH · 2026-09-15 → 2026-09-16

**Commity (9):**

- `abc9e38` 2026-09-16 — Trener AI: 16px padding zawsze, nawet na krótkich telefonach
- `3cb37a6` 2026-09-16 — Fix: zwinięty "Trener AI" czasem blokował scroll do Postępu tygodniowego
- `d1bb6e0` 2026-09-16 — Dashboard scroll: twardy stop bez rubber-bounce, 20px nad menu
- `d38b22e` 2026-09-16 — AI asystent: "Trener AI" akordeon 1:1 z Figmy (node 320:16638)
- `ba7d081` 2026-09-16 — AI asystent: wplecione zasady poprawnej polszczyzny w prompt
- `18b18e7` 2026-09-16 — AI asystent: przenieś kartę wyżej, zmień ton na sugestię treningu
- `7c8ca93` 2026-09-16 — AI asystent Krok 1: czarna karta z narracyjnym podsumowaniem tygodnia
- `5e92cb0` 2026-09-16 — Add AI asystent Krok 0: Edge Function proxy do Anthropic API
- `921133e` 2026-09-15 — Exercise popup: 30px from sheet top to the muscle-group pill

### 4.36.2 · PATCH · 2026-09-15

**Commity (1):**

- `875fcf1` 2026-09-15 — GYM/BUILDER: ZAPISZ TRENING + ZAPISZ PLAN buttons orange, flat

### 4.36.1 · PATCH · 2026-09-15

**Commity (1):**

- `8bd9601` 2026-09-15 — GYM: match plan-card title and EDYTUJ PLAN button to Figma 1:1

### 4.36.0 · MINOR · 2026-09-15

**Dla użytkownika (wpis „Co nowego”):**

> Ekran GYM i kreator planu (BUILDER) nie mają już czerwonego tła pod panelem — teraz są w tym samym liliowym kolorze co reszta apki.

**Commity (2):**

- `d9408bb` 2026-09-15 — BUILDER: drop the red page-bed too, match GYM's lilac panel
- `b78d2c4` 2026-09-15 — GYM: drop the red page-bed, match the app's usual lilac panel color

### 4.35.7 · PATCH · 2026-09-15

**Commity (1):**

- `6aae862` 2026-09-15 — History summary tiles: big numbers to Regular weight

### 4.35.6 · PATCH · 2026-09-15

**Commity (1):**

- `8d7da04` 2026-09-15 — Center the focused Seria card between the top of the screen and the keyboard

### 4.35.5 · PATCH · 2026-09-15

**Commity (1):**

- `e07b9bc` 2026-09-15 — Exercise popup: wider muscle-group pill padding, regular-weight title

### 4.35.4 · PATCH · 2026-09-15

**Commity (1):**

- `a24b00a` 2026-09-15 — Center "Dodaj do treningu" inside .exv2-card — it was hugging the left edge

### 4.35.3 · PATCH · 2026-09-15

**Commity (1):**

- `1b690ec` 2026-09-15 — Fix "Dodaj do treningu" going missing for a beat after closing the keyboard

### 4.35.2 · PATCH · 2026-09-15

**Commity (1):**

- `30afd26` 2026-09-15 — Exercise-logging popup: ride higher, #71747A placeholders, submit button in-flow

### 4.35.1 · PATCH · 2026-09-15

**Commity (2):**

- `0518cd6` 2026-09-15 — Add "Kontynuuj przez Google" sign-in to the auth sheet
- `2695be7` 2026-09-15 — Bump to 4.35.1 (patch — today's cloud-account bug fixes)

### 4.35.0 · MINOR · 2026-09-14 → 2026-09-15

**Dla użytkownika (wpis „Co nowego”):**

> Możesz teraz założyć konto (e-mail + hasło) w panelu konta — Twoje plany, treningi, waga i dane profilu synchronizują się w chmurze. Tryb gościa zostaje, logowanie jest opcjonalne.

**Commity (6):**

- `b0aa4a1` 2026-09-15 — Stop pinning bottom sheets' top to visualViewport — was dragging them upward on Seria 2/3
- `ee9c2e1` 2026-09-15 — Hide the exercise-popup submit button while the iOS keyboard is open
- `b613136` 2026-09-14 — Fix delete not propagating to cloud + a data-loss bug found while testing it
- `6155ba8` 2026-09-15 — Keep bottom sheets from overflowing under the iOS keyboard (needs your phone to confirm)
- `4673bae` 2026-09-14 — Fix: cloud sync was dropping the builtin flag, merging custom plans into "Automatyczne"
- `9067491` 2026-09-14 — Bump to 4.35.0 for the cloud-accounts release

### 4.34.0 · MINOR · 2026-09-11 → 2026-09-14

**Dla użytkownika (wpis „Co nowego”):**

> **Filtr sprzętu to teraz ikony, z animacją menu.** W wyborze ćwiczenia, w BUILDERZE i przy zamianie ćwiczenia w GYM filtr sprzętu pokazuje teraz ikony zamiast napisów — Wszystkie / Hantle / Maszyny / Kettlebell / Kalistenika. Zaznaczenie przesuwa się między nimi tym samym pomarańczowym kółkiem co dolne menu, a nowo wybrana ikonka wskakuje na miejsce z małym obrotem.

**Commity (28):**

- `811235a` 2026-09-14 — Account panel: reflect cloud-sync state in the subtitle/footer copy
- `8d7000d` 2026-09-14 — Cloud account polish: fix login button style, add reminder popup, sync profile data
- `6425faf` 2026-09-14 — Replace one-way migration with real cloud sync (push-unsynced + pull)
- `527e9cd` 2026-09-14 — Add one-time localStorage -> Supabase migration on first cloud login
- `5764d1c` 2026-09-14 — Fix supabase-schema.sql: drop-policy name typo broke re-run idempotency
- `05d8d42` 2026-09-14 — Add Supabase Auth (E0, cloud accounts) — login/signup UI, tested live
- `1321a6e` 2026-09-14 — Onboarding preview: fix text colors to solid #343941 (were muted grey)
- `fe72e76` 2026-09-14 — Onboarding preview: exact gender-chip geometry from Figma (imie/plec/wiek/waga/wzrost now all 1:1)
- `df7b6c3` 2026-09-14 — Onboarding preview: exact ruler/number geometry from the Figma REST API
- `a6aa6e1` 2026-09-12 — Wiek: change age ruler range to 14-80 (was 16-90)
- `6911a87` 2026-09-12 — Fix wzrost overflow + kill Safari's data-detector underline
- `4236034` 2026-09-12 — Bump gym-nav icon size again (46px -> 52px)
- `8c11a42` 2026-09-12 — Bump gym-nav icon size further (36px -> 46px) per Maciej's feedback
- `65d3e38` 2026-09-12 — Bump gym-nav icon size back up; fix ruler snap drift on iOS Safari
- `f52cffa` 2026-09-12 — Fix ruler indicator drift on real devices (all 3 sliders)
- `3f64f26` 2026-09-12 — Onboarding preview: center the progress dots in the topbar
- `e699f74` 2026-09-12 — Onboarding preview: center the wzrost ruler horizontally
- `fd72ed9` 2026-09-12 — Onboarding preview: wzrost ruler rotated 90° from wiek/waga's fixed version
- `c6103e5` 2026-09-12 — Onboarding preview: fix ruler (wiek/waga) per Maciej's screenshot
- `7e09dcd` 2026-09-12 — Onboarding preview: exact typography from Figma (centered, lighter weights)
- `3754350` 2026-09-12 — Add standalone onboarding preview page (imię/płeć/wiek/waga/wzrost)
- `af44fe7` 2026-09-11 — Bottom nav: new GYM icon (Maciej's own SVG)
- `a6a6ee5` 2026-09-11 — Stats: glowing area fill under the YTD volume curve
- `080166b` 2026-09-11 — App icon: new orange mirrored-K mark (favicon, apple-touch-icon, manifest icons)
- `676d12f` 2026-09-11 — Equipment filter: drop the sliding blob, back to a plain color-fade chip
- `11de9da` 2026-09-11 — Equipment filter: tone down the icon animation to a small scale-in
- `5741172` 2026-09-11 — Equipment filter chips: 44px -> 52px, icons 22px -> 26px, matching bottom nav
- `b1616cc` 2026-09-11 — Equipment filter: icon chips with the bottom nav's blob-glide + spin animation (4.34.0)

### 4.33.0 · MINOR · 2026-09-11

**Dla użytkownika (wpis „Co nowego”):**

> **Kalendarz i postęp tygodniowy pokazują zaległości.** Kalendarz w Historii nie kończy się już na dzisiaj — widać cały bieżący miesiąc. Dzień treningowy z planu ma pełny biały obrys, jeśli jest przed nami, i przerywany niebieski, jeśli minął bez wpisu. Zrealizowany trening wypełnia kółko na niebiesko. Ten sam układ dostał widget "Postęp tygodniowy" na Dashboardzie.

**Commity (1):**

- `3596772` 2026-09-11 — Calendar + weekly progress: show missed plan days, not just done/future (4.33.0)

### 4.32.0 · MINOR · 2026-09-11

**Dla użytkownika (wpis „Co nowego”):**

> **Kalistenika w bibliotece ćwiczeń.** 16 nowych ćwiczeń z masą ciała — pompki, podciąganie, przysiady, deska i więcej — z własnymi ikonami. Logowanie serii pokazuje teraz same powtórzenia, bez pola na kilogramy, a Statystyki i ekran podsumowania liczą rekordy i postęp po powtórzeniach zamiast ciężaru.
>
> Filtr sprzętu przy dodawaniu ćwiczenia ma teraz zakładkę „Kalistenika".

**Commity (2):**

- `63f046c` 2026-09-11 — Add "Historia zmian" account panel screen + unify changelog icon
- `2172379` 2026-09-11 — Calisthenics: 16 bodyweight exercises with reps-only logging + stats (4.32.0)

### 4.31.1 · PATCH · 2026-09-10

**Commity (1):**

- `57a088c` 2026-09-10 — Bottom nav: newly-selected icon spins into place alongside the blob glide (4.31.1)

### 4.31.0 · MINOR · 2026-09-10

**Dla użytkownika (wpis „Co nowego”):**

> **Menu na dole płynnie przesuwa zaznaczenie.** Po stuknięciu w zakładkę pomarańczowe kółko nie pojawia się od razu w nowym miejscu — przejeżdża tam z poprzedniej zakładki i dopasowuje rozmiar (kółko GYM jest większe).

**Commity (1):**

- `3623cc6` 2026-09-10 — Bottom nav: one orange indicator that glides + resizes between tabs (4.31.0)

### 4.30.6 · PATCH · 2026-09-10

**Commity (1):**

- `40c0814` 2026-09-10 — Stats carousel: prime the incoming slide before it flies in, no flash-then-replay (4.30.6)

### 4.30.5 · PATCH · 2026-09-10

**Commity (1):**

- `43fbb22` 2026-09-10 — Stats weekly ring: keep the grey comet tail out of the drop shadow (4.30.5)

### 4.30.4 · PATCH · 2026-09-10

**Commity (1):**

- `f0a3a39` 2026-09-10 — Stats weekly ring: head dot lands after the last arc segment, not a fixed 1.1s (4.30.4)

### 4.30.3 · PATCH · 2026-09-10

**Commity (1):**

- `47cd39e` 2026-09-10 — GYM set-logging tick: solid green disc + white check, 22px, centred on the input (4.30.3)

### 4.30.2 · PATCH · 2026-09-10

**Commity (1):**

- `8642cf5` 2026-09-10 — GYM set-logging: dim the placeholder hint + right-side tick per filled set (4.30.2)

### 4.30.1 · PATCH · 2026-09-10

**Commity (1):**

- `603c472` 2026-09-10 — Stats carousel: two-phase accel/decel throw, matching the History calendar (4.30.1)

### 4.30.0 · MINOR · 2026-09-10

**Dla użytkownika (wpis „Co nowego”):**

> **Ikona Historii wraca do dzisiaj.** Kliknięcie ikony Historii w menu zawsze otwiera bieżący miesiąc z zaznaczonym dzisiejszym dniem, nawet gdy wcześniej przewinąłeś kalendarz do innego miesiąca albo roku.
>
> Karuzela wykresów w Statystykach przesuwa się teraz tak jak kalendarz w Historii: karta jedzie za palcem i miękko wyhamowuje na miejscu.

**Commity (1):**

- `1317238` 2026-09-10 — Stats carousel: transform-track drag throw; History icon returns to today (4.30.0)

### 4.29.3 · PATCH · 2026-09-10

**Commity (1):**

- `2055ca1` 2026-09-10 — History: smoother month-change animation — velocity throw, not a fixed cut-off (4.29.3)

### 4.29.2 · PATCH · 2026-09-10

**Commity (1):**

- `79eb89a` 2026-09-10 — History: drag the whole blue calendar card, not just its body (4.29.2)

### 4.29.1 · PATCH · 2026-09-10

**Commity (1):**

- `aee009c` 2026-09-10 — History: the calendar body drags with the finger, not just a post-hoc slide (4.29.1)

### 4.29.0 · MINOR · 2026-09-10

**Dla użytkownika (wpis „Co nowego”):**

> **Przesuwanie miesięcy w Historii.** W Historii zmienisz miesiąc, przesuwając palcem po kalendarzu w lewo lub w prawo. Przewijanie w górę i w dół zostaje bez zmian. Strzałki ‹ › też działają.

**Commity (1):**

- `679e6aa` 2026-09-10 — History: swipe left/right on the calendar to change month (4.29.0)

### 4.28.1 · PATCH · 2026-09-10

**Commity (1):**

- `23cf878` 2026-09-10 — Stats weekly ring: legend "Zrobione" dot uses the comet head colour (4.28.1)

### 4.28.0 · MINOR · 2026-09-10

**Dla użytkownika (wpis „Co nowego”):**

> **Świecąca linia na wykresach.** „Objętość od początku roku” i „Progres ciężaru” w wybranym ćwiczeniu rysują się teraz jak kometa: ogon wtapia się w tło karty, a głowa na ostatnim punkcie jaśnieje do żółci z poświatą. Kropki sesji zostają, każda z cienką obwódką w kolorze karty. Linia rysuje się od ogona do głowy, potem pojawiają się kropki, na końcu wskakują etykiety rekordów.

**Commity (1):**

- `6f27ba2` 2026-09-10 — Stats: comet glowing line on the YTD volume + per-exercise progress charts (4.28.0)

### 4.27.4 · PATCH · 2026-09-10

**Commity (1):**

- `af0db35` 2026-09-10 — Stats weekly ring: over-plan comet flies on continuously past 360° (4.27.4)

### 4.27.3 · PATCH · 2026-09-10

**Commity (1):**

- `db4a6c3` 2026-09-10 — Stats weekly ring: comet starts at 12 o'clock, shadow under the whole comet (4.27.3)

### 4.27.2 · PATCH · 2026-09-10

**Commity (1):**

- `82a04d6` 2026-09-10 — Stats weekly ring: smooth comet gradient, start dot, no mid-ring blob (4.27.2)

### 4.27.1 · PATCH · 2026-09-10

**Commity (1):**

- `8b66948` 2026-09-10 — Stats weekly ring: true angular gradient via arc segments (4.27.1)

### 4.27.0 · MINOR · 2026-09-10

**Dla użytkownika (wpis „Co nowego”):**

> **Pierścień tygodnia jak w zegarku sportowym.** Kiedy nie domykasz planu, pierścień „Postęp tygodniowy” pokazuje kolorowy łuk z przejściem od szarości w pomarańcz i żółć. Kiedy przekroczysz zaplanowaną liczbę treningów, pętla idzie dalej i nachodzi na początek, z delikatnym cieniem. W legendzie zamiast „Zostało” jest wtedy „Ponad plan +N”.

**Commity (1):**

- `3054da4` 2026-09-10 — Stats weekly ring: sports-watch look — gradient arc + overshoot loop (4.27.0)

### 4.26.0 · MINOR · 2026-09-10

**Dla użytkownika (wpis „Co nowego”):**

> **Kalorie uczą się z Twoich poprawek.** Po trzech poprawkach spalonych kalorii aplikacja liczy medianę Twoich korekt i dostraja tym mnożnikiem wszystkie pozostałe szacunki. Cofnięcie poprawek albo zejście poniżej trzech wyłącza dostrajanie. Na ekranie edycji widać, ile poprawek już zebrano i jaki jest mnożnik.
>
> Wykres „Progres ciężaru” rysuje się teraz po kolei: najpierw linia, potem kropki od lewej do prawej, na końcu wskakują etykiety rekordów.

**Commity (1):**

- `1f86998` 2026-09-10 — Calories learn from edits; carousel vertical scroll; chart draw sequence (4.26.0)

### 4.25.1 · PATCH · 2026-09-10

**Commity (1):**

- `30e49e7` 2026-09-10 — Stats carousel: orange YTD panel first, kill the neighbour-card bleed (4.25.1)

### 4.25.0 · MINOR · 2026-09-10

**Dla użytkownika (wpis „Co nowego”):**

> **Statystyki z karuzelą wykresów.** Ekran Statystyki ma teraz karuzelę. Przesuwasz palcem w lewo i prawo między trzema panelami: objętość miesiąc po miesiącu, objętość od początku roku i liczba treningów w miesiącu. Kalorie i masa ciała siedzą nad karuzelą jako dwa stałe kafle ze strzałką trendu w górę albo w dół. Wykresy wjeżdżają z animacją: linia się rysuje, słupki rosną po kolei, kropki pojawiają się na końcu.

**Commity (1):**

- `ae06bb7` 2026-09-10 — Stats: chart carousel + pinned kcards with trend arrows (4.25.0)

### 4.24.2 · PATCH · 2026-09-10

**Commity (1):**

- `812512f` 2026-09-10 — Stats polish: trophy on any record row, dark pills, side-by-side kcards (4.24.2)

### 4.24.1 · PATCH · 2026-09-10

**Commity (1):**

- `8e88964` 2026-09-10 — Stats: yellow dot on every point of the "Progres ciężaru" chart (4.24.1)

### 4.24.0 · MINOR · 2026-09-10

**Dla użytkownika (wpis „Co nowego”):**

> **Nowy sposób liczenia rekordów.** Rekord ćwiczenia liczy się teraz przez szacowany ciężar na jedno powtórzenie (e1RM). Dzięki temu dołożone powtórzenia przy tym samym ciężarze też są progresem, nie tylko wejście na wyższy ciężar. W detalu ćwiczenia w Statystykach masz cztery rekordy: siła, najcięższy ciężar, największa objętość sesji i najdłuższa seria. W historii serii każda sesja pokazuje, który rekord tym razem pobiła.

**Commity (1):**

- `b1e96e9` 2026-09-10 — Stats: exercise records via estimated 1RM + four record types (4.24.0)

### 4.23.2 · PATCH · 2026-09-09

**Commity (1):**

- `e0c5825` 2026-09-09 — GYM: don't start the session clock when loading a repeat (4.23.2)

### 4.23.1 · PATCH · 2026-09-10

**Commity (1):**

- `5aa2964` 2026-09-10 — Plans/History: swipe-left then tap now deletes, not shares (4.23.1)

### 4.23.0 · MINOR · 2026-09-09

**Dla użytkownika (wpis „Co nowego”):**

> **Kopia zapasowa obejmuje całą apkę.** Kopia zapasowa zapisuje teraz też log wagi, dane do kalorii, zdjęcie profilowe, notatki do ćwiczeń i ukryte plany. Wcześniej zostawały tylko na jednym urządzeniu. Zrób świeżą kopię, żeby mieć w niej wszystko.
>
> Poprawka: na krótszych ekranach panel konta bywał ścięty na sekcji „Dane do kalorii”, a wiersze rozjeżdżały się względem karty. Panel przewija się teraz do końca.

**Commity (2):**

- `cf2015f` 2026-09-09 — Account panel: stop flexbox clipping the cards on short screens (4.23.0)
- `8d9ad68` 2026-09-09 — Backup: include weight log, body data, avatar, notes, hidden plans (4.23.0)

### 4.22.1 · PATCH · 2026-09-09

**Commity (1):**

- `86c1bfd` 2026-09-09 — Account panel: clearer backup labels (4.22.1)

### 4.22.0 · MINOR · 2026-09-09

**Dla użytkownika (wpis „Co nowego”):**

> **Kopia zapasowa w panelu konta.** Pobieranie i wgrywanie kopii zapasowej przeniosło się z Historii do panelu konta, do sekcji „Kopia zapasowa”. Nagłówek Historii jest teraz czystszy.

**Commity (1):**

- `e66fd0a` 2026-09-09 — Move backup download/import from History into the account panel (4.22.0)

### 4.21.0 · MINOR · 2026-09-09

**Dla użytkownika (wpis „Co nowego”):**

> **Zdjęcie na avatar.** W panelu konta, w profilu, wgrasz własne zdjęcie. Pokaże się w panelu i na ikonie konta w rogu ekranu. Zdjęcie zostaje na tym urządzeniu, nigdzie go nie wysyłamy. Sam panel dostał też nagłówek jak reszta apki: strzałka wstecz i ikona zamiast krzyżyka.

**Commity (2):**

- `90d5511` 2026-09-09 — Account panel: match the app's motion + polish consistency (4.21.0)
- `2e15522` 2026-09-09 — Account panel: tab-style header + avatar photo upload (4.21.0)

### 4.20.0 · MINOR · 2026-09-09

**Dla użytkownika (wpis „Co nowego”):**

> **Plan układa się sam w dobrej kolejności.** BUILDER pokazuje partie mięśniowe od największych do najmniejszych, a każde dodane ćwiczenie wskakuje na swoje miejsce w dniu: najpierw ciężkie ruchy wielostawowe, potem izolacja, brzuch na końcu. Nie musisz nic sortować, plan wychodzi poukładany w trakcie budowania. Kolejność dalej przestawisz ręcznie w GYM. Plany generowane wychodzą tak samo.

**Commity (9):**

- `e2b041e` 2026-09-09 — Exercise ordering: build in order, drop the sort button (4.20.0)
- `b94f153` 2026-09-09 — Plan editor: title "BUILDER" (English, matches the other topbars) (4.20.0)
- `a31ac5b` 2026-09-09 — Plan editor: title "EDYTOR PLANU" instead of "PLANS" (4.20.0)
- `97cc066` 2026-09-09 — Plan editor topbar: back-arrow + account, matching the tab screens (4.20.0)
- `2b4edb5` 2026-09-09 — Plan editor: drop the account icon from its topbar (4.20.0)
- `f750fa3` 2026-09-09 — Exercise ordering: changelog entry (4.20.0)
- `7a50095` 2026-09-09 — Exercise ordering P4: "Uporządkuj" button in the plan editor (4.20.0)
- `b55a455` 2026-09-09 — Exercise ordering P2+P3: custom-exercise type toggle + generator sort (4.20.0)
- `fa49ff8` 2026-09-09 — Exercise ordering P1: library tags + sort key (4.20.0)

### 4.19.5 · PATCH · 2026-09-09

**Commity (1):**

- `d309eab` 2026-09-09 — Account sub-sheets: more room above the first line (4.19.5)

### 4.19.4 · PATCH · 2026-09-09

**Commity (1):**

- `18ce438` 2026-09-09 — Account sub-sheets: taller and airier (4.19.4)

### 4.19.3 · PATCH · 2026-09-09

**Commity (1):**

- `cce8d82` 2026-09-09 — Account sub-sheets: use the shared bottom-sheet, drop the ad-hoc modal (4.19.3)

### 4.19.2 · PATCH · 2026-09-09

**Commity (1):**

- `1a75eda` 2026-09-09 — Calories flame icon + account entry on every subpage header (4.19.2)

### 4.19.1 · PATCH · 2026-09-09

**Commity (1):**

- `e2e4d1e` 2026-09-09 — Dashboard account icon: +20% (40 -> 48px) (4.19.1)

### 4.19.0 · MINOR · 2026-09-09

**Dla użytkownika (wpis „Co nowego”):**

> **Spalone kalorie na treningu.** Po zapisaniu treningu ekran „Gratulacje” pokazuje szacunek spalonych kalorii, liczony z Twojej masy ciała, objętości i czasu treningu. Jeśli masz dokładniejszy odczyt z zegarka, możesz go poprawić. Masę ciała podajesz w panelu konta, z datą pomiaru. Dzięki temu Statystyki pokazują jej trend, a od teraz mają też nowy kafel z kaloriami.

**Commity (3):**

- `fc60b41` 2026-09-09 — Changelog copy pass (4.18.0 / 4.19.0): human edit + Polish-usage fixes
- `3719f4a` 2026-09-09 — Calorie model v2: tonnage + baseline instead of density-bucketed METs (4.19.0)
- `dbff5a9` 2026-09-09 — Body data + calories (F2–F4): weight log, kcal per workout, Stats tiles (4.19.0)

### 4.18.0 · MINOR · 2026-09-09

**Dla użytkownika (wpis „Co nowego”):**

> **Panel konta.** Ikona w prawym górnym rogu ekranu głównego otwiera nowy panel konta. Logowania jeszcze nie ma, więc działasz jako „Gość”, a kiedy podasz imię, aplikacja przywita Cię nim. W panelu ustawisz albo zmienisz imię, pobierzesz kopię zapasową treningów i wyślesz opinię. Konto w chmurze i synchronizacja między urządzeniami to plany na później.

**Commity (1):**

- `57984fc` 2026-09-09 — Account panel (F1): guest-mode panel behind a new dashboard account icon (4.18.0)

### 4.17.3 · PATCH · 2026-09-09

**Commity (1):**

- `a8614f1` 2026-09-09 — History: disable card swipe-to-delete/share while a workout is expanded (4.17.3)

### 4.17.2 · PATCH · 2026-09-09

**Commity (1):**

- `4498402` 2026-09-09 — GYM rest day: drop the misleading "Ćwiczenia w planie" header + stale draft (4.17.2)

### 4.17.1 · PATCH · 2026-09-08

**Commity (1):**

- `9b5a27c` 2026-09-08 — GYM (#1): "Powtórz" loads the exercise set, not a pre-done workout (4.17.1)

### 4.17.0 · MINOR · 2026-09-08

**Dla użytkownika (wpis „Co nowego”):**

> **Powtórz ostatni trening.** W GYM jest teraz przycisk „Powtórz ostatni trening", nad listą ćwiczeń. Wczytuje ćwiczenia z ostatniego zapisanego treningu z ciężarami i powtórzeniami z tamtego razu — z jednorazowymi zamianami włącznie. Zmieniasz tylko to, co dziś inaczej, i zapisujesz.

**Commity (1):**

- `600fc0f` 2026-09-08 — GYM (#1): "Powtórz ostatni trening" — prefill the session from the last saved workout (4.17.0)

### 4.16.2 · PATCH · 2026-09-08

**Commity (1):**

- `f79a57b` 2026-09-08 — GYM "Zamień ćwiczenie" sheet: tile grid, consistent with "Wybierz ćwiczenie" (4.16.2)

### 4.16.1 · PATCH · 2026-09-08

**Commity (1):**

- `adca522` 2026-09-08 — GYM tile swap icon: drop the white circle, enlarge the glyph (4.16.1)

### 4.16.0 · MINOR · 2026-09-08

**Dla użytkownika (wpis „Co nowego”):**

> **Podsumowanie w historii jak po treningu.** Rozwiń trening w Historii i zobaczysz to samo, co na ekranie „Gratulacje": kartę „Twój postęp", kafle czas / ćwiczenia / serie / objętość i rekord (też objętości). Wszystko policzone tak, jak było w dniu tego treningu.

**Commity (1):**

- `e5a9b39` 2026-09-08 — History: expanded workout card matches the finish screen (4.16.0)

### 4.15.0 · MINOR · 2026-09-08

**Dla użytkownika (wpis „Co nowego”):**

> **Notatki, które wracają.** W GYM możesz zapisać notatkę przy dowolnym ćwiczeniu — ustawienia maszyny, chwyt, cokolwiek chcesz pamiętać. Wróci w panelu logowania serii, gdy następnym razem otworzysz to ćwiczenie.

**Commity (1):**

- `153195f` 2026-09-08 — GYM (#6): sticky per-exercise note in the set-logging sheet (4.15.0)

### 4.14.0 · MINOR · 2026-09-08

**Dla użytkownika (wpis „Co nowego”):**

> **Widać, o ile się poprawiłeś.** Po zapisaniu treningu ekran „Gratulacje" pokazuje kartę z Twoją największą zmianą od ostatniego razu — na przykład +2 powtórzenia w Chest Press przy 40 kg. Doszedł też kafelek „Serie" i rekord objętości ćwiczenia. Z ekranu przeskoczysz od razu do tego treningu w historii.

**Commity (1):**

- `38e7b87` 2026-09-08 — GYM finish screen (#7): "Twój postęp" card + volume record + history link (4.14.0)

### 4.13.0 · MINOR · 2026-09-08

**Dla użytkownika (wpis „Co nowego”):**

> **Trening już nie przepada.** Zamkniesz apkę w trakcie treningu albo ją odświeżysz — wpisane serie czekają na miejscu, kiedy wrócisz do GYM. A serie, których nie wypełnisz, nie trafiają już do historii jako zera.
>
> Zamień ćwiczenie na dziś: przy kaflu w GYM jest ikonka, która pokaże zamienniki na tę samą partię. Zmiana łapie się tylko na dzisiejszy trening, plan zostaje jaki był.
>
> Panele — logowanie serii, dostosowanie planu, dodawanie ćwiczenia, opinia — wjeżdżają teraz od dołu ekranu. Żeby zamknąć, zsuń je palcem w dół.
>
> Import kopii zapasowej pyta wprost: Połącz, Zastąp wszystko albo Anuluj. Wcześniej „Anuluj" i tak nadpisywał dane.
>
> Na pierwszym uruchomieniu okna pokazują się po kolei, nie jedno na drugim. I pierwszy zapisany wynik w statystykach nie udaje już wzrostu.

**Commity (1):**

- `afd7007` 2026-09-08 — GYM: "Zamień ćwiczenie" — swap a plan exercise for today (4.13.0)

### 4.12.7 · PATCH · 2026-09-08

**Commity (3):**

- `bc5fc53` 2026-09-08 — GYM sheet refactor stage 2: fold the plansv2-customize-* family onto .m-sheet
- `a84bf00` 2026-09-08 — GYM sheet refactor stage 1: set-logging popup -> shared .m-sheet bottom sheet
- `b7b0ca7` 2026-09-08 — Fix 6 reported issues: autosave, import cancel, empty sets, first-run dialogs, stats delta, nav a11y (4.12.7)

### 4.12.6 · PATCH · 2026-09-08

**Commity (1):**

- `8856b65` 2026-09-08 — Dashboard: compact only when content really overflows, not by viewport MQ (4.12.6)

### 4.12.5 · PATCH · 2026-09-07

**Commity (1):**

- `422b5ba` 2026-09-07 — Dashboard: fit on short phones (13 mini / SE) so it stops scrolling (4.12.5)

### 4.12.4 · PATCH · 2026-09-03

**Commity (1):**

- `54b92b5` 2026-09-03 — Revert the Ab Crunch photo-tile test (4.12.4)

### 4.12.3 · PATCH · 2026-09-03

**Commity (1):**

- `559473e` 2026-09-03 — TEST: full-bleed photo tile for Ab Crunch (4.12.3)

### 4.12.2 · PATCH · 2026-09-03

**Commity (1):**

- `cdad21e` 2026-09-03 — Share card: fix NOWY REKORD number colliding with the exercise name (4.12.2)

### 4.12.1 · PATCH · 2026-09-03

**Commity (1):**

- `4fc6189` 2026-09-03 — Workout share card: Figma "Instagram story" design, transparent PNG (4.12.1)

### 4.12.0 · MINOR · 2026-09-03

**Dla użytkownika (wpis „Co nowego”):**

> **Podsumowanie w historii.** Rozwijasz trening w Historii i widzisz podsumowanie jak po świeżo zapisanym: objętość, liczba ćwiczeń, powtórzeń, czas. Jak w którymś ćwiczeniu pobiłeś rekord ciężaru, od razu to widać. Każde ćwiczenie na liście ma teraz swoją ikonę.

**Commity (2):**

- `212c0f9` 2026-09-03 — History summary: changelog entry (4.12.0)
- `32e89a3` 2026-09-03 — History: expanded workout card gets the session summary (4.12.0)

### 4.11.7 · PATCH · 2026-09-03

**Commity (1):**

- `ebb295a` 2026-09-03 — Dashboard: "rekord" tile rotates through per-exercise bests (4.11.7)

### 4.11.6 · PATCH · 2026-09-02

**Commity (1):**

- `d047805` 2026-09-02 — Stats v2: exercise-detail progress line draws in too (4.11.6)

### 4.11.5 · PATCH · 2026-09-02

**Commity (1):**

- `1508d26` 2026-09-02 — Stats v2: only the chart line defers to scroll, not the whole card (4.11.5)

### 4.11.4 · PATCH · 2026-09-02

**Commity (1):**

- `ce89b17` 2026-09-02 — Stats v2: reveal trigger later, so below-fold cards don't draw on entry (4.11.4)

### 4.11.3 · PATCH · 2026-09-02

**Commity (1):**

- `d7540b1` 2026-09-02 — Stats v2: entrance animations play on scroll-into-view, once (4.11.3)

### 4.11.2 · PATCH · 2026-09-02

**Commity (1):**

- `5fd5dc8` 2026-09-02 — Stats v2: weekly-progress ring draws in on entry (4.11.2)

### 4.11.1 · PATCH · 2026-09-02

**Commity (1):**

- `0874f1d` 2026-09-02 — History v2: tapping a card shared instead of expanding (4.11.1)

### 4.11.0 · MINOR · 2026-09-02

**Dla użytkownika (wpis „Co nowego”):**

> **Podsumowanie po treningu.** Zapisujesz trening w GYM, a ekran „Gratulacje" pokazuje teraz animację i podsumowanie: czas, objętość, liczbę ćwiczeń i powtórzeń. Jak pobijesz swój rekord w ciężarze, od razu to widać. Na ekran główny wracasz przyciskiem, sam decydujesz kiedy.

**Commity (2):**

- `24283b2` 2026-09-02 — GYM finish: changelog entry + drop dead confetti SVG (4.11.0)
- `86a6d2c` 2026-09-02 — GYM finish: Lottie "success" + session summary (4.11.0)

### 4.10.40 · PATCH · 2026-09-02

**Commity (1):**

- `3dc1b22` 2026-09-02 — Dashboard: anchor the last tile 24px above the menu, more air up top (4.10.40)

### 4.10.39 · PATCH · 2026-09-02

**Commity (1):**

- `856b377` 2026-09-02 — Dashboard bento: equalize tile gaps to 8px, more air under the headline (4.10.39)

### 4.10.38 · PATCH · 2026-09-02

**Commity (1):**

- `1992f02` 2026-09-02 — Dashboard: lift the greeting to sit level with the feedback button (4.10.38)

### 4.10.37 · PATCH · 2026-09-02

**Commity (1):**

- `7ab5572` 2026-09-02 — Subpage back arrow: bigger for thumbs — 40px target, 26px glyph (4.10.37)

### 4.10.36 · PATCH · 2026-09-02

**Commity (1):**

- `1a52095` 2026-09-02 — Stats detail: drop the X, back arrow returns to the overview (4.10.36)

### 4.10.35 · PATCH · 2026-09-02

**Commity (1):**

- `478045b` 2026-09-02 — Subpage headers: feedback button now inline on the top-bar row (4.10.35)

### 4.10.34 · PATCH · 2026-09-02

**Commity (1):**

- `e369f79` 2026-09-02 — Subpage top bars: back arrow + smaller title icon/label (4.10.34)

### 4.10.33 · PATCH · 2026-09-02

**Commity (1):**

- `8af632a` 2026-09-02 — History v2: swipe a workout/run card — left deletes, right shares (4.10.33)

### 4.10.32 · PATCH · 2026-09-02

**Commity (1):**

- `60cc6a1` 2026-09-02 — History v2: month summary never showed; year didn't roll over (4.10.32)

### 4.10.31 · PATCH · 2026-09-02

**Commity (1):**

- `dfa174a` 2026-09-02 — U2 (3/3): i18n for v2 JS renderers (4.10.31)

### 4.10.30 · PATCH · 2026-09-02

**Commity (1):**

- `318b2c8` 2026-09-02 — U2 (2/3): i18n keys for v2 markup — Plans / plan editor / customize (4.10.30)

### 4.10.29 · PATCH · 2026-09-02

**Commity (1):**

- `d3ef111` 2026-09-02 — U2 (1/3): i18n keys for v2 markup — Dashboard / GYM / History (4.10.29)

### 4.10.28 · PATCH · 2026-09-02

**Commity (1):**

- `8b83aa2` 2026-09-02 — L5 step 4h: sweep orphaned CSS + dead #pickExerciseOverlay markup (4.10.28)

### 4.10.27 · PATCH · 2026-09-02

**Commity (1):**

- `2b36b7e` 2026-09-02 — L5 step 4g: drop NAV_ITEMS_PRODUCTION + ROUTE_ORDER, fix static nav (4.10.27)

### 4.10.26 · PATCH · 2026-09-02

**Commity (1):**

- `5d856dd` 2026-09-02 — L5 step 4f: delete #view-gym + old GYM grid/picker/drag/popup/datepicker (4.10.26)

### 4.10.25 · PATCH · 2026-09-02

**Commity (1):**

- `3fc5ce4` 2026-09-02 — L5 step 4e: delete #view-plans/#view-planEditor/#planModal + migrate onboarding (4.10.25)

### 4.10.24 · PATCH · 2026-09-02

**Commity (1):**

- `7fff976` 2026-09-02 — L5 step 4d: delete dead #view-history + old calendar/detail code (4.10.24)

### 4.10.23 · PATCH · 2026-09-02

**Commity (1):**

- `661749b` 2026-09-02 — L5 step 4c: delete dead #view-stats + old Chart.js stats block (4.10.23)

### 4.10.22 · PATCH · 2026-09-02

**Commity (1):**

- `441b06c` 2026-09-02 — L5 step 4b: delete dead #view-running + run-entry code (4.10.22)

### 4.10.21 · PATCH · 2026-09-02

**Commity (1):**

- `43a385c` 2026-09-02 — L5 step 4a: delete dead #view-welcome (4.10.21)

### 4.10.20 · PATCH · 2026-09-02

**Commity (1):**

- `9eb5120` 2026-09-02 — L5 step 3 (History/Stats): guard renderCalendar, fix stale v2 after import (4.10.20)

### 4.10.19 · PATCH · 2026-09-02

**Commity (1):**

- `156b92e` 2026-09-02 — L5 step 2 (Plans): stop rebuilding dead #view-plans DOM on every change (4.10.19)

### 4.10.18 · PATCH · 2026-09-02

**Commity (1):**

- `83be816` 2026-09-02 — L5 step 1 (GYM): stop rebuilding dead #view-gym DOM on every session change (4.10.18)

### 4.10.17 · PATCH · 2026-09-02

**Commity (1):**

- `c4f225f` 2026-09-02 — L3: slide direction between v2 tabs now follows the nav bar (4.10.17)

### 4.10.16 · PATCH · 2026-09-02

**Commity (1):**

- `696a421` 2026-09-02 — L2: remove the dead swipe-between-tabs nav (4.10.16)

### 4.10.15 · PATCH · 2026-09-02

**Commity (1):**

- `bb34672` 2026-09-02 — W8+W9: unify empty-state cards and the lone overshoot easing (4.10.15)

### 4.10.14 · PATCH · 2026-09-02

**Commity (1):**

- `441a00a` 2026-09-02 — Add / "choose other exercise" tiles: match the taller exercise tiles (4.10.14)

### 4.10.13 · PATCH · 2026-09-02

**Commity (1):**

- `2ac0f69` 2026-09-02 — Exercise tiles: taller so 2-3 line names get room, not the icon (4.10.13)

### 4.10.12 · PATCH · 2026-09-02

**Commity (1):**

- `eeeeeae` 2026-09-02 — Dashboard: trim ~32px more so it fits one screen on notched devices (4.10.12)

### 4.10.11 · PATCH · 2026-09-02

**Commity (1):**

- `ce8c949` 2026-09-02 — Dashboard: bigger plan name, reclaim vertical space so it fits one screen (4.10.11)

### 4.10.10 · PATCH · 2026-09-02

**Commity (1):**

- `e4e7987` 2026-09-02 — W3: type scale as tokens — map every font-size to --m-fs-* (4.10.10)

### 4.10.9 · PATCH · 2026-09-02

**Commity (1):**

- `cd11ca0` 2026-09-02 — Make Geist the whole-app font (4.10.9)

### 4.10.8 · PATCH · 2026-09-02

**Commity (1):**

- `40caf21` 2026-09-02 — W5: de-duplicate the copy-pasted per-screen v2 CSS (4.10.8)

### 4.10.7 · PATCH · 2026-09-02

**Commity (1):**

- `c4321e5` 2026-09-02 — W4: one spec for section labels and card eyebrows (4.10.7)

### 4.10.6 · PATCH · 2026-09-02

**Commity (1):**

- `3fd3aa6` 2026-09-02 — W7: three radius tokens (4.10.6)

### 4.10.5 · PATCH · 2026-09-02

**Commity (1):**

- `5e14150` 2026-09-02 — W1: Mekkio design tokens for colour (4.10.5)

### 4.10.4 · PATCH · 2026-09-02

**Commity (1):**

- `fe66f27` 2026-09-02 — Install prompt: tell in-app-browser users to open in a real browser (4.10.4)

### 4.10.3 · PATCH · 2026-09-02

**Commity (1):**

- `2aa1d07` 2026-09-02 — Fix Plans v2 scroll-lock measured mid-animation (4.10.3)

### 4.10.2 · PATCH · 2026-09-01

**Commity (1):**

- `d9e5c9e` 2026-09-01 — Remove the dead triple-tap-logo gesture (4.10.2)

### 4.10.1 · PATCH · 2026-09-01

**Commity (1):**

- `8575d86` 2026-09-01 — Finish the Thryve -> Mekkio rename across every user-facing string (4.10.1)

### 4.10.0 · MINOR · 2026-09-01

**Dla użytkownika (wpis „Co nowego”):**

> **Ekran po zapisanym treningu.** Zapisujesz trening w GYM i na chwilę pokazuje się ekran „Gratulacje – trening zapisany", zanim wrócisz na ekran główny.

**Commity (1):**

- `a2082ac` 2026-09-01 — GYM finish screen after a saved workout, 1.5s then Dashboard (4.10.0)

### 4.9.2 · PATCH · 2026-09-01

**Commity (1):**

- `447ce96` 2026-09-01 — v2 cleanup: gym edit-plan -> v2 editor, drop Plans X, fix History import/export icons (4.9.2)

### 4.9.1 · PATCH · 2026-09-01

**Commity (1):**

- `1e11093` 2026-09-01 — Fix dashboard scroll-lock flicker + weekly progress ignoring today's workout (4.9.1)

### 4.9.0 · MINOR · 2026-09-01

**Dla użytkownika (wpis „Co nowego”):**

> **Nowy wygląd Mekkio.** Cała aplikacja ma nowy wygląd — inne kolory, inna czcionka, przerobiony ekran główny, GYM, plany, historia i statystyki. Przy każdym otwarciu na chwilę pokaże się ekran startowy z logo. Twoje treningi, plany i historia zostają bez zmian.

**Commity (1):**

- `3693bd3` 2026-09-01 — Bump APP_VERSION 4.8.0 -> 4.9.0 + "Co nowego" entry for the new look

### 4.8.0 · MINOR · 2026-09-01

**Dla użytkownika (wpis „Co nowego”):**

> **Zmieniamy nazwę na Mekkio.** Thryve staje się Mekkio. Ikona na ekranie głównym zaktualizuje się sama, ale z opóźnieniem — telefony trzymają stare ikony w pamięci nawet kilka dni po aktualizacji. Jeśli przez chwilę zobaczysz jeszcze stare logo, nic się nie psuje — po prostu jeszcze się nie podmieniło.

**Commity (7):**

- `2365433` 2026-09-01 — Animate the Mekkio splash: logo slides up + fades in, tagline/footer follow
- `f551063` 2026-09-01 — Show the Mekkio load screen on every launch (~1.5s), drop Dashboard version label
- `c98e0f9` 2026-09-01 — Version label: bottom-right corner, name-based ("Mekkio v4.8.0")
- `fd916b9` 2026-09-01 — Make the v3 "Mekkio" layout the main app layout (build 131)
- `f915aab` 2026-09-01 — Swap app icon to new Mekkio design from Figma (node 185:13910)
- `82cc641` 2026-09-01 — Redesign "Co nowego" popup from Figma, 2s pause before Dashboard after save (build 130)
- `c9f8062` 2026-09-01 — Safari orange fallback, icon-change notice, load screen coverage, Stats animations (build 129)

### 4.7.1 · PATCH · 2026-08-26 → 2026-09-01

**Commity (144):**

- `bd5ec17` 2026-09-01 — Add v3 load screen from Figma, shown every preview entry for 2s (build 128)
- `4299a03` 2026-09-01 — Fix invisible chart lines on real iOS Safari + delta text color (build 127)
- `f373ec1` 2026-09-01 — Add month summary card to History v2 when no day is selected (build 126)
- `9e7a24e` 2026-09-01 — Fix PR/record chart dots rendering as ovals, not circles (build 125)
- `4a2efc0` 2026-09-01 — Match Progres ciężaru chart spacing to Figma reference (build 124)
- `6d45138` 2026-09-01 — Fix blank weight-progress chart for exercises with no recent sessions (build 123)
- `d9a9443` 2026-09-01 — Stats v2 spacing pass: 24px around exercise row, tighten chart-to-label (build 122)
- `bb70e5f` 2026-09-01 — Default Stats v2 weight-progress chart to the 1-month view (build 121)
- `e422e62` 2026-09-01 — Fill in missing exercise icons, merge Leg Press duplicate, white tiles (build 120)
- `29b51e0` 2026-09-01 — Add rolling 1-month range to Stats v2 weight-progress chart (build 119)
- `8e20052` 2026-09-01 — Fix 5 Stats v2 issues: bg color, icons, centering, arrow, chart (build 118)
- `948e1e4` 2026-09-01 — Add Stats v2 detail close button + consistency pass (build 117)
- `d31bbc7` 2026-09-01 — Fix oversized trophy/arrow icons in Stats v2 detail (build 116)
- `0e94b81` 2026-09-01 — Add Stats v2 from Figma nodes 182:12264 + 183:13393 (build 115)
- `232c56d` 2026-09-01 — Fix workout duration collapsing to 1 minute (build 114)
- `befd508` 2026-09-01 — Fix History header proportions + correct nav opacity direction (build 113)
- `a966d18` 2026-09-01 — Fix History v2 close-X and nav transparency (build 112)
- `b1037fa` 2026-09-01 — Add History v2 from Figma node 177:10060 (build 111)
- `e21e740` 2026-09-01 — Fix Plans nav icon rendering stretched/oversized (build 110)
- `c620af7` 2026-09-01 — Match v3 bottom nav exactly to Maciej's SVG spec (build 109)
- `13262b2` 2026-09-01 — New dashboard hero metric + v3-only nav (Running out, Plans in) — build 108
- `f6626b3` 2026-09-01 — Add v2 "Podziel się opinią" popup from Figma node 175:9818 (build 107)
- `4a4cd10` 2026-09-01 — Unify the close (X) icon to 24px across all v3 popups (build 106)
- `712c220` 2026-09-01 — Bring the exercise set-logging popup's margins/motion in line with v3 (build 105)
- `96c9134` 2026-09-01 — Restore the picker's top margin — reserve fab space from the card's budget (build 104)
- `ecce447` 2026-09-01 — Fix DODAJ overlapping the card in the exercise picker (build 103)
- `a9f1700` 2026-09-01 — Move floating DODAJ to the exercise picker, not the add-exercise popup (build 102)
- `41372b1` 2026-09-01 — "DODAJ" floats outside the card in the new-exercise popup (build 101)
- `53a4013` 2026-09-01 — Revert top squeeze, fix real side margins on wider phones (build 100)
- `aaf75c2` 2026-09-01 — 10px popup margins on all 3 v3 modals (build 99)
- `4c9f13b` 2026-09-01 — Shrink picker icons further for 3-line labels (build 98)
- `4000520` 2026-09-01 — Fix oversized exercise icons in the search picker (build 97)
- `97fa946` 2026-09-01 — Rebuild exercise picker from Figma, verify full library coverage (build 96)
- `77039b0` 2026-09-01 — GYM v2's own "Dodaj ćwiczenie" tile now uses the exact baked SVG too (build 95)
- `92f9999` 2026-09-01 — Use Maciej's exact "Wybierz inne ćwiczenie" tile SVG (build 94)
- `880a7c0` 2026-09-01 — "Wybierz inne ćwiczenie" tile + picker in GYM v2 (build 93)
- `4c95deb` 2026-09-01 — Fix icon overlap, drop spinner arrows, remove Własne, all-caps (build 92)
- `181f50c` 2026-09-01 — Rebuild "Dodaj ćwiczenie" from Maciej's own Figma design (build 91)
- `b931a3e` 2026-09-01 — v3-styled "Dodaj własne ćwiczenie" popup + a real GYM v2 bug fix (build 90)
- `23565df` 2026-08-31 — GYM v2's "Zapisz trening" now matches "Zapisz plan" (build 89)
- `78452ce` 2026-08-31 — Drop border on collapsed muscle-group sections (build 88)
- `0de8e4e` 2026-08-31 — Drop redundant top save pill, add entrance animation (build 87)
- `fd59dfe` 2026-08-31 — Cut the red gap under plan editor v2's card further (build 86)
- `1eb0740` 2026-08-31 — Plain ring for picked days, "Zaznacz dni" moved inline (build 85)
- `91bef85` 2026-08-31 — Contain the day-select toolbar as one card in plan editor v2 (build 84)
- `483df52` 2026-08-31 — Shrink red gap under plan editor v2's card (build 83)
- `f351394` 2026-08-31 — Red page background behind plan editor v2's card (build 82)
- `5f2ea0a` 2026-08-31 — Fix collapsed section color + scroll lockup in plan editor v2 (build 81)
- `b1f08a9` 2026-08-31 — New Plan Editor v2 screen + typography unification pass (build 80)
- `4e84bf8` 2026-08-31 — Allow Dostosuj on PPL / Upper-Lower split plans (build 79)
- `190b443` 2026-08-31 — Brighten swipe-to-delete color so it doesn't blend with hard-difficulty cards (build 78)
- `c56d3e1` 2026-08-31 — Rebuild "Dostosuj plan" modal to match Figma node 153:701 (build 77)
- `ea5b0b7` 2026-08-31 — Remove the redundant share icon from Plans v2 cards (build 76)
- `3561618` 2026-08-31 — Swap the "Dostosuj plan" icon for Maciej's new equalizer design (build 75)
- `72a8aec` 2026-08-31 — Add per-section "add your own exercise" tile to the old grouped grid (build 74)
- `90542de` 2026-08-31 — Show the full plan name on the Dashboard's plan tile (build 73)
- `0469803` 2026-08-30 — Replace Trudność/Dni w tygodniu chips with sliders (build 72)
- `2c0445a` 2026-08-30 — Star checkmark now matches its own card color, not always navy blue (build 71)
- `2b15c25` 2026-08-29 — Simplify copy button to a plain static "Kopiuj dni" (build 70)
- `b9916d0` 2026-08-29 — Fix wrong grammatical case on "Kopiuj ... tu" button (build 69)
- `942aeed` 2026-08-29 — Fix copy source silently picking an empty day on a fresh editor visit (build 68)
- `3986be9` 2026-08-29 — Replace copy/clear-days modals with one inline selection mode (build 67)
- `658accc` 2026-08-29 — Add "Usuń z dni" — bulk-clear training days in the plan editor (build 66)
- `9a8cfd2` 2026-08-29 — Remove rest-day concept entirely — plan content decides, nothing else (build 65)
- `80d88a4` 2026-08-29 — Fix DASH_BUILD counter — got dropped from the build 63 commit (build 64)
- `4a277c9` 2026-08-29 — Revert build 62 — restore rest-day message + explicit train button (build 63)
- `55dfc38` 2026-08-29 — Drop rest-day gating entirely — just show the grid (build 62)
- `ff37af2` 2026-08-29 — Add "Trenuj dziś mimo to" — train on a rest day (build 61)
- `aec636d` 2026-08-29 — Fix confusing "0 exercises" on GYM v2 rest days (build 60)
- `f4d5191` 2026-08-29 — Add swipe-right-to-share on plan cards (build 59)
- `315903c` 2026-08-29 — Redesign "Dostosuj plan" popup to match the exercise-logging popup (build 58)
- `411ae39` 2026-08-29 — Fork automatic plans on edit instead of mutating them in place (build 57)
- `a54e1e2` 2026-08-29 — Permanently protect hand-edited builtin plans from future resets (build 56)
- `9771c67` 2026-08-29 — Consolidate Fullbody 1/2 into one plan (build 55)
- `3fbd7b4` 2026-08-29 — Add weekly-frequency option to plan customization (build 54)
- `852f93b` 2026-08-29 — Add per-plan customization to PLANS v2 (build 53)
- `08fdaf0` 2026-08-28 — Swap plan-star icons to Maciej's own consistent pair (build 52)
- `b458d7d` 2026-08-28 — Full swipe deletes the plan outright, two-stage like iOS Mail (build 51)
- `9714206` 2026-08-28 — Allow deleting builtin plans too; swap delete label for a large trash icon (build 50)
- `e40bf14` 2026-08-28 — Fix swipe-to-delete not working on iOS — use touch events (build 49)
- `69a8ea3` 2026-08-28 — Add swipe-to-delete for custom/imported plans in Plans v2 (build 48)
- `2f3df01` 2026-08-28 — Plan card exercise count/duration/difficulty per session, not per week (build 47)
- `1d5087d` 2026-08-28 — Apply Dashboard's scroll-lock/rubber-band/light-bg pattern to Plans v2 (build 46)
- `fb30b54` 2026-08-28 — Dashboard's plan tile now opens Plans v2 too, matching GYM v2 (build 45)
- `23a6b0e` 2026-08-28 — Plan card color now keyed by difficulty, not list position (build 44)
- `15b9b26` 2026-08-28 — Make GYM v2's plan card a persistent entry point into Plans v2 (build 43)
- `27c0407` 2026-08-28 — Build PLANS v2 screen (build 42, Figma node 116:2502)
- `f6da456` 2026-08-28 — Swap in Maciej's own wording for congrats line #5 (build 41)
- `933fada` 2026-08-28 — Fix awkward-sounding congrats line #5 (build 40)
- `0469adf` 2026-08-28 — Only grant dashboard scroll/bounce capability when content actually overflows (build 39)
- `a2d253d` 2026-08-28 — Dashboard overscroll: rubber-band bounce instead of persisting scroll, light bg everywhere (build 38)
- `d014a02` 2026-08-28 — Swap flame icon for clock-countdown on the activity-minutes badge (build 37)
- `c46a603` 2026-08-27 — Shorten dashboard headline copy to fit 2 lines instead of 3 (build 36)
- `b06fa4a` 2026-08-27 — Widen dashboard headline text block, tighten gap before hero card (build 35)
- `c12e198` 2026-08-27 — Fix week-progress card getting permanently clipped behind the nav (build 34)
- `cd5ad58` 2026-08-27 — Fold real GYM workout duration into weekly 'min aktywności' (build 33)
- `11e125c` 2026-08-27 — Add cascading entrance animation inside the set-logging popup (build 32)
- `8a778e8` 2026-08-27 — Series-card label moved beside fields per new Figma (build 31)
- `41b261f` 2026-08-27 — Match set-logging popup to updated Figma spec 1:1 (build 30)
- `6cda352` 2026-08-27 — Tighten set-logging popup so 4-5 series fit without much scroll (build 29)
- `f3c487f` 2026-08-27 — Fix duration inflation from a tap after a long gap (build 28)
- `8690f0a` 2026-08-27 — Measure real workout duration instead of guessing (build 27)
- `3b57787` 2026-08-27 — Add variety pools for the other two dashboard headline states (build 26)
- `d01e1ed` 2026-08-27 — Congratulate the user on the dashboard after today's workout (build 25)
- `15e4937` 2026-08-27 — Bring the Dashboard's entrance motion to GYM v2 (build 24)
- `dd1e0c0` 2026-08-27 — Make the day-circle slide-up more noticeable (build 23)
- `281ab81` 2026-08-27 — Weekly-progress day circles fade in one after another (build 22)
- `a4f998d` 2026-08-27 — Lengthen dashboard tile fade-in with a stronger tail ease-out (build 21)
- `2fd7503` 2026-08-27 — Randomized fade-in stagger per dashboard tile (build 20)
- `728efdc` 2026-08-27 — GYM v2 popup: slide-up/fade entrance and exit animation (build 19)
- `3e75c1d` 2026-08-27 — GYM v2 popup: lock background scroll while open (build 18)
- `e04da09` 2026-08-27 — GYM v2 popup: fix 3 fidelity bugs vs Figma (build 17)
- `20dff41` 2026-08-27 — GYM v2: redesign the set-logging popup to match Figma (build 16, node 112:1872)
- `ba49f98` 2026-08-27 — GYM v2: green-check save animation, redirect to Dashboard (build 15)
- `86fe7b2` 2026-08-27 — GYM v2 icon tweaks: orange warmup/stretching tiles, updated ab crunch + leg extension, bigger icons (build 14)
- `dd06461` 2026-08-27 — Add new v3 exercise icon library to GYM v2 (build 13)
- `0fd67ef` 2026-08-27 — Disable Safari's rubber-band bounce at the top of GYM v2 (build 12)
- `356208c` 2026-08-27 — Paint body red on GYM v2 so the shared nav-clearance gap isn't a black stripe (build 11)
- `c7713a3` 2026-08-27 — Fix double bottom padding on GYM v2, matching the real GYM screen (build 10)
- `98896fd` 2026-08-27 — Match GYM v2's "Twój plan" eyebrow to Dashboard's 11px (build 9)
- `bd7d5f6` 2026-08-27 — Dial in exact GYM v2 spacing/sizing, fix a real hidden-state bug (build 8)
- `ce16d32` 2026-08-27 — Fix GYM v2 fidelity gaps: icon colors, missing label, save button placement (build 7)
- `82a3bd6` 2026-08-27 — Build GYM v2 — second screen of the v3 Figma redesign (build 6)
- `b0acfd1` 2026-08-27 — Align trophy icon's bottom edge to the exercise-name baseline (build 5)
- `6bb75d2` 2026-08-27 — Fix trophy icon size, bump plan name to spec, harden other dashboard icons (build 4)
- `f64e7ae` 2026-08-27 — Fix checkmark not rendering on real iOS Safari (build 3)
- `2447b18` 2026-08-27 — Use Maciej's own 4-state icon set for weekly-progress (build 2)
- `330c13e` 2026-08-27 — Add a small build counter to the Dashboard preview
- `a8d263a` 2026-08-27 — Rebuild weekly-progress day states from Maciej's own redesigned SVG
- `b2fede5` 2026-08-27 — Make the weekly-progress checkmark bolder and drop its pop-in animation
- `c060304` 2026-08-27 — Force a service-worker update check on every launch/foreground
- `ec3c729` 2026-08-27 — Fix illegible weekly-progress checkmarks (12px, no backing plate)
- `9dae4c2` 2026-08-27 — Use the exact Figma checkmark for weekly-progress, fix a real done-day bug
- `427f350` 2026-08-27 — Match weekly-progress day states to History's calendar logic
- `9ab84fb` 2026-08-27 — Add subtle motion to the Dashboard preview
- `0a23747` 2026-08-27 — Bump Dashboard eyebrow label size to 11px and fix a size mismatch
- `a9b3377` 2026-08-27 — Fix Dashboard icon sizing by using Figma's exact vectors, not generic ones
- `dc6eb32` 2026-08-27 — Lock vertical scroll on the Dashboard preview
- `9ebd79e` 2026-08-27 — Dial in exact Dashboard spacing values
- `82975e2` 2026-08-27 — Reuse the real bottom nav on Dashboard instead of a duplicate one
- `38561da` 2026-08-27 — Fix Dashboard chat icon color/position and add the decorative background
- `a8df954` 2026-08-27 — Fix Dashboard header layout: chat icon inline with greeting, 8px rhythm
- `00bdd4d` 2026-08-27 — Add hidden Dashboard preview matching new Figma v3 redesign
- `966f9c9` 2026-08-26 — Match placeholder contrast in the new-exercise form to the set-logging popup

### 4.7.0 · MINOR · 2026-08-26

**Dla użytkownika (wpis „Co nowego”):**

> Odświeżony wygląd przycisków — wszystkie w pełni zaokrąglone (pigułki) zamiast lekko zaokrąglonych rogów

**Commity (1):**

- `a3710c8` 2026-08-26 — Make all buttons fully rounded (pill-shaped)

### 4.6.3 · PATCH · 2026-08-26

**Commity (1):**

- `123a336` 2026-08-26 — Warn instead of silently no-op when confirming an empty exercise popup

### 4.6.2 · PATCH · 2026-08-26

**Commity (1):**

- `6fbedec` 2026-08-26 — Center popups vertically and darken the backdrop

### 4.6.1 · PATCH · 2026-08-26

**Commity (1):**

- `1b36369` 2026-08-26 — Change the exercise popup button label to "Zapisz" when editing

### 4.6.0 · MINOR · 2026-08-26

**Dla użytkownika (wpis „Co nowego”):**

> **Logowanie serii w popupie.** Wpisywanie ciężaru i powtórzeń otwiera się teraz na środku ekranu, zamiast wjeżdżać na dole listy — łatwiej znaleźć przy dłuższych treningach, mniejsza szansa, że coś przeoczysz przewijając. Potwierdzasz przyciskiem "Dodaj do treningu".

**Commity (1):**

- `481a4c7` 2026-08-26 — Move exercise set logging from an inline panel to a centered popup

### 4.5.6 · PATCH · 2026-08-26

**Commity (1):**

- `40d7179` 2026-08-26 — Remove the calendar's multi-log dot indicator

### 4.5.5 · PATCH · 2026-08-26

**Commity (1):**

- `7841842` 2026-08-26 — Fix History showing only the first workout/run when a day has more than one

### 4.5.4 · PATCH · 2026-08-25

**Commity (1):**

- `5f01c76` 2026-08-25 — Swap Leg Press icon and rename to Leg Press Machine

### 4.5.3 · PATCH · 2026-08-25

**Commity (1):**

- `c60efe0` 2026-08-25 — Fix keyboard not appearing on iOS by removing the readonly-until-focus hack

### 4.5.2 · PATCH · 2026-08-25

**Commity (1):**

- `87e191f` 2026-08-25 — Remove the duplicate "Bicep Curl" exercise, standardize on Barbell Curl

### 4.5.1 · PATCH · 2026-08-25

**Commity (1):**

- `5e9309d` 2026-08-25 — Fix mismatched exercise icons: Barbell Curl and Bicep Curl (Alt Grip)

### 4.5.0 · MINOR · 2026-08-25

**Dla użytkownika (wpis „Co nowego”):**

> **Rozgrzewka i rozciąganie.** Każdy dzień planu treningowego zaczyna się teraz od rozgrzewki i kończy rozciąganiem — automatycznie, także w planach, które już masz. Zaznaczasz jednym stuknięciem, bez wpisywania serii.

**Commity (6):**

- `47a5ea4` 2026-08-25 — Swap the Stretching exercise icon for the updated Figma artwork
- `63b64d0` 2026-08-25 — Swap the plan-editor checkmark badge for the exact Figma artwork
- `5ab8540` 2026-08-25 — Drop the white outline ring around the plan-editor checkmark badge
- `9ab925c` 2026-08-25 — Make the plan-editor "selected exercise" checkmark more prominent
- `49ff17c` 2026-08-25 — Restyle the GYM "today's plan" banner: dark box, gray label
- `1b6eee9` 2026-08-25 — Auto-add Warm-up/Stretching to every plan day, with a checklist-style logging UI

### 4.4.0 · MINOR · 2026-08-25

**Dla użytkownika (wpis „Co nowego”):**

> GYM: nowa kategoria sprzętu Kettlebell i 6 nowych ćwiczeń w bibliotece — swing, goblet squat, martwy ciąg, wiosłowanie, halo i turkish get-up

**Commity (1):**

- `b523d92` 2026-08-25 — Add Kettlebell equipment category with 6 new exercises

### 4.3.0 · MINOR · 2026-08-25

**Dla użytkownika (wpis „Co nowego”):**

> GYM: 2 nowe ćwiczenia w bibliotece — Barbell Bench Press (klatka) i Captain's Chair Raise (brzuch)

**Commity (1):**

- `35c2bb0` 2026-08-25 — Add Barbell Bench Press and Captain's Chair Raise, remove footer mode label

### 4.2.4 · PATCH · 2026-08-25

**Commity (1):**

- `0ee2255` 2026-08-25 — Nudge browser-tab users to install, so data doesn't get split

### 4.2.3 · PATCH · 2026-08-25

**Commity (1):**

- `3743acb` 2026-08-25 — Show Browser vs installed-app mode in the footer

### 4.2.2 · PATCH · 2026-08-25

**Commity (1):**

- `f0cf6b9` 2026-08-25 — Extract apple-touch-icon, favicon, and manifest icons to real files too

### 4.2.1 · PATCH · 2026-08-25

**Commity (1):**

- `830055c` 2026-08-25 — Bump to 4.2.1 (PATCH) so the footer reflects what's actually live

### 4.2.0 · MINOR · 2026-08-25

**Dla użytkownika (wpis „Co nowego”):**

> **Udostępnij plan.** Udostępnij plan treningowy jako link — wyślij SMS-em albo na WhatsApp, druga osoba klika i ma go od razu u siebie, bez zakładania konta.

**Commity (11):**

- `b92d862` 2026-08-25 — Move the web app manifest to a real file, not an inline data: URI
- `34967c1` 2026-08-25 — Move the plan create/import buttons above the list, side by side
- `dc2f3f9` 2026-08-25 — Share plans as a paste-able code instead of a clickable link
- `31e2ebd` 2026-08-25 — Surface the Safari/PWA storage split right when it bites plan imports
- `27537f6` 2026-08-25 — Expand backup export/import to cover plans, custom exercises, favorites
- `4b3d9fd` 2026-08-25 — Lock the app to portrait orientation
- `a7e92b9` 2026-08-25 — Fix WhatsApp link truncation and add a rich link preview
- `383616c` 2026-08-25 — Shrink plan links further with an adaptive exercise dictionary
- `f8795ae` 2026-08-25 — Add a guaranteed fallback when clipboard copy fails for plan links
- `758da16` 2026-08-25 — Move plan sharing to the Plans list, use the custom export icon
- `f582c47` 2026-08-25 — Add shareable plan links (import/export via URL, no backend)

### 4.1.1 · PATCH · 2026-08-25

**Commity (1):**

- `6f58279` 2026-08-25 — Re-classify the last UX batch as PATCH (4.2.0 -> 4.1.1)

### 4.2.0 · MINOR · 2026-08-25

**Dla użytkownika (wpis „Co nowego”):**

> **Udostępnij plan.** Udostępnij plan treningowy jako link — wyślij SMS-em albo na WhatsApp, druga osoba klika i ma go od razu u siebie, bez zakładania konta.

**Commity (1):**

- `2d0f369` 2026-08-25 — Bump to 4.2.0 and log the last three UX fixes

### 4.1.0 · MINOR · 2026-08-24 → 2026-08-25

**Dla użytkownika (wpis „Co nowego”):**

> **GYM po nowemu.** Siatka ćwiczeń w GYM podzielona na partie mięśniowe, plus ulubione (serduszko) i filtr sprzętu (hantle/maszyny) — łatwiej znaleźć to, czego szukasz.
>
> GYM: bez wybranego planu apka najpierw zaproponuje Ci jego stworzenie, zamiast pokazywać od razu wszystkie 40 ikon — pełną listę wciąż zobaczysz jednym kliknięciem
>
> Plany treningowe: 2 nowe gotowe warianty (Push/Pull/Legs, Upper/Lower Split) i kopiowanie dnia do innych dni jednym kliknięciem
>
> Pierwsze uruchomienie: wybór planu można teraz pominąć i zdecydować się później
>
> Nowa ikona aplikacji
>
> GYM: przytrzymaj i przeciągnij kafelek, żeby zmienić kolejność — znów działa, gdy masz aktywny plan treningowy

**Commity (6):**

- `d815940` 2026-08-25 — Darken the set-row placeholder text for gym readability
- `2757b26` 2026-08-25 — Replace the per-row set delete with a +/- stepper on the last row
- `65525ef` 2026-08-25 — Let default reps/sets act as placeholders, and add per-set delete
- `e0a34e8` 2026-08-24 — Bump the footer feedback icon size (20px -> 28px)
- `f619988` 2026-08-24 — Left-align the welcome-screen footer and give the feedback icon a home
- `aa4fc4f` 2026-08-24 — Bump to 4.1.0 and add the missing changelog entry

### 4.0.0 · MAJOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> **Plany treningowe.** Twórz własne plany treningowe i przypisuj różne ćwiczenia do każdego dnia tygodnia — poniedziałek klatka, wtorek nogi, jak wolisz. Oznacz gwiazdką aktywny plan, a GYM sam pokaże, co dziś robisz; dostęp masz teraz z pigułki obok ikonki wiadomości na górze.
>
> GYM: dwa gotowe plany startowe (Trening A / B) czekają od razu, gdy zaczniesz korzystać z planów

**Commity (13):**

- `8a550d3` 2026-08-24 — Fix Polish plural grammar, re-enable drag-reorder in filtered GYM view, redesign plan-selection UI
- `c2d971b` 2026-08-24 — Let first-time users skip the mandatory plan choice
- `5a4f06a` 2026-08-24 — Match the equipment filter pills to the favorites filter style
- `00b424c` 2026-08-24 — Restyle the Wszystkie/Ulubione filter as small orange pills
- `af8a53b` 2026-08-24 — Group the GYM home grid by muscle, add favorites and an equipment filter
- `daa0ac6` 2026-08-24 — Update the Back Extension exercise icon to the new Figma design
- `3a40e7f` 2026-08-24 — Update app icon to the new Figma design (orange square, white T)
- `cea2224` 2026-08-24 — Add "copy to other days" in the plan editor
- `35da6ac` 2026-08-24 — Drop the caret from the plans pill — plain button, not a dropdown
- `5e46ec5` 2026-08-24 — Drop feedback icon from topbar, enlarge and right-align the plans pill
- `114f294` 2026-08-24 — Add the other 22 exercise icons as real library entries, expand the ready-made plans
- `2079530` 2026-08-24 — Force a plan choice on first launch, before the app opens
- `ec41072` 2026-08-24 — Officially publish training plans (v4.0.0)

### 3.5.0 · MINOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> GYM: próba zapisania pustego treningu (bez ćwiczeń albo bez wpisanych wyników) pokazuje teraz popup na środku ekranu, zamiast krótkiego komunikatu, który sam znikał

**Commity (3):**

- `6450243` 2026-08-24 — Fix awkward CHANGELOG wording via /człowiek
- `33d7878` 2026-08-24 — Center empty-workout popup, fix its changelog wording, add close button to Plans
- `7f36ac0` 2026-08-24 — Add orange popup blocking empty-workout saves (v3.5.0)

### 3.4.0 · MINOR · 2026-08-24

**Commity (11):**

- `109d992` 2026-08-24 — Drop orange border on picker-added tiles; gate the panel checkmark on real data
- `d584910` 2026-08-24 — Revert grid "added" tiles to grayscale, move checkmark to the panel list
- `dc996c5` 2026-08-24 — Don't log picker-added exercises to the session until actually tapped
- `8bbb616` 2026-08-24 — Apply topbar-light to the plans and plan editor screens
- `8065729` 2026-08-24 — Scope the GYM light background to header+banner only, not the whole view
- `d28e672` 2026-08-24 — Fix: "Wybierz inne ćwiczenie" button always visible in GYM
- `c4f516b` 2026-08-24 — Flip banner to orange-on-white, fix dark gap, un-gray added tiles
- `4ebf766` 2026-08-24 — Plan picker: select-then-confirm with orange selection, restyle banner
- `77e7f9b` 2026-08-24 — Filter GYM tile grid to today's plan exercises, with a picker for extras
- `508cbf1` 2026-08-24 — Rework training plans: per-day exercise schedule within a single plan
- `f6f7b72` 2026-08-24 — Add training plans (beta, hidden entry point) — v3.4.0

### 3.3.1 · PATCH · 2026-08-24

**Commity (1):**

- `8a55fd3` 2026-08-24 — X on the expanded exercise panel now collapses, not deletes (v3.3.1)

### 3.3.0 · MINOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> GYM: drugie tapnięcie pustego ćwiczenia usuwa je z sesji; na liście większy ołówek i nowa ikonka kosza do szybkiego usuwania

**Commity (1):**

- `6b68d2f` 2026-08-24 — Tap-to-undo empty exercises, bigger edit icon, trash icon on the list (v3.3.0)

### 3.2.2 · PATCH · 2026-08-24

**Commity (1):**

- `43130f4` 2026-08-24 — Stop the drag from stuttering on every tile crossing (v3.2.2)

### 3.2.1 · PATCH · 2026-08-24

**Commity (1):**

- `08d483c` 2026-08-24 — Suppress iOS's native long-press image menu on exercise tiles (v3.2.1)

### 3.2.0 · MINOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> GYM: przytrzymaj i przeciągnij kafelek ćwiczenia, żeby ustawić własną kolejność — zapamiętujemy ją na stałe

**Commity (1):**

- `e8b14b1` 2026-08-24 — Drag & drop to reorder exercise tiles, long-press to start (v3.2.0)

### 3.1.8 · PATCH · 2026-08-24

**Commity (1):**

- `04e1be6` 2026-08-24 — Fix background bleeding through below the popup (v3.1.8)

### 3.1.7 · PATCH · 2026-08-24

**Commity (1):**

- `2a0c3a1` 2026-08-24 — Drive overlay top/height from window.visualViewport directly (v3.1.7)

### 3.1.6 · PATCH · 2026-08-24

**Commity (1):**

- `aacea0d` 2026-08-24 — Stop popups from jumping when the keyboard opens (v3.1.6)

### 3.1.5 · PATCH · 2026-08-24

**Commity (1):**

- `ebde210` 2026-08-24 — Try the readonly-until-focus trick against Safari's contact autofill (v3.1.5)

### 3.1.4 · PATCH · 2026-08-24

**Commity (1):**

- `470f2f5` 2026-08-24 — Wrap the multi-field "add exercise" inputs in a <form>, randomize autocomplete (v3.1.4)

### 3.1.3 · PATCH · 2026-08-24

**Commity (1):**

- `e816e5f` 2026-08-24 — Rename id="onboardName"/"newExName" away from "Name" (v3.1.3)

### 3.1.2 · PATCH · 2026-08-24

**Commity (1):**

- `92e8adc` 2026-08-24 — Add autocomplete=off to text inputs to stop Safari's contact-fill bar (v3.1.2)

### 3.1.1 · PATCH · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> GYM: dodawanie własnego ćwiczenia otwiera się teraz jako popup, zamiast rozwijać się w miejscu

**Commity (1):**

- `d7843ef` 2026-08-24 — Turn "add custom exercise" into a popup instead of an inline panel (v3.1.1)

### 3.1.0 · MINOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> GYM: przy dodawaniu własnego ćwiczenia apka sama podpowie pasującą ikonkę — 22 nowe ikony do wyboru

**Commity (1):**

- `8662166` 2026-08-24 — Suggest a matching icon when adding a custom exercise (v3.1.0)

### 3.0.0 · MAJOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> Aplikacja mówi teraz po polsku i angielsku — dopasowuje się automatycznie do języka telefonu

**Commity (1):**

- `1c1b153` 2026-08-24 — Add English translation, auto-detected from system language (v3.0.0)

### 2.9.0 · MINOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> GYM: siatka ćwiczeń teraz w 3 kolumnach — większe, czytelniejsze kafelki

**Commity (1):**

- `ee7c7a8` 2026-08-24 — Switch GYM exercise grid to 3 columns (v2.9.0)

### 2.8.0 · MINOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> Nowy wygląd dolnej nawigacji — pływająca, półprzezroczysta pigułka zamiast pełnej belki

**Commity (5):**

- `c345e39` 2026-08-24 — Match bottom nav inset to left/right (flat 20px), Strava-style
- `9a0043c` 2026-08-24 — Hide bottom nav while an input is focused (keyboard open)
- `29495a7` 2026-08-24 — Lower bottom nav pill closer to the screen edge, Strava-style
- `d80af62` 2026-08-24 — Set bottom nav pill inset to exactly 20px on all sides
- `b92dfdc` 2026-08-24 — Redesign bottom nav as a floating pill (v2.8.0)

### 2.7.0 · MINOR · 2026-08-24

**Dla użytkownika (wpis „Co nowego”):**

> Nowość: udostępnij trening albo bieg jako grafikę — od razu po zapisie i z poziomu Historii

**Commity (2):**

- `d62422f` 2026-08-24 — Temporarily disable share buttons until the card template is ready
- `2a03563` 2026-08-24 — Add social share cards for workouts and runs (v2.7.0)

### 2.6.0 · MINOR · 2026-08-23

**Dla użytkownika (wpis „Co nowego”):**

> Nowa opcja: zgłoś błąd albo pomysł bezpośrednio z aplikacji — ikonka w górnym pasku

**Commity (3):**

- `f0f1c6d` 2026-08-23 — Bump feedback icon touch target to 44x44 (Apple HIG minimum)
- `a5f5407` 2026-08-23 — Swap feedback icon for the provided speech-bubble SVG
- `19b64aa` 2026-08-23 — Add in-app feedback form (v2.6.0)

### 2.5.11 · PATCH · 2026-08-23

**Commity (1):**

- `7c762a5` 2026-08-23 — Align HISTORY detail card and empty-state text to the same start position

### 2.5.10 · PATCH · 2026-08-23

**Commity (1):**

- `8958986` 2026-08-23 — Widen gap between HISTORY calendar and backup-hint text

### 2.5.9 · PATCH · 2026-08-23

**Commity (1):**

- `41f7ef8` 2026-08-23 — Shrink oversized favicon/touch-icon/manifest icons, cut file 30%

### 2.5.8 · PATCH · 2026-08-22

**Commity (1):**

- `dbc6dd2` 2026-08-22 — Revert welcome-screen scroll lock entirely

### 2.5.7 · PATCH · 2026-08-22

**Commity (1):**

- `8ee5b6a` 2026-08-22 — Properly fix welcome-lock: neutralize min-height conflict, use JS-measured height

### 2.5.6 · PATCH · 2026-08-22

**Commity (1):**

- `ca3c68f` 2026-08-22 — Fix footer missing on first launch until navigating away and back

### 2.5.5 · PATCH · 2026-08-22

**Commity (1):**

- `08724d7` 2026-08-22 — Fix welcome footer overlapping the tile grid on tall-content devices

### 2.5.4 · PATCH · 2026-08-22

**Commity (1):**

- `1852c28` 2026-08-22 — Make welcome-screen scroll lock unconditional (always 100dvh, always clipped)

### 2.5.3 · PATCH · 2026-08-22

**Commity (1):**

- `3c7b970` 2026-08-22 — Temporarily hide the MÓJ PLAN button

### 2.5.2 · PATCH · 2026-08-22

**Commity (1):**

- `76fc012` 2026-08-22 — Block welcome-screen touchmove to stop iOS standalone-PWA rubber-band scroll

### 2.5.1 · PATCH · 2026-08-22

**Commity (2):**

- `d020890` 2026-08-22 — Fix Service Worker silently serving stale content via HTTP cache
- `7a6f6f9` 2026-08-22 — Fix welcome-screen scroll lock not holding on iOS Safari

### 2.5.0 · MINOR · 2026-08-22

**Dla użytkownika (wpis „Co nowego”):**

> Ekran główny nie przewija się już na standardowych telefonach — na mniejszych ekranach scrollowanie działa jak wcześniej

**Commity (1):**

- `e343a22` 2026-08-22 — Re-add welcome-screen scroll lock, conditional on content actually fitting

### 2.4.2 · PATCH · 2026-08-22

**Commity (1):**

- `f08adc4` 2026-08-22 — Fix stray bar flash during screen transitions on height-mismatched screens

### 2.4.1 · PATCH · 2026-08-22

**Commity (1):**

- `40985bc` 2026-08-22 — Replace fade-nudge transition with a real sliding screen transition

### 2.4.0 · MINOR · 2026-08-22

**Dla użytkownika (wpis „Co nowego”):**

> Płynne, kierunkowe animacje przejścia między ekranami

**Commity (1):**

- `b052276` 2026-08-22 — Revert welcome-screen size-fitting; add directional screen-transition animation

### 2.3.0 · MINOR · 2026-08-22

**Dla użytkownika (wpis „Co nowego”):**

> Przesuwanie palcem (swipe) między GYM, RUNNING, HISTORY i STATS

**Commity (1):**

- `c811b6b` 2026-08-22 — Add swipe navigation between GYM / RUNNING / HISTORY / STATS

### 2.2.0 · MINOR · 2026-08-22

**Dla użytkownika (wpis „Co nowego”):**

> Popup „Co nowego” grupuje zmiany według wersji i przewija się, gdy jest ich więcej

**Commity (1):**

- `7e7fec2` 2026-08-22 — Group changelog popup by version with scroll; lock welcome screen to viewport

### 2.1.5 · PATCH · 2026-08-22

**Commity (1):**

- `8cc6ece` 2026-08-22 — History calendar: fixed-width month/year labels so arrows stay put

### 2.1.4 · PATCH · 2026-08-22

**Commity (1):**

- `0d096bd` 2026-08-22 — Patch bumps skip the changelog popup; wider History arrow spacing; bump 2.1.4

### 2.1.3 · PATCH · 2026-08-22

**Commity (1):**

- `f89df2e` 2026-08-22 — History: drop month/year dropdowns now that arrows exist; dot version format

### 2.1.2 · PATCH · 2026-08-22

**Commity (1):**

- `f26dee3` 2026-08-22 — History calendar: split month/year navigation into independent arrows

### 2.1.1 · PATCH · 2026-08-22

**Dla użytkownika (wpis „Co nowego”):**

> Nowy, spójny zestaw ikon ćwiczeń w sekcji GYM
>
> Naprawiona nawigacja miesiącami w Historii — strzałki lewo/prawo, działa też cofanie między latami
>
> Naprawiona widoczność strzałek w wyborze daty (GYM/RUNNING)
>
> Statystyki: strzałki lewo/prawo zamiast jednego przycisku przewijającego tylko do przodu

**Commity (1):**

- `d077c3a` 2026-08-22 — Add "what's new" changelog popup, bump to v2.1.1, adopt semver

### przed 2.1.1 (bez numeru wersji) · 2026-08-21 → 2026-08-22

**Commity (29):**

- `ad9781e` 2026-08-22 — Fix invisible/unclickable prev-next month arrows in HISTORY and date-picker modal
- `360dc4b` 2026-08-22 — Replace GYM exercise tile icons with the Figma icon library set
- `7c4e024` 2026-08-22 — Fix HISTORY calendar breaking when navigating to a year with no logged data
- `ca77417` 2026-08-22 — Replace STATS date-pill single caret with left/right prev/next arrows
- `7fe86fc` 2026-08-22 — Fix welcome greeting font-size to match Figma exactly (18px, was 16px)
- `feea46b` 2026-08-22 — Restyle welcome greeting to match design: small white text above headline instead of orange caps label
- `fa03bbe` 2026-08-22 — Add lightweight local profile (name prompt), backup reminder notice, and thread profile name into export/import
- `c60f510` 2026-08-22 — Auto-reload the app when a new Service Worker takes control, so open tabs pick up updates without manual refresh
- `17eaab5` 2026-08-22 — Add PWA installability for Android: 192x192 icon in manifest, network-first Service Worker for offline support
- `532b353` 2026-08-21 — Add privacy-friendly GoatCounter analytics: track screen navigation and key actions (save workout/run, add custom exercise)
- `dafcfca` 2026-08-21 — Enlarge GYM exercise tiles slightly (grid gap 12px to 9px, ~+2px per tile)
- `eb238bd` 2026-08-21 — Unify topbar logo/plan-button height across all screens; add breathing room between header and first STATS card
- `ed7ab5f` 2026-08-21 — STATS: fix vertical spacing/hierarchy inside cards to match Figma (title-subtitle tight, section gaps generous)
- `251e6b4` 2026-08-21 — STATS: add missing GYM/RUNNING icon+label headers to each stats card
- `67c534d` 2026-08-21 — STATS: add check/uncheck icons and orange/peach colors to toggle buttons; revert running summary tiles to dark filled style matching updated Figma
- `3f23f9f` 2026-08-21 — HISTORY: full-width orange calendar from top of viewport (matching GYM/RUNNING pattern); sessions collapse to compact bars by default, click to expand, X to collapse; running sessions show stat tiles when expanded
- `be3cf82` 2026-08-21 — RUNNING: add week-progress dots and replace distance/time/pace inputs with tile display matching updated Figma design
- `79417e6` 2026-08-21 — RUNNING: full-width white panel from top of viewport (same as GYM); remove stale invisible empty-hint text
- `ea09843` 2026-08-21 — GYM screen: white topbar merges with panel, orange logo, matching Figma reference
- `d7c1bf6` 2026-08-21 — Precise 1:1 spacing/sizing fixes from Figma across all v2.0 screens
- `935a90a` 2026-08-21 — Add multi-activity dot indicator to calendar days with more than one logged session
- `397273a` 2026-08-21 — Match v2.0 STATS screen from Figma: single white card, bordered stat tiles
- `b8a6ad9` 2026-08-21 — Match v2.0 HISTORY screen from Figma: session details as white cards
- `56b17bd` 2026-08-21 — Match v2.0 GYM/RUNNING screens from Figma: unified white panel, outline exercise tiles, grayed added-state, full-width add button
- `714e402` 2026-08-21 — Match v2.0 welcome screen spacing from Figma: tighter grid padding, bigger tile icons/gap, compact plan button with caret
- `5741750` 2026-08-21 — Disable pinch and double-tap zoom for app-like feel
- `2faf353` 2026-08-21 — Add app version and copyright footer to home screen
- `4878609` 2026-08-21 — Rename to index.html
- `0322a73` 2026-08-21 — Add Thryve.html

