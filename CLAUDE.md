# Thryve / Mekkio — zasady dla nowych ekranów

Cała aplikacja to jeden plik `index.html` (CSS w `<style>`, JS w `<script>`). PWA na iPhone'a.

## Animacje: obowiązkowy wzorzec dla KAŻDEGO nowego ekranu, popupu i komponentu

Cel: apka ma sprawiać wrażenie natywnej aplikacji iOS. Ruch pomaga zrozumieć, co się stało, a nie jest ozdobą, na którą trzeba czekać. Wszystkie animacje biorą wartości z jednego miejsca: tokenów `--m-ease-*` / `--m-dur-*` w `:root`. Dzięki temu ruch jest identyczny na każdym ekranie, a zmiana tokenu zmienia go wszędzie. Wizualny podgląd: Mekkio Design Guide, sekcja Motion.

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
