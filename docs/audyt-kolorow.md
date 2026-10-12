# Audyt kolorów index.html (2026-10-12, v4.63.3) — READ-ONLY

Numery linii dotyczą `index.html` (CSS: 25–2716, markup: 2717–4148, JS: 4163–17473). Pominięto zwendorowany Chart.js (l. 4149–4162, zawiera `rgb(75,192,192)` itp.) oraz długie linie base64/SVG poza wymienionymi. Liczby = wystąpienia literału w pliku (nie licząc użyć przez `var()`).

## 0. Najważniejsze ustalenia

1. **Stary motyw nie jest w całości martwy.** `--orange:#f15a23` (31 użyć `var(--orange)`) żyje w **13 modalach `.onboard-box`** (l. 3776–4139: onboarding, import planu, potwierdzenia, nowe ćwiczenie), w `.nav-item.active` (l. 428, nadpisane na transparent przez `.bottom-nav-light`), `.plan-pill` (211), `.feedback-type.active` (707), `.empty-workout-box` (529), `.add-pill` (518), `.rotate-lock-overlay` (941; `--bg`, `--light`). Przyciski „Zapisz” w tych modalach mają dziś **#F15A23, a nie #FF3300** — realna zmiana wyglądu po scaleniu.
2. **Naprawdę martwe** (klasy nie występują poza CSS): `.topbar-light`, `.ex-popup-box`, `.plan-modal-inner`, `.icon-suggest`, `.tip-box`, `.save-btn`, `.set-row`, `.run-stat-tile`, `.cal-wrap`, `.hist-card`, `.ex-bar`, `.week-progress`, `.date-pill`, `.dp-actions`, `.header-row`, `.hist-detail-wrap` (CSS ok. l. 209–245, 485–660). To one są „do wycięcia” razem z `--card`, `--card-2`, `--light-2`(częściowo), `--tip`, `--orange-pill`, `--muted`.
3. Aktywne widoki to tylko: `view-dashboard`, `view-gym-v2`, `view-plans-v2`, `view-plan-editor-v2`, `view-history-v2`, `view-stats-v2` (l. 2976–3299) + dolne menu + sheety/popupy.
4. **Największy dług: #2C2727 (36 użyć)** — ciepły grafit używany jako kolor tekstu/ikon w v2 (tytuły popupów, `.exv2-*`, `.swapv2-*`, `.histv2-*`, `.statsv2-ex-*`, `.lg-*`) obok `--m-ink` #343941 (86 użyć tokenu). Dwa różne „czarne tekstu”. Wymaga decyzji (rekomendacja: scal z --m-ink).
5. W palecie nie ma ok. 90 jednorazowych szarości/lilaków/brzoskwiń — mapowanie w sekcji 2.

## 1. Tokeny `--m-*` (stan obecny)

| Token | Wartość | Użycia `var()` | Decyzja |
|---|---|---|---|
| --m-orange | #ff3300 | 181 | zostaje (+13 literałów #FF3300 w CSS/JS → patrz niżej) |
| --m-ink | #343941 | 86 (+14 literałów #343941) | zostaje |
| --m-muted | #96959b | 56 | zostaje, ale paleta: tylko ikony/hint (3:1) → tekst 11–13 px przepiąć na --m-muted-text (sprawdzić) |
| --m-card | #fdfbff | 30 | zostaje |
| --m-panel | #f5f1fb | 22 | zostaje |
| --m-plan-hard | #2642a4 | 11 | zostaje (+2C3FAE → tu) |
| --m-plan-c-easy | #ff6343 | 11 | zostaje (+FF7458/FF8843/FF8A3D → tu) |
| --m-plan-mid | #3b63cb | 8 | zostaje |
| --m-plan-accent | #6891ff | 5 | zostaje |
| --m-bg | #eceaf1 | 2 (+ meta theme-color l. 24, body) | zostaje |
| --m-red-page | #dd2b17 | 2 | zostaje |
| --m-plan-easy | #708fe1 | 2 | zostaje |
| --m-reps | #1f996e | 2 | zostaje (nowe: --m-mint-ink dla tekstu) |
| --m-sky | #5da9e9 | 1 | zostaje |
| --m-plan-c-hard | #cd1200 | 1 (+8 literałów #CD1200) | zostaje; = „błąd” |
| --m-plan-c-mid | var(--m-orange) | 0 | zostaje (alias) |

Brakujące w kodzie, a w palecie: --m-orange-ink 801A00, --m-orange-tint F1D7CB, --m-orange-tint-2 FFE9E3, --m-navy-tint B7C0E1, --m-navy-ink 0D1637, --m-sky-ink 2F5575, --m-sky-tint C9E2F8, --m-mint 2CDA9D, --m-mint-ink 166D4F, --m-mint-tint B9F3DE, --m-plum 8E0045, --m-plum-ink 470023, --m-plum-tint D9AAC1, --m-muted-text 6C6B78, --m-line C7C6CB, --m-border E6E2EC, --m-amber FFBB00, --m-amber-2 FFC07A, --m-amber-tint FFD885, --m-ai-from FA1228, --m-ai-to 5A00D1. Dziś wszystkie istnieją wyłącznie jako **literały**.

## 2. Literały — pogrupowane, z decyzją

### 2a. Pomarańcz / czerwień / amber
| Literał | Szt. | Gdzie (linie) | Decyzja |
|---|---|---|---|
| #FF3300 | 12 CSS/JS (+rgba(255,51,0,x) 7) | 92, 4681(SVG), 4903, 14242, 15524/15568/15569 (rampy Statystyk), 16501, 16566, 16812, 16872 (karta share, canvas); rgba: 282 loadv2-tint, 2344, 2350, 2373, 2483 | → `--m-orange` w CSS; w JS/canvas zostaje literał (canvas nie czyta var) — dodać stałą |
| #CD1200 | 8 | 104, 2283, 2351, 2430, 2487, 2643, 2645, 4622 | → `--m-plan-c-hard` (zostaje jako „błąd”) |
| #C00 | 5 | 666 (.save.danger), 775, 822, 1670 | scal z #CD1200 (to błąd) |
| #F00 | 1 | 1406 (swipe-delete planu) | scal z #CD1200 |
| #E5484D | 1 | 3876 (import: „Zastąp wszystko”) | scal z #CD1200 |
| #DD2B17 | 1 | 98 (--m-red-page; użyty 2×) | zostaje |
| #F15A23 / rgba(241,90,35) | 2 / 2 | 77 (--orange), 8824 (SVG check); glow 252, 16475 (share) | scal z #FF3300 (patrz sekcja 0.1) |
| #FF6343 | 1 | 102 (--m-plan-c-easy) | zostaje |
| #FF7458 | 2 | 4625 (SVG), 14243 (GY_PLUS_ICON) | → #FF6343 |
| #FF8A3D | 3 | 15524, 15568 (rampy), 15925 (obwódka kropki PR) | → #FF6343 (ramp: decyzja — to gradient komety, stopień pośredni) |
| #FF8843 | 2 | 15638, 15694 (słupki Statystyk, gradient #FFBB00→#FF8843→orange) | → #FF6343 lub #FFC07A (rekomendacja: #FF6343 pasuje do gradientu) |
| #FF5A2A | 1 | 15568 (ramp) | → #FF6343 |
| #FFAB63, #FFB877 | 1, 1 | 15569 (ramp YTD), 15712 (halo pierścienia) | → #FFC07A |
| #FFC07A | 5 | 2116, 2131, 15524, 15568, 15713 (kometa) | zostaje = --m-amber-2 |
| #FFBB00 | 2 | 15638, 15694 | zostaje = --m-amber |
| #FFC542, #F5B942, #FFB608 | 1,1,1 | 15926 (kropka), 1411 (swipe „udostępnij”), 2206 (.statsv2-pr-tag) | → #FFBB00 |
| #FFD885 | 2 | 2150, 2182 (delta YTD/rekord) | zostaje = --m-amber-tint |
| #FFE0BA | 1 | 15569 (ramp) | → #FFD885 |
| #7C2310 | 1 | 15524 (ramp pierścienia) | → #801A00 (--m-orange-ink) |
| #5A1A0C | 1 | 2646 (tekst notatki na brzoskwini) | → #801A00 |
| #2C1500 | 1 | 2206 (tekst na amber PR) | zostaje/decyzja: → #0D1637? lepiej --m-ink |
| #FF3D00, #FFC107, #4CAF50, #1976D2 | 1 ea | 3585 (logo Google SVG) | zostaje (brand 3rd-party) |

### 2b. Brzoskwinia / tint (orange-tint family)
| Literał | Szt. | Gdzie | Decyzja |
|---|---|---|---|
| #F1D7CB | 15 | 330, 2282, 2298, 2336, 2341, 2346, 2350, 2353, 2420, 2467, 2559, 2584, 2588, 2620, 2621 (obwódki szkła/chipów GYM) | → nowy `--m-orange-tint` |
| #FFE9E3 | 3 | 751, 855, 922 (pastylki „soon”, wkcal-chip, chl) | → `--m-orange-tint-2` |
| #FFF4F1, #FFE0D7, #FFE6DC | 1 ea | 1223, 1224, 2644 (aktywny repeat, notatka) | → #FFE9E3 |
| #FFC2B2, #FFA390 | 1 ea | 2463 (.lg-tick.ahead), 2441 (.lg-wval.is-pale) | → #F1D7CB / #FF6343 (decyzja: to „blady pomarańcz” na wartościach) |
| #FFC4AE (--orange-pill), #F7D7CC (--tip) | 1 ea | 78, 79 | do wycięcia (--tip żyje w .onboard-note l. 661 i .icon-suggest) → #FFE9E3 |
| #FBECE3, #F9EAE1 | 3, 1 | 309, 315 (.gymfin-root tło + wash), 2329 (.gy-bg-fade) | NIEPASUJĄCY: tło ekranu końca/GYM; decyzja: nowy `--m-peach-bg` lub #FFE9E3 |

### 2c. Granat / niebo / mięta / śliwka
| Literał | Szt. | Gdzie | Decyzja |
|---|---|---|---|
| #2C3FAE | 7 | 1822–1824, 1830, 1831, 1833, 1896 (notatka użytkownika .exv2-note, chip grupy .swapv2-group-chip) + rgba(44,63,174,.12) l. 1830 | → #2642A4 (--m-plan-hard); rgba → rgba(38,66,164,.12) |
| #2642A4, #3B63CB, #708FE1, #6891FF | 2,1,1,1 | 101/2497, 100, 99, 107 | zostają (tokeny) |
| rgba(59,99,203,.6) | 1 | 2346 (repeat w GYM, szkło) | = --m-plan-mid @.6, zostaje |
| #A4BDFF | 2 | 1795, 2404 (pigułki .exv2-pill, .lg-tag) | → #B7C0E1 (navy-tint) |
| #0E267B | 2 | 1796, 2404 (tekst na ww.) | → #0D1637 (navy-ink) |
| #E7ECFF, #DFE6FF, #E4EBFF, #D8E0F5, #C2CCF2, #B9C2EF | 1 ea | 1820, 1896, 2497, 1229, 1827, 1833 | jasne tła/obwódki niebieskie: → #B7C0E1 dla obwódek; tła (E7ECFF/DFE6FF/E4EBFF) NIEPASUJĄCE — decyzja: nowy `--m-navy-wash` (~E7ECFF) |
| #6F78B8 | 1 | 1832 (hint notatki) | decyzja → #3B63CB lub #6C6B78 |
| #869EDC | 1 | 2357 (.gymv2-tile-partial) | → #708FE1 |
| #5DA9E9 | 1 | 105 (--m-sky) | zostaje (nowe: sky-ink/tint) |
| #2CDA9D | 1 | 354 (.gymfin-stat--mint) | zostaje = --m-mint → tokenizować |
| #1F996E | 1 | 106 (--m-reps) | zostaje |
| #3ECF8E | 1 | 569 (@keyframes saveSuccess) | → #2CDA9D |
| #8E0045 | 1 | 361 (.gymfin-stat--plum) | zostaje = --m-plum → tokenizować |

### 2d. Trener AI (fioletowy blok) — poza paletą
| Literał | Szt. | Gdzie | Decyzja |
|---|---|---|---|
| #FA1228→#5A00D1 (142deg 83%) | 3 | 676 (.dash-ai-card), 768 (.acct-rows--ai), 1120 (ramka AI) | → `--m-ai-from/--m-ai-to`; tło wypełnienia `#000` |
| #3A0058, #340050, #A700FF, rgba(222,116,255,.5/.55) ×5, rgba(161,0,255,.9/.94) ×4, #DE74FF, #DC9DFF | 1 ea | 2431 (.lg-ai karta Trenera AI w GYM), 1817 (.exv2-tip--ai .lbl), 2636 (.lg-ai-sep) + glow l. 677, 769, 1121, 1487, 2431 | NIEPASUJĄCE — fioletowa poświata nie ma w palecie. Decyzja: zostawić jako „AI-glow” (nowy `--m-ai-glow`) albo zbliżyć do #5A00D1 |

### 2e. Grafit / szarości / powierzchnie
| Literał | Szt. | Gdzie | Decyzja |
|---|---|---|---|
| #343941 | 14 | 93, 327, 332, 340, 356, 368, 2561, 2581, 2592, 2597, 2627, 2674, 16566, 16814 | → `var(--m-ink)` |
| #2C2727 | 36 | wyliczone w sekcji 0.4 (tytuły popupów .exv2/.swapv2/.fbv2/.pev2, .histv2-card-*, .statsv2-ex-*, .lg-name, .lg-tip bg l. 2435, .lg-mini-v, .lg-how-ill, canvas 16469) | NIEPASUJĄCY → rekomendacja scal z #343941; l. 2435 (`.lg-tip` ciemny box) zostawić ciemny → #343941 |
| #000 | 23 | tła: toast 936, .exv2-tip 1810, .statsv2-ring-card 2105, .lg-how-err 2675, apple btn 825, AI wypełnienie 676/768/1120; maski 2455–2459 | zostaje (czarne powierzchnie) lub nowy `--m-black`; maski bez zmian |
| #FFF/#FFFFFF | 185 + 3 | wszędzie (tekst na kolorze, białe karty/kafle) | zostaje; opcjonalnie `--m-white` |
| #5B5555 | 10 | 538, 556, 659, 1271, 1667, 1671, 1894, 1901, 1906, 3932 (szary tekst pomocniczy) | → #6C6B78 (--m-muted-text); uwaga: jaśniejszy |
| #6E6863 | 2 | 546, 584 (placeholdery) | → #6C6B78 |
| #71747A | 2 | 1851–1852 (placeholder exv2) | → #6C6B78 |
| #6C6B78 | 2 | 1220, 1900 | zostaje = --m-muted-text |
| #96959B | 2 | 94 (def.), 16830 (canvas) | zostaje = --m-muted |
| #8A8A8A, #A3A3A3 (2), #B8B8B8 (2), #BEBEBE | 585, 2445/2535, 2376/2480, 592 | disabled / placeholdery / zegar | → #96959B (ikony/hint) |
| #C7C6CB | 8 | 833, 1521, 1524, 1552, 1562, 1606, 1687, 1848 | → `--m-line` |
| #E6E2EC | 10 | 750, 756, 757, 829, 851, 910, 914, 2389, 2489, 2501 | → `--m-border` |
| #ECEAF1 / #F5F1FB / #FDFBFF | 2 / 2 / 7 | 24, 95 / 96, 2349 / 97, 936, 2434, 2677, 15568, 16809 | → tokeny |
| #E5E7EB (4), #EDEDED (3), #EEE, #EDECF1, #E4E1EA, #E3E1E6, #DDD8E6, #D8D5E2, #D8D5DF, #DADADA, #DCDCDC, #D4D4D4, #D9D9D9, #D0D0D0, #DADCE0 | 1–4 ea | 485, 590, 647, 4636; 2372, 2474, 2648 (tła .lg-metric/.lg-set/.lg-mini); 2219; 2017; 2526; 2545; 2506; 1213; 845; 2397; 2414; 2481; 587; 76 (--border); 823 (Google btn) | cienkie linie/obwódki → #E6E2EC (--m-border); #EDEDED tła GYM → #ECEAF1 (--m-bg) (widoczna zmiana: ciepły szary → lilak); #DADCE0 (Google) zostaje |
| #F7F6F8, #F7F7F8, #F4F2F2, #F5F5F5 (--light-2), #EAE2FB, #E2E2E1 | 2,1,1,1,1,2 | 2545/2552, 824, 2479, 75, 1216, 2323/2329 | → #F5F1FB (--m-panel) / #ECEAF1; #E2E2E1 tło html GYM → decyzja |
| #CFCFCF, #6F6F73, #8B8B90 | 4,2,2 | 2568–2570 (szachownica podglądu przezroczystości karty share) | zostaje (nie UI) |
| #1C1C1C, #1C1C1E, #221B17, #2B2B30, #3C4043 | 1 ea | 888 (fallback .wn-hero), 826 (Apple :active), 15925 (kropka PR), 15518 (tor pierścienia Statystyk), 823 (tekst Google) | zostaje / decyzja dla 15518 i 15925 (ciemne akcenty Statystyk, ew. #343941) |
| #666, #F6F4F4 (4), #E5E7EB | | 4621, 4634 (SVG „dodaj”) | SVG, → #FDFBFF/#E6E2EC przy okazji |

### 2f. rgba / gradienty (grupy)
- `rgba(255,255,255,.x)` ~70 użyć (szkło GYM, chipy, nakładki) — zostaje (białe półprzezroczyste).
- `rgba(44,39,39,.x)` 14 użyć (nav tło 411 `.9`, glow 252, share 16476, cienie tekstu `.6/.71/.8` l. 625–652, 1522, 1523, 1761, 2374–2391, 2475, 2524–2525, 2649–2652) — pochodna #2C2727; po scaleniu → `rgba(52,57,65,x)` (wariant już istnieje: .77/.8/.82/.88 w 451 i okolicy).
- `rgba(52,57,65,x)` 8 — pochodna --m-ink, zostaje.
- `rgba(0,0,0,x)` ~25 — cienie, maski; zostaje.
- `rgba(251,236,227,0)`, `rgba(244,190,205,x)`, `rgba(247,190,110,x)`, `rgba(255,176,120,.85)`, `rgba(163,163,163,.39)`, `rgba(128,128,128,.14)`, `rgba(247,190,110,.55)` — poświaty tła GYM/Statystyk/kometa (2131, 2329, share) — niepasujące, decyzja przy mockupach.
- Gradienty literalne: 676/768/1120 (AI), 2431 (AI karta), 2329/315 (tło GYM), 15524/15568/15569 (rampy), 15638/15694 (słupki), 2568 (conic).
- `hsl()`: tylko w kodzie Chart.js i zmiennych JS (nie literały UI).

### 2g. Stary motyw (DO WYCIĘCIA / stan)
`:root` l. 71–82: `--bg #2c2727`, `--card #5d5b5b`, `--card-2 #3e3939`, `--light #f6f4f4`, `--light-2 #f5f5f5`, `--border #d0d0d0`, `--orange #f15a23`, `--orange-pill #ffc4ae`, `--tip #f7d7cc`, `--text #f6f4f4`, `--text-dark #2c2727`, `--muted rgba(255,255,255,.6)`.
Użycia (var): `--orange` 31, `--text-dark` 30, `--light` 14, `--light-2` 12, `--border` 9, `--bg` 3, `--card` 3, `--tip` 3, `--text` 1; `--card-2`, `--orange-pill`, `--muted` 0.
- Do wycięcia całkiem: `--card-2`, `--orange-pill`, `--muted`, `--card` (zostaje 1 użycie: .rotate-lock? nie — 952/596 martwe), reguły martwych klas z listy 0.2.
- NIE wycinać bez migracji: `--orange`, `--text-dark`, `--light-2`, `--border`, `--tip`, `--bg`, `--text`, `--light` — używane przez `.onboard-box` (657–668, 958–968), `.nav-item` (416–429), `.rotate-lock-overlay` (941–944), `body` (130–131), inline `style` l. 3898, 3920. Najpierw przepiąć te klasy na tokeny --m-*, potem usunąć.

## 3. Proponowany blok :root (tekst, nie wdrażać)

```css
:root{
  /* Pomarańcz */
  --m-orange:#ff3300;        /* główny akcent */
  --m-plan-c-easy:#ff6343;
  --m-plan-c-mid:var(--m-orange);
  --m-plan-c-hard:#cd1200;   /* też błąd */
  --m-danger:var(--m-plan-c-hard);   /* alias: #C00/#F00/#E5484D */
  --m-red-page:#dd2b17;
  --m-orange-ink:#801a00;
  --m-orange-tint:#f1d7cb;
  --m-orange-tint-2:#ffe9e3;
  /* Granat */
  --m-plan-hard:#2642a4; --m-plan-mid:#3b63cb; --m-plan-easy:#708fe1; --m-plan-accent:#6891ff;
  --m-navy-tint:#b7c0e1; --m-navy-ink:#0d1637;
  /* Niebo */
  --m-sky:#5da9e9; --m-sky-ink:#2f5575; --m-sky-tint:#c9e2f8;
  /* Mięta */
  --m-mint:#2cda9d; --m-reps:#1f996e; --m-mint-ink:#166d4f; --m-mint-tint:#b9f3de;
  /* Śliwka */
  --m-plum:#8e0045; --m-plum-ink:#470023; --m-plum-tint:#d9aac1;
  /* Bursztyn */
  --m-amber:#ffbb00; --m-amber-2:#ffc07a; --m-amber-tint:#ffd885;
  /* Trener AI */
  --m-ai-from:#fa1228; --m-ai-to:#5a00d1;
  --m-ai-border:linear-gradient(142deg,var(--m-ai-from) 0%,var(--m-ai-to) 83%);
  /* Grafit i powierzchnie */
  --m-ink:#343941; --m-muted-text:#6c6b78; --m-muted:#96959b;
  --m-line:#c7c6cb; --m-border:#e6e2ec;
  --m-bg:#eceaf1; --m-panel:#f5f1fb; --m-card:#fdfbff;
  /* do decyzji (patrz sekcja 5): */
  /* --m-navy-wash:#e7ecff;  --m-peach-bg:#fbece3;  --m-ai-glow:#a700ff; */

  /* Stare nazwy — zostają jako ALIASY do czasu migracji .onboard-box/.nav-item/rotate-lock */
  --orange:var(--m-orange);       /* było #f15a23 */
  --text-dark:var(--m-ink);       /* było #2c2727 */
  --light-2:var(--m-panel);       /* było #f5f5f5 */
  --border:var(--m-border);       /* było #d0d0d0 */
  --tip:var(--m-orange-tint-2);   /* było #f7d7cc */
  --bg:var(--m-ink);              /* tylko rotate-lock + body (zasłonięte) */
  --text:var(--m-card); --light:var(--m-card);
  /* usunąć: --card, --card-2, --orange-pill, --muted */
}
```
Przyp.: `--m-plan-c-hard` jako „błąd” bywa mylone z kolorem planu — alias `--m-danger` oddziela intencję. Gradient AI nie scalać z #CD1200.

## 4. Ekrany/komponenty realnie zmieniające wygląd (lista do mockupów)

**Zmieni się widocznie:**
1. **Modale `.onboard-box`** (onboarding 3776–3863, import planu 3929, „Zastąp wszystko”, confirm GYM 4117, nowe ćwiczenie 3871–3917): przyciski Zapisz #F15A23 → #FF3300; tekst pomocniczy #5B5555 → #6C6B78; „Zastąp” #E5484D → #CD1200; tło `.empty-workout-box`.
2. **Popup ćwiczenia `.exv2-*`** (1795–1906): notatka niebieska #2C3FAE → #2642A4, pigułka #A4BDFF → #B7C0E1, tytuły #2C2727 → #343941, chip grupy w `.swapv2-*`.
3. **GYM Trening/logowanie serii** (`.lg-*`, 2294–2690): tła #EDEDED → #ECEAF1 (zmiana ciepły szary → lilak), tag `.lg-tag` (granat), `.lg-wval.is-pale`, `.lg-tick.ahead`, `.lg-ov-note` (brzoskwinia + tekst #5A1A0C → #801A00), czerwień `.lg-warn`, karta Trener AI `.lg-ai` (fiolet).
4. **Ekran końca treningu `.gymfin-*`** (309–370): tło #FBECE3, kafle mint/śliwka, obwódki #F1D7CB.
5. **Statystyki `.statsv2-*`**: rampy pierścienia/YTD (#FF8A3D→#FF6343, #FFAB63→#FFC07A), słupki gradient (#FF8843), kropka PR, tag PR (#FFB608→#FFBB00), delty #FFD885.
6. **Karta share / canvas** (16461–16880): kolory tekstu/ikon, glow #F15A23 → #FF3300.
7. **Konto/Feedback/Zmiany `.acct-*`, `.fbv2-*`, `.wn-*`, `.chl-*`**: #2C2727 → #343941, #C00 → #CD1200, chipy #FFE9E3.
8. **Plan edytor `.pev2-*`** i **Plany `.plansv2-*`**: #5B5555, #C00, #F00 (swipe-delete), #F5B942 (swipe-share → #FFBB00), obwódki #C7C6CB.
9. **Dolne menu / toast**: bez zmian koloru (kulka --m-orange), toast #000 zostaje.

**Nie zmieni się (lub niewidocznie):** Dashboard (`--m-*` tokeny, 5 użyć plan-accent, AI-karta tylko literał gradientu), Historia (kalendarz --m-plan-accent; zmiana tylko #2C2727 w nagłówkach karty i #EDECF1), Plany lista (karty przez tokeny), loadv2 (rgba(255,51,0)), rotate-lock, wszystkie martwe widoki.

## 5. Decyzje wymagane od Macieja

1. #2C2727 (36×) → scal z #343941? (rekomendacja: tak; tytuły popupów staną się lekko chłodniejsze/jaśniejsze).
2. #5B5555 (10×) → #6C6B78 (jaśniejszy szary; kontrast spada z ~7:1 do ~5:1, nadal AA).
3. Ciepłe szare tła GYM #EDEDED/#F4F2F2/#F7F6F8 → lilak #ECEAF1/#F5F1FB?
4. Fiolet AI-karty w GYM (#3A0058/#A700FF/#DE74FF + poświata) — zostawić czy zbliżyć do #5A00D1?
5. Bardzo jasne granaty (#E7ECFF/#DFE6FF/#E4EBFF) — nowy `--m-navy-wash` czy #B7C0E1 (ciemniejsze)?
6. #FBECE3 (tło ekranu końca/GYM, 3×) — nowy `--m-peach-bg` czy #FFE9E3?
7. Rampy Statystyk (#FF8A3D/#FFAB63/#FFE0BA): zmiana zmieni gradient komety — scalać czy zostawić jako jedyny „wyjątek wizualizacji”?
8. `--orange` (stary) → alias #FF3300: potwierdzić, że przyciski modali mogą stać się #FF3300.

## 6. Flaga kontrastu (tylko informacja, bez poprawek)

Obliczenia orientacyjne WCAG: biały na #FF3300 ≈ 3,7:1; biały na #FF6343 ≈ 2,9:1; biały na #6891FF ≈ 3,0:1; #FF3300 na #F5F1FB/#FDFBFF ≈ 3,3–3,7:1 (norma AA tekst < 18px: 4,5:1).

**Mały biały tekst na #FF3300** (`--m-orange`): `.plan-pill` 14px (211), `.gymfin-cta` 14px (370), `.acct-photo-pick` 12px (743), `.acct-cloud-cta` 12px (818), `.gymv2-edit-plan` 12px (1259), `.gymv2-save` 16px (1360), `.plansv2-customize-apply`/`.pev2-select-mode-btn`… (patrz niżej), `.pev2-save-fab` 16px (1698), `.exv2-btn-fill`/`.exv2-submit`/`.swapv2-submit` 14–16px (1862–1903), `.statsv2-ex-all-btn` 12px (2164), `.statsv2-range-chip.active` (2201), `.lg-key-ok` 14px (2301), `.gy-ok` (2336), `.lg-circ.fill`, `.lg-step`, `.lg-set-c`, `.lg-chip.rest`, `.cg-seg button.active`, `.lg-add.lg-tm-main`, `.lg-add.lg-ov-start`, `.sh-main` 14px, `.gy-confirm-box .btns .save`, `.onboard-actions .save` (665, #F15A23), `.feedback-type.active`, `.dash-hero`, `.plansv2-choice-chip.active`, `.pev2-day-chip.active`, `.dash-badge.fill`.

**Mały biały tekst na #FF6343** (`--m-plan-c-easy`): `.plansv2-btn-fill` (1392), `.plansv2-customize-apply` 14px (1531), `.pev2-select-mode-btn` 12px (1657), `.pev2-section-num` (1695), `.exv2-btn-fill` 14px (1862), karty planów własnych (`PLANSV2_CUSTOM_COLOR_BY_DIFFICULTY`, l. 12669).

**Mały biały tekst na #6891FF** (`--m-plan-accent`): `.dash-week-day.done` (1098, cyfra dnia), `.histv2-cal-day.has-log` (1958, cyfra dnia 600) — tekst dat; zaznaczone/zaplanowane dni.

**Mały pomarańczowy tekst na jasnym tle** (#FF3300 na białym/lilak/#FFE9E3): `.gymfin-title` 11px (326), `.acct-soon` 11px (751), `.acct-cloud-mode-link` 12px (820), `.acct-revert` 12px (839), `.histv2-wkcal-chip` 11px (855), `.chl-ver` 11px (919), `.plansv2-customize-dni-value` 13px (1504), `.pev2-select-action` 12px (1668), `.exv2-tip .lbl` 12px (1811; na czarnym — OK), `.exv2-warn` 12px (1863), `.lg-tip-l` 11px (2436; na ciemnym), `.lg-how-l` 11px (2549), `.empty-workout-ok` 13px (532), `.ex-popup-box .popup-warn` 12px (540, martwy), `.lg-wval`, `.lg-tm-clock.is-run` (duży), `.gy-plan-name` 30px (OK, duży).
Oprócz tego `--m-muted` #96959B (3:1) użyty jako kolor tekstu 11–13 px w wielu miejscach (56 użyć tokenu, w tym `.chl-*` l. 914 i etykiety statystyk) — poniżej AA.
