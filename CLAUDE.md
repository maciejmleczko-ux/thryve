# Thryve / Mekkio — zasady dla nowych ekranów

Cała aplikacja to jeden plik `index.html` (CSS w `<style>`, JS w `<script>`). PWA na iPhone'a.

## Animacje: obowiązkowy wzorzec dla KAŻDEGO nowego ekranu, popupu i komponentu

Cel: apka ma sprawiać wrażenie natywnej aplikacji iOS. Ruch pomaga zrozumieć, co się stało, a nie jest ozdobą, na którą trzeba czekać. Nie wymyślaj nowych krzywych ani czasów. Używaj tych poniżej (ustalone i sprawdzone w wersjach 4.42.2–4.42.4, szczegóły w `plans/001–007`).

### 1. Czy to ma się ruszać?

| Jak często użytkownik to robi | Decyzja |
|---|---|
| Ciągle (zakładki, przewijanie, zaznaczanie, wpisywanie) | Bez animacji albo ledwo widoczna |
| Czasem (popup, sheet, toast) | Standardowa, krótka animacja |
| Rzadko (koniec treningu, rekord, onboarding) | Tu wolno dodać efekt „wow” |

Jeśli nie da się powiedzieć, po co coś się rusza, to się nie rusza.

### 2. Krzywe: tylko te

| Do czego | Wartość |
|---|---|
| **Główna**: wejścia elementów, press, wszystko domyślnie | `cubic-bezier(.16,1,.3,1)` |
| Wjazd modala / sheetu (`mSheetUp`) | `cubic-bezier(.22,1,.36,1)` |
| Zamknięcie sheetu rzutem palca (WAAPI) | `cubic-bezier(.32,.72,0,1)` |
| Zamknięcie przyciskiem (sheet/szuflada) | `cubic-bezier(.4,0,1,1)`, krócej niż wejście (np. .26s vs .4s) |
| Zmiana koloru / przezroczystości | `ease` |

Nigdy wolnego startu (`ease-in`) na wejściu elementu.

### 3. Czasy

| Element | Czas |
|---|---|
| Wciśnięcie przycisku | `--press-in` .1s / powrót `--press-out` .16s |
| Małe elementy (nagłówek, pole, wskazówka) | .35–.45s |
| Duże kafle | .7–.8s (dłużej = „cięższe”) |
| Backdrop modala | ~.24s |
| Zwykłe UI poza wejściami | ≤ .3s |

### 4. Wejście elementu (reveal)

```css
@media (prefers-reduced-motion: no-preference){
  .moj-kafel{animation:dashTileRise .7s cubic-bezier(.16,1,.3,1) backwards;}
}
```

- Kształt: zawsze `opacity 0→1` + `translateY(Npx)→0`. Nigdy sam fade i nigdy `scale(0)`. N = 8–10px dla małych elementów, 14–18px dla kafli. Korzystaj z istniejących keyframes: `dashRise`, `dashTileRise`, `dashDayIn`, `exv2FadeIn`, `exv2CardIn`, `loadv2Rise`.
- **Fill-mode: `backwards`, NIGDY `both` ani `forwards`.** `both` po zakończeniu przypina `transform` i po cichu wyłącza `:active` (efekt wciśnięcia) na tym elemencie.
- **Gating:** animacja wejścia gra tylko przy realnym otwarciu ekranu/popupu. Klasa z `animation` (np. `.gymv2-anim-in`) jest dodawana tylko, gdy render dostaje `animate=true` z miejsca „wejście na ekran”. Zwykły re-render (zalogowanie serii, edycja) woła render bez argumentu, bez animacji. Wzór: `renderGymGridV2(animate)`, `renderExercisePopupV2(animate)`.
- **Stagger:**
  - listy jednakowych elementów: deterministycznie, `animation-delay: calc(var(--i,0) * 40–80ms + base)`;
  - kafle bez naturalnej kolejności: losowo w JS (`i*80 + Math.random()*100` ms);
  - element wewnątrz animowanego rodzica zaczyna dopiero, gdy rodzic prawie wylądował. Nigdy dwa niezależne ruchy naraz.

### 5. Wciśnięcie (press)

Każdy nowy klikalny element:

```css
.moj-btn{transition:transform var(--press-out) var(--press-ease);}
.moj-btn:active{transform:scale(.97);}   /* .95–.98; małe ikony do .9 */
```

**oraz** dopisz `.moj-btn:active` do zbiorczej reguły `…:active{transition-duration:var(--press-in);}` na końcu `<style>`. Ta reguła celowo ma postać listy: globalne `:active` łapie też rodziców wciśniętego elementu i skraca slide ekranu. Tap-highlight jest wyłączony globalnie, a pasywny `touchstart` (początek pierwszego `<script>`) włącza `:active` na iOS. Nie usuwaj ich.

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
2. Tylko krzywe i czasy z tego pliku? Fill `backwards`? Reduced-motion?
3. Klikalne rzeczy mają press i są w zbiorczej regule `:active`?
4. Re-render (np. zalogowanie serii) nie odpala ponownie animacji wejścia?
5. Test w przeglądarce: DevTools → Animations 10% (skoki, mignięcia), szybkie wielokrotne tapnięcia, przerwanie gestu w połowie.
6. Test lokalny: service worker (`sw.js`) serwuje starą wersję z cache. Przed testem wyrejestruj go w DevTools.
7. Gesty i `:active` oceniaj na prawdziwym iPhonie (PWA), nie w Chrome na komputerze.
