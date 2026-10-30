# Thryve / Mekkio — zasady dla nowych ekranów

Cała aplikacja to jeden plik `index.html` (CSS w `<style>`, JS w `<script>`). PWA na iPhone'a.

## Dziennik techniczny: `docs/CHANGELOG.md`

Pełna historia wersji (także PATCH) z commitami. **Przy każdym bumpie `APP_VERSION`** dopisz w tym samym commicie nowy wpis na górze sekcji „Dziennik wersji” (pod znacznikiem `<!-- NOWE WPISY… -->`):

```
### 4.45.0 · MINOR · 2026-09-26

**Dla użytkownika (wpis „Co nowego”):**   ← tylko jeśli wersja ma wpis w CHANGELOG

> tekst z obiektu CHANGELOG (pl)

**Commity (N):**

- `abc1234` 2026-09-26 — opis commita
```

Hash commita, który sam dodaje wpis, jest znany dopiero po commicie, więc ten jeden commit wpisz przy następnej wersji albo pomiń. Zaktualizuj też „Aktualna wersja” w nagłówku. Przy większym etapie dopisz wiersz w „Oś czasu”, a przy nowym pliku, kluczu localStorage albo tabeli Supabase zaktualizuj „Architektura w skrócie”.

## App Store: wydania, review i zasady Apple

Aplikacja iOS to Capacitor (`native/`) z kodem wbudowanym w paczkę (`native/www`, brak `server.url` w `capacitor.config.json`). Dlatego:

| Zmiana | Trafia do użytkowników | Review Apple |
|---|---|---|
| `index.html`, CSS, logika, teksty, ćwiczenia | web (`app.mekkio.app`) od razu po pushu; **aplikacja iOS dopiero po nowym buildzie** | nowy build = tak (zwykle ≤24 h) |
| Supabase (tabele, Edge Functions, dane) | od razu, wszędzie | nie |
| Opis, zrzuty, „Co nowego” w ASC | po zapisie w ASC | tak, lekkie |
| Nowe uprawnienia, natywne wtyczki, IAP / Mekkio+ | tylko z nowym buildem | tak, dokładniej |

- **Nie ładuj kodu aplikacji z serwera zamiast z paczki** (guideline 2.5.2: kod zmieniający funkcje po review = ryzyko wycofania). Dane (`version.json`, treści) mogą zmieniać się bez review.
- Nowe wersje grupuj w „duże buildy”. Pilny błąd: najpierw sprawdź, czy da się naprawić po stronie Supabase; w ostateczności Expedited Review w ASC.
- Pierwsze review: zwykle 24–48 h, realnie 2–7 dni z jedną rundą poprawek. Odrzucenie nie ma kar.
- Po każdym buildzie aktualizuj kolejkę (`project_pending_native_build`); `version.json` (`ios.build`) podbijaj dopiero po przetworzeniu w TestFlight i teście na iPhonie, i pytaj przed pushem.

### Lista kontrolna przed każdym zgłoszeniem do review

1. **4.2** Opis i notatki dla review wskazują funkcje natywne (HealthKit, haptyka, powiadomienia, Keep Awake) i gdzie je znaleźć.
2. **2.1** Konto demo `review@mekkio.app` działa na świeżej instalacji, backend żyje; brak niedokończonych funkcji w UI.
3. **3.1.1** Żadnych płatności, linków do płatności zewnętrznych ani „Mekkio+” z kłódką w UI, dopóki IAP nie jest wdrożone (`isPremium()` zwraca `true`).
4. **5.1.2(i)** Każde wywołanie AI idzie przez `callAI` i wymaga zgody (`hasAiConsent()`); nie dodawaj omijającej ścieżki.
5. **1.4.1** Kcal i Trener AI mają widoczne „to nie porada medyczna”; w opisie żadnych obietnic zdrowotnych.
6. **5.1.1** App Privacy label i `polityka-prywatnosci.html` zgadzają się z tym, co aplikacja robi (HealthKit, zdjęcia postępu, import, AI, GoatCounter, Formspree). Nowe zbieranie danych = najpierw aktualizacja labela i polityki.
7. **5.1.1(v), 4.8** Usuwanie konta i Sign in with Apple działają (nie psuć w kolejnych buildach).
8. **2.3.3 / 2.3.7 / 2.3.10** Zrzuty z tego buildu, nazwa ≤30 znaków, w metadanych bez Androida/PWA i bez cudzych marek (Strong, Hevy).
9. **5.6.1** Tylko systemowe okno oceny aplikacji.
10. Test na prawdziwym iPhonie: świeża instalacja jako gość, bez internetu, logowanie Apple/Google.

Pełne uzasadnienie i stan: `project_app_store_requirements` (pamięć), wytyczne: developer.apple.com/app-store/review/guidelines.

## Animacje: obowiązkowy wzorzec dla KAŻDEGO nowego ekranu, popupu i komponentu

Cel: apka ma sprawiać wrażenie natywnej aplikacji iOS. Ruch pomaga zrozumieć, co się stało, a nie jest ozdobą, na którą trzeba czekać. Wszystkie animacje biorą wartości z jednego miejsca: tokenów `--m-ease-*` / `--m-dur-*` w `:root`. Dzięki temu ruch jest identyczny na każdym ekranie, a zmiana tokenu zmienia go wszędzie. Wizualny podgląd z działającymi przykładami: [Mekkio Design Guide → Motion](https://claude.ai/artifact/35fnMV3RPQfMPU72EFibWU#motion). Przy każdej zmianie tokenów zaktualizuj też tę stronę.

### 1. Czy to ma się ruszać?

| Jak często użytkownik to robi | Decyzja |
|---|---|
| Ciągle (zakładki, przewijanie, zaznaczanie, wpisywanie) | Bez animacji albo ledwo widoczna |
| Czasem (popup, sheet, toast) | Standardowa, krótka animacja |
| Rzadko (koniec treningu, rekord, onboarding) | Tu wolno dodać efekt „wow” |

Jeśli nie da się powiedzieć, po co coś się rusza, to się nie rusza.

### 2. Tokeny ruchu: jedyne dozwolone wartości

Wszystkie krzywe i czasy siedzą w `:root` w `index.html` (blok „Mekkio motion system”). **Nigdy nie wpisuj `cubic-bezier(...)` ani czasu w sekundach na sztywno.** Zawsze `var(--m-…)`. W JS (WAAPI nie czyta `var()`) używaj obiektu `MOTION`, który czyta te same zmienne z CSS.

| Krzywa | Do czego | JS |
|---|---|---|
| `--m-ease` | domyślna: wejścia, press, wszystko co się rusza | `MOTION.ease` |
| `--m-ease-sheet` | wjazd sheetu / szuflady, snapback | `MOTION.sheet` |
| `--m-ease-exit` | zamknięcie przyciskiem, wylot przy swipe | `MOTION.exit` |
| `--m-ease-throw` | zamknięcie sheetu rzutem palca | `MOTION.throw` |
| `--m-ease-land` | wlot przy swipe (wpada szybko, miękko ląduje) | `MOTION.land` |
| `--m-ease-spring` | mały overshoot: dociągnięcie strony, ptaszek, tagi | `MOTION.spring` |
| `ease` (słowo kluczowe) | zmiany koloru / tła / opacity | — |

| Czas | Wartość | Do czego |
|---|---|---|
| `--m-dur-press-in` / `--m-dur-press-out` | .1s / .16s | wciśnięcie / puszczenie |
| `--m-dur-quick` | .15s | zmiana koloru, małe przełączniki |
| `--m-dur-fade` | .24s | backdrop, fade, toast, małe ruchy |
| `--m-dur-exit` | .26s | zamknięcie sheetu/szuflady (zawsze krócej niż wejście) |
| `--m-dur-snap` | .3s | snapback, szybkie odsłonięcia |
| `--m-dur-in` | .4s | wejście elementu, wjazd sheetu, slide ekranu, kulka menu |
| `--m-dur-pop` | .5s | „sukces”, obrót ikony, elementy ekranu końca treningu |
| `--m-dur-tile` | .7s | duże kafle / hero |
| `--m-dur-draw` | .9s | rysowanie linii wykresu |

Potrzebujesz innej wartości? Najpierw zapytaj, czy na pewno. Jeśli tak, dodaj nowy token do `:root` i do tej tabeli, nigdy lokalnej liczby.

### 3. Gotowe klasy dla nowego kodu

| Klasa | Co robi |
|---|---|
| `.m-press` | efekt wciśnięcia: scale .97, szybko w dół, miękko w górę |
| `.m-rise` | wejście małego elementu (8px, `--m-dur-in`) |
| `.m-rise-tile` | wejście dużego kafla (18px, `--m-dur-tile`) |

Kolejność wchodzenia: `style="--i:N"` (60ms na krok) + opcjonalnie `--m-delay`. Klasy `.m-rise*` dodawaj tylko przy renderze „ekran/popup właśnie otwarty” (`animate=true`), nigdy przy zwykłym re-renderze (zalogowanie serii, edycja).

### 4. Zasady wejścia (reveal), jeśli nie używasz `.m-rise`

- Kształt: zawsze `opacity 0→1` + `translateY(Npx)→0`. Nigdy sam fade i nigdy `scale(0)`. N = 8–10px dla małych elementów, 14–18px dla kafli.
- **Fill-mode: `backwards`, NIGDY `both` ani `forwards`.** `both` po zakończeniu przypina `transform` i po cichu wyłącza efekt wciśnięcia na tym elemencie.
- Stagger dla list: `calc(var(--i,0) * 40–80ms + base)`. Kafle bez naturalnej kolejności: losowe opóźnienie w JS (`i*80 + Math.random()*100` ms). Element wewnątrz animowanego rodzica zaczyna dopiero, gdy rodzic prawie wylądował. Nigdy dwa niezależne ruchy naraz.
- Każde `@keyframes` z ruchem idzie do `@media (prefers-reduced-motion: no-preference){…}`.

### 5. Wciśnięcie w istniejących komponentach

Najprościej dodać klasę `.m-press`. Jeśli element ma własną regułę `:active` (inna skala), daj mu `transition:transform var(--m-dur-press-out) var(--m-ease)` i dopisz jego `:active` do zbiorczej reguły `…:active{transition-duration:var(--m-dur-press-in);}` na końcu `<style>`. Ta reguła celowo ma postać listy: globalne `:active` łapie też rodziców i skraca slide ekranu. Tap-highlight jest wyłączony globalnie, a pasywny `touchstart` (początek pierwszego `<script>`) włącza `:active` na iOS. Nie usuwaj ich.

### 6. Nawigacja między ekranami

- **Zmiana zakładki w dolnym menu: natychmiastowa**, bez slide'u (jak natywny tab bar). Jedyny ruch to wejście kafli nowego ekranu i kulka/ikona w menu.
- **Slide tylko dla wejścia w głąb (push/pop)**, np. Plany → edytor planu. Nowy ekran „w głąb” dopisz do warunku `drill` w `goRoute()`: forward = wejście, back = powrót.
- Nowy ekran v3 dostaje też scroll-lock (`html.<ekran>-lock` + `<ekran>-scrollable` + `body.<ekran>-bg`), wzór w `renderDashboard()` / `renderPlansListV2()`.

### 7. Popupy = bottom sheet

- Używaj wspólnej powłoki `.m-sheet` (albo rodziny `.plansv2-customize-*`) i podepnij `mSheetDrag(overlayId, closeFn)`. Dostajesz wtedy za darmo: ściąganie w dół za dowolne miejsce panelu (gdy treść nie jest przewinięta), snapback, zamknięcie rzutem z prędkością palca i backdrop gasnący razem z sheetem.
- `closeFn(viaDrag)`: przy `viaDrag=true` pomiń własną animację zamknięcia. `finish()` czyści inline `transform`/`opacity` dopiero po dodaniu `hidden`.
- Funkcje open/reset/finish muszą usuwać klasę `m-sheet-entered`, inaczej kolejne otwarcie nie zagra wejścia.
- Otwarty modal blokuje stronę (`html.modal-lock`). Własny scroll ma tylko treść sheetu.

#### Przewijanie i gumka (bounce) na ekranach (reguła, 2026-10-18)

Ekran, który się przewija, **ma gumkę iOS** (odbicie na górze i na dole): nie dodawaj `overscroll-behavior:none` na ekranach przewijanych. Ekran stały (mieści się w całości: kroki onboardingu, okna) gumki nie ma. Kolor tła na obu krawędziach musi się zgadzać z kolorem ekranu, żeby po odbiciu nie było widać szwu: gradient strony kończy się kolorem tła `body` (`--m-page-bot`) albo ekran ma na dole krótki gradient wtapiający go w to tło (wzór: `#view-dashboard::after`, Profil: gradient do 100% wysokości). Okna modalne blokują stronę pod spodem (`modal-lock`).

#### Popupy z paskiem na górze i przyciskiem na dole: efekt szkła (reguła, 2026-10-17)

Nagłówek (tytuł + ✕) i dolny pasek z przyciskiem głównym w oknach, w których treść przewija się pod nimi, mają tło **70% bieli + rozmycie 20 px** (`rgba(255,255,255,.7)` + `backdrop-filter:blur(20px)`, z prefiksem `-webkit-`), a treść ma zapas na dole (min. 120 px), żeby ostatni element nie chował się pod paskiem. Wzór: `#pickExerciseOverlayV2`. Nie stosuj do krótkich okien, w których nic nie przewija się pod paskiem.

#### Popupy z klawiaturą (reguła, 2026-10-17)

Każdy popup z polem tekstowym lub liczbowym (nowy szkielet `.m-sheet2`) przy otwartej klawiaturze: (1) unosi się nad klawiaturą z **zaokrąglonymi wszystkimi rogami (34 px)** i 8 px odstępu, nie jest ucięty prosto (`.plansv2-customize-overlay.m-sheet2.m-kb`); (2) **nagłówek (uchwyt, tytuł, ✕) zostaje przyklejony na górze** (`.m2-head` jest `position:sticky`), przewija się tylko treść, a przycisk główny jest przypięty na dole; (3) tło pod klawiaturą ma ten sam **ciemnoszary kolor co przyciemnienie** (`html.modal-lock` oraz `backgroundColor` w `native/capacitor.config.json`, `#4A4E56`), żeby klawiatura systemowa nie prześwitywała pomarańczem ani jasnym; (4) pola mają font min. 16 px (iOS nie powiększa strony po fokusie); (5) test: zrzut z prawdziwego iPhone'a z otwartą klawiaturą, nie tylko z Chrome. Nowego okna z polem nie wdrażaj bez tych pięciu punktów.

### Przyciski ikon w nagłówkach (reguła, 2026-10-30)

Strzałka wstecz **←** to sam znak bez koła (nawigacja, jak w iOS). Każdy inny przycisk ikony w nagłówku ekranu lub okna (✕, zębatka, ✓, udostępnij) to **koło 40 px** (pole dotyku 44 px, glif 18 px) w jednej z dwóch wersji. **Drugorzędne** (✕, zębatka): ramka 1 px `var(--m-orange)`, białe tło 60% (cieńsza ramka ginie na zdjęciu tła), ikona w kolorze tekstu (wzór: `.x-ring`). **Główne** (✓ zatwierdź, udostępnij): pełne pomarańczowe koło, biała ikona. Na zdjęciu lub ciemnym tle ramka i ikona są białe (`.rl-x`, `.wn-close`, `.ai-popup-close`). Nie wprowadzaj trzeciego wyglądu ani samej ikony bez koła; blok „Przyciski ikon w nagłówkach” jest na końcu `<style>`.

### Odstępy między kartami i kaflami (reguła, 2026-10-22)

Sąsiednie karty i kafle (siatki ćwiczeń, karty Pulpitu, przyciski w hero, stos kart Profilu, rząd kafli w Postępach) mają odstęp **`var(--m-gap-card)` = 8 px**, nigdy 4 px. Powód: kafle są klikalne (min. 8 px między celami dotyku), a karty ze szkła przy 4 px zlewają się w jedną płytę. 4 px zostaje tylko wewnątrz elementów (ikona + tekst, pastylki, kółka dni, segmenty) i w gęstych listach (wiersze serii, siatka kalendarza); 1 px między „Dziś” i „Jutro” jest z Figmy. Hierarchia: wewnątrz karty 4–6 px, między kartami 8 px, między sekcjami 16–24 px. Nowa siatka lub stos kart bierze token, nie liczbę.

### 8. Poziomy swipe

Nie wymyślaj nowego. Kopiuj wzór z `wireHistCalSwipeV2` / `statsV2CaroGoTo`: track na `translateX` 1:1 z palcem, `touch-action:pan-y`, blokada osi przy pierwszym ruchu, rzut z prędkością (WAAPI) + `setTimeout` jako zabezpieczenie dla PWA w tle.

### 9. Wydajność

- Animuj **tylko `transform` i `opacity`**. Nigdy `width`, `height`, `left`, `top`, `margin` ani `font-weight`: to zacina się na iPhonie.
- Nigdy `transition: all` ani `transition: .25s` bez nazwy właściwości.
- Szybko powtarzalne rzeczy (toast, przełączniki) robi się przez `transition`, nie `@keyframes`, bo transition płynnie zmienia kierunek, a keyframes startują od zera.

### 10. Dostępność

- Każde nowe `@keyframes` z ruchem ląduje w `@media (prefers-reduced-motion: no-preference){…}`. Przy ograniczeniu ruchu zostaje tylko fade, bez przesuwania.
- Efekty `:hover` z ruchem tylko w `@media (hover:hover) and (pointer:fine)`.

### Checklista przed pokazaniem / commitem

1. Czy element w ogóle musi się ruszać (pkt 1)?
2. Tylko `var(--m-…)` / `MOTION.*`, żadnych liczb na sztywno? Fill `backwards`? Reduced-motion?
3. Klikalne rzeczy mają press i są w zbiorczej regule `:active`?
4. Re-render (np. zalogowanie serii) nie odpala ponownie animacji wejścia?
5. Test w przeglądarce: DevTools → Animations 10% (skoki, mignięcia), szybkie wielokrotne tapnięcia, przerwanie gestu w połowie.
6. Test lokalny: service worker (`sw.js`) serwuje starą wersję z cache. Przed testem wyrejestruj go w DevTools.
7. Gesty i `:active` oceniaj na prawdziwym iPhonie (PWA), nie w Chrome na komputerze.
