# Karta specyfikacji: ekran PROFIL (Mekkio)

Etap 1 (audyt + karta). Data: 2026-10-14. Stan kodu: `main` = 4.66.0 lokalnie (commit e30420b), niewypchnięta. Ta karta niczego nie zmienia w `index.html`. Push tylko po pytaniu do Macieja.

Źródła: Figma `FugBXsSVc6rQIDmLXwepMv`, sekcja „Profil” (560:10329). Dane pobrane przez `figma-rest` (get_figma_data, depth 12-14, wszystkie 5 ramek) i oficjalny Figma MCP (get_screenshot 1x dla wszystkich ramek; get_design_context dla 560:8932 zwrócił 128 kB razem z tłem 4694 px, więc wartości liczone z get_figma_data, który zawiera te same rozmiary/kolory/fonty/teksty). Zrzuty: `mockups/profil-v2/figma/` (5 plików PNG, 375 px szerokości, 1x).

Proces, który ta karta odzwierciedla: audyt Figmy vs kod (11 px, 44 pt, tokeny `--m-*`) → karta → wdrożenie → zrzuty przed/po → copy przez /człowiek → wersja + wpis w `docs/CHANGELOG.md` → pytanie o push.

## 0. Najważniejsze ustalenia (czytaj najpierw)

1. **Nazwy ramek w Figmie są pomylone względem treści.** Ramka „03-rekordy-arkusz” (560:9642) to arkusz **ODZNAKI** (siatka 2 kolumny kart odznak). Ramka „05. Profil” (560:8932) to arkusz **REKORDY** (przełącznik Miesiące/Ćwiczenia, karuzela miesięcy, lista rekordów miesiąca, tekst o przesuwaniu miesięcy i tapnięciu w rekord, przycisk „WSZYSTKIE CASY”). Rekordy = nie kalendarz ani odznaki; to rekordy ćwiczeń pogrupowane po miesiącach. „Tapnij w rekord żeby zobaczyć treing” = otwarcie szczegółu treningu, w którym padł rekord (patrz pytanie 3).
2. **Menu dolne jest narysowane we wszystkich ramkach Profilu** (`Menu_stany`, 336×62), a decyzja P1 mówi, że w Profilu jest ukryte. Dodatkowo w kodzie `goRoute()` ustawia `#bottomNav` `display:flex` przy każdej trasie i Edytor planu ani GYM menu NIE ukrywają (sprawdzone). Ukrycie w Profilu to więc nowe zachowanie, a nie „jak Edytor/GYM”; wymaga też zabezpieczenia w `hideNavOnKeyboard` (focusout ustawia `display:flex`). Patrz pytanie 1.
3. **Figma pokazuje rekord jako „42.5 kg × 10” z kropką dziesiętną.** To stary format; obowiązująca definicja (commit ffd34ae/e30420b) to sam ciężar bez serii, z przecinkiem: „42,5 kg”. Wdrażamy wg definicji, nie wg Figmy (feedback_figma_vs_code_source_of_truth).
4. **Popupów z `popupy-v2` w Figmie prawie nie ma** (tabela w sekcji 7). W zakresie wdrożenia są tylko dwa arkusze, które Maciej narysował: Rekordy i Odznaki. Reszta zostaje na dzisiejszych oknach, poza zakresem, dopóki nie przyśle ramek.
5. Dwie literówki i jedna niezgodność copy w Figmie: „treing”, „WSZYSTKIE CASY”, „Paździenik 2026”; w ramce gościa „Chrzest żelaza” (zatwierdzona nazwa: **Chrzest Żelaza**).
6. Wiersze „MEKKIO+” („Trener AI” z pastylką oraz „Odblokuj Trenera AI i adaptację planu”) są w Figmie, a okno Mekkio+ jest ODŁOŻONE, `isPremium()` zwraca dziś `true` (index.html:14275). Pokazanie „Odblokuj” byłoby nieprawdą. Patrz pytanie 4.
7. Wiersze ustawień, których kod nie ma i nie wolno dodawać (bez nowych pól): „Jednostki: Kilogramy”; „Język: Polski” (przełącznik języka ODŁOŻONY). Patrz sekcja 2.6.

## 1. Mapa: ramka Figma → komponent do zbudowania / przerobienia

| Ramka Figma | Co to jest | Komponent / funkcja | Rodzaj |
|---|---|---|---|
| 01-profil-zalogowany (560:6731), 375×1681 | pełny ekran Profil, użytkownik z kontem lub z imieniem | nowa sekcja `#view-profile-v2` + `renderProfileV2(animate)`; trasa `profile-v2` w `goRoute()` | NOWE |
| 02-profil-nowy-gosc (560:7900), 375×1314 | ten sam ekran, stan „nowy gość” (brak imienia i zdjęcia, brak konta, 0 treningów) | ten sam `renderProfileV2` z gałęzią stanu pustego | NOWE (stan) |
| „05. Profil” (560:8932), arkusz 355×510 na ekranie | arkusz REKORDY (Miesiące / Ćwiczenia) | `openProfileRecordsSheet()` na `.m-sheet` + `mSheetDrag` | NOWE |
| 03-rekordy-arkusz (560:9642), arkusz 355×510 | arkusz ODZNAKI (siatka kart) | `openProfileBadgesSheet()` na `.m-sheet` + `mSheetDrag` | NOWE |
| 05-ustawienia (560:8368), 375×1145 | ekran USTAWIENIA (drill z zębatki) | `#view-profile-settings-v2` + `renderProfileSettingsV2()`; trasa `profile-settings-v2` | NOWE, zastępuje stary `#accountOverlay` (panel boczny) |

Co się dzieje ze starym panelem konta (`#accountOverlay`, index.html:3480-3549, `renderAccountPanel`, `openAccountPanel`, `closeAccountPanel`):
- `openAccountPanel()` zostaje i zmienia ciało na `goRoute('profile-v2')` (kontrakt nazwy i bezargumentowego wywołania bez zmian; wywołują go 5 awatarów w nagłówkach ekranów i index.html:6730).
- `acctSheetOpen/acctSheetClose`, `openWeightSheet` bez zmian. Istniejące arkusze `weightSheet`, `bodyDataSheet`, `aiPrefsSheet`, `nameEditOverlay`, `authSheet`, `reminderSheet`, `healthSheet`, `changelogHistorySheet` zostają jak są i są otwierane z nowego ekranu (zobacz sekcja 7).
- ID hooków `acct*` (`acctWeightV`, `acctHeightV`, `acctAgeV`, `acctSexV`, `acctCloudCta`, `acctCloudSignedIn`, `acctCloudEmail`, `acctReminderV`, `acctHealthV`, `acctSoundToggle`, `acctName`, `acctSub`, `acctVer`, `acctChlVer`, `acctFootData`, `acctBackupHint`, `acctDangerZone` itd.) muszą nadal istnieć i być wypełniane przez `renderAccountPanel()`, bo czytają je `renderAcctCloudCard`, `renderReminderRow`, `renderHealthRow`, `setSoundOn`, `saveWeightSheet`, `saveBodyDataSheet`, `saveNameEdit`. Rekomendacja: nowe ekrany dostają te same ID tam, gdzie pełnią tę samą rolę (każde ID tylko raz w DOM, więc stary `#accountOverlay` znika w kroku K5 po przeniesieniu ID). Do tego czasu oba ekrany nie mogą współistnieć z tymi samymi ID.
- `ACCT_SHEETS` (index.html:5751) i `acctLockCheck` zostają; `accountOverlay` wypada z listy dopiero w K5.
- `openAiPrefsSheet` ukrywa `#accountOverlay` (index.html:5993) i `closeAiPrefsSheet` go przywraca; `openAuthSheet`/`openHealthSheet` wołają `closeAccountPanel()`. Te wywołania trzeba przepiąć (na ekranie nie ma co chować; sheet ma po prostu nałożyć się na ekran). To najłatwiejsze miejsce na regresję.

## 2. Pełna lista elementów z wartościami i źródłem

Skróty: **T** = wartość zgodna z tokenem z `:root` (używać tokenu), **F** = wartość tylko z Figmy (brak tokenu), **K** = brak w Figmie, bierzemy z istniejącego kodu, **?** = do ustalenia. Fonty: Geist (vendored, `vendor/geist/geist.css`); Figma używa wag ExtraLight 200, Regular 400, Medium 500, SemiBold 600. Do sprawdzenia w kroku K1, czy `geist.css` ładuje wagę 200 (jeśli nie, liczby wyjdą grubsze niż w Figmie).

### 2.1 Tło i nagłówek (wspólne dla ramek 01, 02, 05-ustawienia)
| Element | Wartość z Figmy | Źródło |
|---|---|---|
| Tło strony: zdjęcie „Powiększenie zdjęcia-2 2” 566×1007 przesunięte o x -95, gradient liniowy 144° biały 78%→0 | obraz + gradient | ? Czy to ten sam obraz co `icons/backgrounds/dashboard.webp`? Porównać wizualnie w K1. Jeśli tak, użyć istniejącego mechanizmu `body.dashboard-bg` jako wzoru, nowa klasa `body.profil-bg` |
| Nakładka gradient 180° `rgba(251,236,227,0)` 2% → `#FBECE3` 8% → `#E2E2E1` 100%, start y=214 | | T: `--m-page-top` #fbece3, `--m-page-bot` #e2e2e1 |
| Tytuł „PROFIL” / „USTAWIENIA”: Geist SemiBold 12, tracking 0.0833em, wersaliki, `#343941`, środek x≈159-199, y=46 | | font 12 = T `--m-fs-xs`; kolor T `--m-ink`; tracking F |
| Przycisk wstecz 40×40, okrąg, `backdrop-filter:blur(8.03px)`, ikona CaretLeft 18×18, pozycja x=11 y=30 | | F; cel dotyku 40 (poniżej 44 pt, patrz sekcja 8); istniejący wzorzec `.v2-hdr-back` ma 40 px |
| Przycisk zębatki 40×40, fill `rgba(255,255,255,.6)`, obrys `#F1D7CB` 0.41 px, blur 5.96, ikona Gear 18, pozycja x=325 y=30 | | kolor obrysu T `--m-orange-tint`; reszta F; wzorzec jak `.dash-acct-btn` (40 px + `::after{inset:-4px}` daje cel 48) |
| Menu dolne `Menu_stany` 336×62 (narysowane) | | **konflikt z P1, patrz 0.2 i pytanie 1** |
| Szary guzik „ZAPISZ PLAN” 323×55 na y=3916 w każdej ramce | pozostałość z kopiowania ramki z Edytora planu | IGNOROWAĆ (poza ekranem) |

### 2.2 Blok tożsamości (01 i 02)
| Element | Wartość | Źródło |
|---|---|---|
| Awatar 60×60 okrąg, x=11 y=97; fill `#FF3300`, obrys `#F1D7CB` .75; zdjęcie wypełnia okrąg | zalogowany | T `--m-orange`, `--m-orange-tint`; zdjęcie z `avatarDataUrl` (K: `applyAvatarEverywhere`, dodać nowy selektor do `ACCT_ENTRY_SEL`) |
| Awatar gościa: fill biały, obrys `#FF3300` .75 **przerywany 4,2**, opacity .9, ikona Plus 26.28 w `#FF3300` | nowy gość | T kolory; przerywana obwódka jako `border:.75px dashed` (w CSS `dashed` nie daje dokładnie 4,2; tolerancja do akceptacji); ikona Plus: sprawdzić rejestr `data-ph` |
| Imię: Geist ExtraLight 200, **36 px**, `#343941`, x=90 y=106, szer. 185 | „Maciek” / „Cześć” | kolor T `--m-ink`; **36 px nie ma tokenu** (jest `--m-fs-2xl` 30, `--m-fs-hero` 40) → F, zgłoszone; propozycja: nowy token `--m-fs-profile-name:36px` z wpisem do Design Guide (decyzja Macieja) lub 40 hero |
| Podpis: Regular 12, `#6C6B78`, odstęp 7 px | „W Mekkio od września 2026” / „Dodaj imię i zdjęcie” | 12 = T `--m-fs-xs`; kolor T `--m-muted-text`. Dane „od września 2026”: ? brak pola „data dołączenia”; bez nowych pól → liczyć jako najwcześniejsza data z `workouts`/`weightLog`; gdy brak danych ukryć podpis. Do potwierdzenia (pytanie 5) |

### 2.3 Kafel statystyk (01, 02) „Background” 355×80, r=12
- fill `rgba(255,255,255,.84)` = T `--m-glass`; obrys .5 px `#F5F1FB` = T `--m-panel`; blur 3.8; padding 12/23; trzy kolumny 65,33 px rozdzielone pionowymi liniami 0,5 px `#F1D7CB` (T `--m-orange-tint`) wysokości 66.
- Liczba: ExtraLight 200, 28 px, tracking -0.0357em. 28 px: brak tokenu (jest 24 i 30) → F. Kolory: TRENINGI `#343941` (T `--m-ink`), OBJĘTOŚĆ `#CD1200` (T `--m-danger`/`--m-plan-c-hard`), REKORDÓW `#FF3300` (T `--m-orange`).
- Etykieta: Medium **10 px**, tracking .1em, wersaliki, `rgba(52,57,65,.82)` (brak tokenu, = ink 82%) → **narusza min. 11 px** (sekcja 8). Teksty: „TRENINGI”, „OBjętość” (nieregularna wielkość liter w Figmie, w UI wersaliki: „OBJĘTOŚĆ”), „REKORDÓW”.
- Stan gościa: wszystkie trzy liczby w `#96959B` (T `--m-muted`) „0”, „0 t”, „0”; etykiety `#96959B`. UWAGA: `--m-muted` jest wg tokenów tylko dla ikon i podpowiedzi, a tu to liczby (kontrast ~2,8:1). Zgłoszone.
- Źródło danych (tylko odczyt): `dashboardModel()` / `workouts` (liczba zapisanych treningów, `workoutSumStats` sumy objętości, liczba rekordów = długość `recordTimeline()`), bez nowych pól. Objętość: format „98,4 t” (>=1000 kg w tonach; użyć istniejącego `formatDashNum` wzorca z dashboardu).

### 2.4 Karta „Zapisz swoje dane” (tylko 02)
- Karta `hero-activity-tile` r=12, padding 18, fill `--m-glass`. Tytuł Regular **18** `#343941` (18 px: brak tokenu, jest 16 i 20 → F). Opis Regular 12 `#6C6B78`: „Zaloguj się, żeby nie stracić treningów po zmianie telefonu.” Przycisk 323×55 pill r=74, fill `#FF3300`, tekst Medium 14, tracking .12em, biały: „ZALOGUJ SIĘ”.
- Źródło: pokazywana gdy `!(cloudSession && cloudSession.user)` i `SUPABASE_CONFIGURED`. Akcja: `openAuthSheet('login')`; to jedyne wejście w logowanie SIWA/Google (są wewnątrz `authSheet`), więc przeżywają. Przycisk dostaje ID `acctCloudCta` (kontrakt hooka); po zalogowaniu `renderAcctCloudCard` ukrywa kartę.
- Wysokość przycisku 55 = istniejący wzorzec `.gymfin-cta` (55 px). T dla koloru, radius 74 vs `--m-r-pill` 999: ten sam efekt wizualny.
- Uwaga: zalogowany „Maciek” z kontem nie ma tej karty (01). Użytkownik z imieniem bez konta: **brak ramki w Figmie** (?). Propozycja: układ 01 + karta „Zapisz swoje dane” u góry (pytanie 5).

### 2.5 Sekcje ekranu głównego
Nagłówek sekcji: Medium 11, tracking .0909em, wersaliki, `#343941` (T `--m-fs-2xs`, `--m-ink`). Link „WSZYSTKIE ›”: ten sam styl w `#FF3300` + CaretRight 12×12. Odstęp nagłówek–karta 8, między sekcjami 20, karta r=16 padding 18, `--m-glass`, blur 3.8, wiersze rozdzielone linią 0,5 px `#96959B` (T `--m-muted`), odstęp wiersza 12 / 26,67.

**REKORDY** (01 pełny; 02 stan pusty)
- 01: 3 wiersze: nazwa ćwiczenia Medium 14 `#343941`, pod spodem data Regular **10** (narusza 11), po prawej wynik Regular 12 + pastylka delty (fill `#B9F3DE` T `--m-mint-tint`, tekst `#166D4F` T `--m-mint-ink`, Regular 11 tracking .04em, 19 px wysokości, r=99). Przykład Figmy: „Chest Press / 13 paź / 42.5 kg × 10 / +2 kg”.
- Dane: 3 najświeższe rekordy z `recordTimeline()` (kind=weight; wartość = sam ciężar „42,5 kg”, delta = `rec.delta` w tej samej jednostce, „+2 kg”). Silnik: `recordTimeline`, `exerciseRecords`, `workoutRecordsFor`; rekord objętości treningu i objętości ćwiczenia to osobne rodzaje (nie mieszać w ten rząd, chyba że Maciej zdecyduje inaczej, pytanie 3). „Prognoza maxa” (`projectedMax`) nigdy tu.
- Wiersz tapnięty → szczegół rekordu (popup 07, **brak w Figmie**, patrz sekcja 7).
- 02 stan pusty: tytuł 18 „Tu pojawią się Twoje rekordy.”, opis 12 „Pierwszy zobaczysz po pierwszym treningu.”, przycisk z obrysem `#FF3300` 1 px, tekst `#FF3300`, wysokość 55: „ZACZNIJ TRENING” → `navTap('gym')`/`goRoute('gym-v2')`.
- „WSZYSTKIE ›” → arkusz Rekordy (2.7).

**ODZNAKI**
- Nagłówek + pastylka licznika 62×19, fill `#708FE1` (T `--m-plan-easy`), biały tekst 11 → „5/10”; w 02 „0/10”.
- Karta: rząd 5 ikon 51×51 (zdobyte: kolorowe z pomarańczowym pierścieniem; niezdobyte: szare z pierścieniem postępu). Pod rzędem linia 0,5 px i dwa wiersze: nazwa Medium 14 + data Regular 12 `#6C6B78` po prawej („Nokaut Tygodnia 13 paź”, „Wagon Towarowy 98,4 / 100 t”). Interpretacja: pierwszy wiersz = ostatnio zdobyta (`dashBadges().latest`), drugi = następna do zdobycia z postępem (`.next`, `value / goal`). **Które 5 ikon w rzędzie: ?** (Figma 01 pokazuje 3 zdobyte + 2 niezdobyte z różnym postępem). Propozycja: 5 pierwszych wg tej samej kolejności co w arkuszu (lub: 3 ostatnio zdobyte + 2 najbliższe); do decyzji (pytanie 5).
- Stan 02: 5 szarych ikon, pod nimi „Chrzest Żelaza” (zatwierdzona pisownia) + „Zapisz pierwszy trening.” (opis z `DASH_BADGES[].text`, to sam tekst „Pierwszy trening zapisany w Mekkio.” jest opisem zdobycia, więc dla stanu pustego potrzebna oddzielna fraza „do zrobienia”, ?) → nowe copy, patrz sekcja 6.
- Dane: wyłącznie wspólny silnik odznak wyciągnięty z `dashboardModel` (funkcja `dashBadges(plan, todayIso)`, index.html:14490, zwraca `{latest,next,earned,total,all}`; nie kopiować `DASH_BADGES`, nie dodawać drugiej tablicy). Ikona: P3, `icons/badges/<id>.svg` zastępuje wspólną grafikę (`icons/badges/medal-barbell.svg` istnieje); niezdobyte: szare liczone w kodzie; pierścień postępu rysowany kodem (SVG stroke-dasharray lub conic; animować tylko transform/opacity, więc pierścień statyczny, rysowanie bez animacji). `earnedOn` nie do chmury. Bez znacznika „nowa”.
- Grafika 51×51 w Figmie ma ikonę sztangi z promieniami; wymiary SVG do pobrania z Figmy w K3 (asset: `download_figma_images`) — **?** czy Maciej dostarcza własne SVG (P3) czy używamy `medal-barbell.svg`.

**CIAŁO**
- Karta 1 (hero-activity-tile r=12, padding 18, `--m-glass`): etykieta „WAGA” Medium 11, opacity .6; liczba „83,1” ExtraLight **42,73 px** (nieokrągła wartość z skalowania; F, brak tokenu; proponuję 42 lub `--m-fs-hero` 40) + „kg” Regular 14,69 opacity .77; pod spodem strzałka 12×12 + „−1,1 kg” w `#2CDA9D` (T `--m-mint`; **tekst mięta na białym ~1,9:1, nie przechodzi kontrastu**; zgodnie z tokenami `--m-mint-ink` #166d4f jest właściwy dla tekstu; zgłoszone) + „/ 30 dni” Regular 11 `#343941`. Po prawej wykres 142×33 linia 1,91 px w `#2CDA9D` (T `--m-mint`, linia = grafika, OK) z podpisami osi „sie / wrz / paź” Regular 11.
- Dane (tylko odczyt): `dashWeightBlock(todayIso)` (index.html ~14606) zwraca `kg`, `delta30`, `points` — dokładnie to, czego potrzebuje; `currentWeightKg()`, `weightLog`. Strzałka w Figmie jest nazwana „ArrowUp”, a narysowana w dół dla spadku: kierunek wg znaku `delta30`.
- Przycisk „DODAJ WAGĘ” 323×55 pill `#FF3300` biały Medium 14 tracking .12em → `openWeightSheet()` (kontrakt). Wartość wagi w kafelku dostaje ID `acctWeightV`.
- Pod wykresem rząd 84 px: „182 cm” / „45 lat” / ikona płci (GenderMale 34,57), ExtraLight 28 w `#FF3300` (T `--m-orange`; pomarańcz na białym = znany wyjątek wg Figmy), etykiety jak w 2.3. Tap → `openBodyDataSheet()`. ID `acctHeightV`, `acctAgeV`, `acctSexV` (dziś `textContent`, tu liczba z jednostką; ikona płci: dla `bodyData.sex==='f'` ikona żeńska — **brak w Figmie** (?), „GenderMale” tylko dla m; dla braku danych: „—”).
- 02 stan pusty: tytuł 18 „Dodaj wagę, żeby śledzić zmiany”, wiersze „Waga / Dodaj pierwszy wpis ›” (→ `openWeightSheet`) i „Wzrost, wiek, płeć / Do wyliczania kalorii ›” (→ `openBodyDataSheet`). Tytuł wiersza Medium 14, podpis Regular **10** (narusza 11), chevron 16×16.

**CELE I TRENER** (tylko 01): wiersze „Cel treningowy / Masa ›” (→ `openAiPrefsSheet`; dane `aiPrefs.goal` z `AI_GOAL_LABELS`), „Czego unikać / Obciążanie kolana ›” (→ `openAiPrefsSheet`; `aiPrefs.avoid` obcięte do 24 znaków jak dziś), „Trener AI / Podpowiedzi po każdym treningu” + pastylka „MEKKIO+” (obrys `#FF3300` .8, tekst `#FF3300`, 79×19) ›. W stanie 02 sekcja nie występuje. Trener AI dla gościa bez treningów: ? (pytanie 4: wiersz Mekkio+ pomijamy). ID `acctAiGoalV`, `acctAiAvoidV`.

**POŁĄCZENIA** (tylko 01): „Apple Zdrowie / Waga i kalorie z zegarka” + pastylka „Połączono” (`#B9F3DE`/`#166D4F`) › → `openHealthSheet()`; widoczne tylko `IS_NATIVE && capPlugin('HealthPlugin')` (jak `renderHealthRow`); stan „Wyłączone” = brak pastylki lub pastylka szara (? w Figmie jest tylko „Połączono”); „Przypomnienie o treningu” + pastylka „PN, ŚR, PT • 18:00” › → `openReminderSheet()`; widoczne tylko `IS_NATIVE` (jak `renderReminderRow`); dni z `planActiveDays` planu + `workoutReminder.time`; stan wyłączony: brak pastylki (? brak w Figmie). Wiersze dostają ID `acctHealthV`, `acctReminderV`.
- Karta „MEKKIO+ / Odblokuj Trenera AI i adaptację planu ›” i „Ustawienia i konto / Język, dźwięki, kopia zapasowa, usuń konto ›” (→ ekran Ustawienia). Pierwsza: patrz pytanie 4 (rekomendacja: nie pokazywać). Druga: **podpis trzeba poprawić**, bo „Język” jest odłożony i „kopia zapasowa” zależy od stanu (patrz 6).
- Stopka „Mekkio 4.64.0”: Regular **10**, `#6C6B78`, wyśrodkowana → **dynamicznie z `APP_VERSION`** (dziś 4.66.0; ID `acctVer`), minimum 11 px.

### 2.6 Ekran USTAWIENIA (05-ustawienia, 560:8368)
Nagłówek: strzałka wstecz (bez zębatki) + „USTAWIENIA” (wyśrodkowane, szer. 81). Sekcje (karty jak wyżej, padding 18, r=16), od y=97 (ekran bez bloku tożsamości):

| Sekcja | Wiersz (Figma) | Źródło / akcja | Uwagi |
|---|---|---|---|
| POWIADOMIENIA I DŹWIĘK | Przypomnienie o treningu + pastylka „PN, ŚR, PT • 18:00” › | `openReminderSheet()`; tylko `IS_NATIVE` | jak 2.5; pastylka z `workoutReminder` |
| | Dźwięki / „Odliczanie przerwy i koniec treningu” + przełącznik 38×23 | `setSoundOn(!soundOn)`, ID `acctSoundToggle` (klasa `.acct-toggle`, knob transition `--m-dur-quick`) | przełącznik w Figmie: wymiary 38×23 vs kod 24 px kolumna knob (`.acct-toggle-knob` 24×24, szerokość?) → wizualnie zachować istniejący komponent; różnicę wymiarów zgłosić (?) |
| DANE I PRYWATNOŚĆ | Apple Zdrowie / „Waga i kalorie z zegarka” (bez chevrona i bez pastylki) | `openHealthSheet()` | Figma bez chevrona, mimo że w Profilu ma; ? czy tap ma działać. Rekomendacja: ma, i dostaje chevron (spójnie z Profilem) |
| | Pobierz moje dane / „Kopia zapasowa w pliku” › | `exportData()`; etykieta zależna od stanu jak dziś (`acctExportLabel`: gość „Twórz kopię zapasową”, konto „Pobierz moje dane”) | **wczytanie kopii (`acctImportRow`) nie ma wiersza w Figmie**, a dla gościa to jedyna droga przeniesienia danych → zostaje (K), propozycja: wiersz „Wczytaj kopię / Plik z kopią zapasową ›” ukryty dla zalogowanych (jak `impRow.hidden=inCloud`) |
| | Polityka prywatności › | link `./polityka-prywatnosci.html` (target _blank); MUSI przeżyć | |
| JĘZYK I JEDNOSTKI | Język / Polski ›; Jednostki / Kilogramy › | **brak w kodzie, ODŁOŻONE** | NIE budować; sekcja pomijana w tym etapie (nie ma ustawień do pokazania) |
| POMOC | Napisz do nas / „Opinia i pomysły” › | `closeAccountPanel(); openFeedbackV2()` → `openFeedbackV2()` | dziś „Podziel się opinią” |
| | Co nowego / „Historia zmian” + pastylka „4.64.0” (fill `#F1D7CB` T `--m-orange-tint`, tekst `#CD1200` T `--m-danger`) › | `openChangelogHistorySheet()`; wersja z `APP_VERSION` („4.66.0”, nie „v4.66.0”) | ID `acctChlVer` |
| KONTO | e-mail / „Zalogowany przez Apple” › | `cloudSession.user.email` (relay Apple → „Ukryty e-mail (Apple)” jak `renderAcctCloudCard`); dostawca: `cloudSession.user.app_metadata.provider` (do weryfikacji, kod go dziś nie czyta); ID `acctCloudEmail` | Chevron: ? brak akcji w kodzie (propozycja: bez chevrona, wiersz tylko informacyjny) |
| | Wyloguj się › | `signOutCloud()` **bez dialogu**, toast „Wylogowano” (kod już go pokazuje, index.html:6861) | W4 |
| | Usuń konto / „Trwale usuwa konto i dane w chmurze” › (tytuł czerwony) | `deleteAccountV2()` (używa `mConfirm`, dialog w stylu GYM = popup 11, już istnieje); ID `acctDangerZone`; MUSI przeżyć | kolor Figmy `#FA1228` (zmienna „Mekkio/Trener AI/Od”) **nie jest w paletach**; udokumentowany `--m-danger` = #cd1200; zgłoszone, użyć `--m-danger` |
| (stopka) | „Mekkio 4.64.0” | `APP_VERSION` | jak wyżej |

Sekcja KONTO (cała) widoczna tylko przy zalogowaniu (`cloudSession.user`); gość widzi w Ustawieniach kartę „Zapisz swoje dane” z przyciskiem ZALOGUJ SIĘ albo wiersz „Zaloguj się” (? brak w Figmie 05-ustawienia, bo narysowano tylko wersję zalogowaną; propozycja: ta sama karta co w 2.4 na górze Ustawień).

### 2.7 Arkusz REKORDY („05. Profil”, 560:8932), karta 355×510, r=33
Wspólna powłoka arkuszy Profilu (Figma): białe tło `#FFFFFF`, r=33 (kod: 34 px, `.m-sheet`; tolerancja 1 px, zostaje kod), cień 0 13 66 `rgba(0,0,0,.18)`, padding 0 16 16, odstęp 27, uchwyt 52,98×3,53 `#CCCCCC` na y=5, tytuł Geist SemiBold 12 tracking .0833em wersaliki `#343941` (**F; plan Macieja dla arkuszy mówi „tytuł wersalikami 20 px”**: konflikt wartości; zgłoszone, patrz pytanie 2), przycisk ✕ 40×40 okrąg fill `#FF3300` obrys `#FF9B82` .56 (**plan: obrys #FF3300**; różnica; zgłoszone), tło za arkuszem `rgba(65,65,65,.85)` blur 2 (kod: `.m-sheet-overlay` `rgba(52,57,65,.88)` blur 4,85 — zostaje kod, wspólna powłoka).
Zawartość:
- Przełącznik segmentowy: kapsuła `rgba(255,255,255,.6)`, obrys `#F1D7CB` .5, blur 7,23, padding 2, gap 4; aktywny segment fill `#FF3300` biały SemiBold 11, nieaktywny przezroczysty `#343941` SemiBold 11, padding 7/30, „Miesiące” / „Ćwiczenia”.
- Nawigacja miesiąca: strzałki 6,5×11,5 (czarne `#000000`: F, brak tokenu → użyć `--m-ink`), tytuł Regular 18 wyśrodkowany „Paździenik 2026” (**literówka: „Październik”**; nazwy z `MONTH_NAMES` w kodzie, więc poprawnie), pod nim dwie pastylki: „4 rekordy” (mięta) i „9 treningów” (fill `#C7C6CB` T `--m-line`, tekst `#343941`), potem kropki paginacji 4×4 (`rgba(163,163,163,.56)` opacity .7, aktywna 12×4 `#FF3300`), gap 3,45.
- Lista rekordów miesiąca: karta 323×155,59 r=12 padding 8/12, wiersze 27 px: nazwa Medium 14, data Regular **11** (tu 11, w ekranie głównym 10), wynik Regular 11 + pastylka delty 71,88×17,29.
- Podpis Regular **10** wyśrodkowany (2 linie): „Przesuń w lewo lub w prawo, żeby zmienić miesiąc.” / „Tapnij w rekord żeby zobaczyć trening.” (w Figmie „treing”) — **tekst o gestach**.
- Przycisk 323×55 z obrysem `#FF3300` 1 px, tekst „WSZYSTKIE CASY” (→ „WSZYSTKIE CZASY”, propozycja do /człowiek: zmienia widok na zakres bez miesięcy, ? co dokładnie robi; prawdopodobnie przełącza na zakładkę „Ćwiczenia” z rekordami życiowymi; do potwierdzenia, pytanie 3).
- Zakładka „Ćwiczenia”: **brak ramki** (?). Propozycja: lista ćwiczeń z rekordem życiowym wg `exerciseRecords(name).weight`, sortowana jak popup 09 „Sortuj” (nie w Figmie → bez sortowania w tym etapie).
- Gest: poziomy swipe miesięcy = **wzorzec `wireHistCalSwipeV2` / `statsV2CaroGoTo`** (track `translateX` 1:1 z palcem, `touch-action:pan-y`, blokada osi, rzut z prędkością WAAPI + `setTimeout` zabezpieczający, `MOTION.land`/`MOTION.exit`). Miesiące bez rekordów: ? (pomijać czy pokazać puste; propozycja: pokazywać tylko miesiące z rekordami, 8 kropek w Figmie sugeruje listę miesięcy od pierwszego treningu).
- Dane: `recordTimeline()` filtrowana po `date.slice(0,7)`; „N treningów” = liczba dni treningu w miesiącu z `workouts`; „N rekordów” = długość przefiltrowanej listy. Tylko rekordy ciężaru/powtórzeń/czasu; rekordy objętości osobno (nie w tej liście, chyba że Maciej zechce; pytanie 3).

### 2.8 Arkusz ODZNAKI („03-rekordy-arkusz”, 560:9642)
- Ta sama powłoka; tytuł „ODZNAKI” + pastylka „5/10” (`#708FE1`), ✕.
- Siatka 2 kolumny 323 px, gap 5/4, karty r=12 padding 12, fill `rgba(255,255,255,.84)`, obrys `#F1D7CB` .85, blur 3,1; zawartość: ikona 51×51 (wyśrodkowana), nazwa Medium 11 tracking .1818em wersaliki (zdobyta `#343941`, niezdobyta `#96959B`), opis Regular 11 centrowany `#6C6B78`/`#96959B` (szer. 105), na dole pastylka z datą („12 wrz 2026”, mięta) albo pasek postępu 95×6 z „11 / 25” (niezdobyta).
- Lista: 10 kart, wg kolejności id: first, fullweek, firstpr, pr25, beatweek, ton, bodyweight, growth3, allround, gryf (kolejność w Figmie: Gryf Mocy, Pełny Etat, Pierwsza Krew, Ściana Chwały, ... — **kolejność inna niż w kodzie i niż przypisanie nazw**: w Figmie „Gryf Mocy” ma tekst „Pierwszy trening zapisany w Mekkio.” (to opis odznaki `first` = „Chrzest Żelaza”, a `gryf` = „10 zapisanych treningów”). To błąd w Figmie (nazwa pomylona z opisem), użyć nazw i opisów z `DASH_BADGES`. Zgłoszone.
- Tap w kartę → szczegół odznaki (popupy 05/06, **brak w Figmie**, poza zakresem).
- Dane: `dashBadges().all` (`earned`, `earnedOn`, `value`, `goal`, `ratio`); data = `fmtDate`-owy skrót „12 wrz 2026”; pasek postępu: szerokość przez `transform:scaleX()` (nie `width`, CLAUDE.md pkt 9). Ukończone: `fullweek` pokazuje „value/goal” dni tygodnia (nie liczba rekordów), `bodyweight` pokazuje kg, `ton` pokazuje t; format postępu per id: do ustalenia przy implementacji z wartości `value/goal` (jednostki: ?).
- Przewijanie: wysokość 510 + 3 rzędy kart > arkusz, więc treść sheetu przewija się wewnętrznie (`overflow-y:auto`), `mSheetDrag` obsługuje „scrolledUnder”.

## 3. Stany i źródło danych (bez nowych pól, tylko odczyt, bez nowych kluczy synca)

| Stan | Warunek | Co widać | Dane |
|---|---|---|---|
| A. Zalogowany z imieniem | `cloudSession.user` i `profileName` | ramka 01 | `profileName`, `avatarDataUrl`, `dashboardModel`, `dashWeightBlock`, `bodyData`, `aiPrefs`, `workoutReminder`, `healthState`, `soundOn` |
| B. Nowy gość | brak imienia, brak zdjęcia, brak konta (i 0 treningów) | ramka 02: „Cześć / Dodaj imię i zdjęcie”, przerywana obwódka, karta „Zapisz swoje dane”, kafel zer, stany puste | j.w., puste |
| C. Gość z imieniem lub z treningami, bez konta | pośredni | **brak ramki** → propozycja: układ A + karta „Zapisz swoje dane”; podpis „W Mekkio od ...” | pytanie 5 |
| D. Zalogowany bez imienia | | **brak ramki** → imię z e-maila? NIE (prywatność, nowe pole); „Cześć / Dodaj imię i zdjęcie” jak B | |
| E. Ekran Ustawień | z zębatki | ramka 05-ustawienia; sekcje warunkowe: Przypomnienie (IS_NATIVE), Zdrowie (IS_NATIVE+plugin), KONTO (zalogowany), „Wczytaj kopię” (gość) | `acct*` jak dziś |
| F. Arkusze | tap „WSZYSTKIE ›” przy Rekordy/Odznaki; „DODAJ WAGĘ”, kafel wzrostu/wieku/płci, awatar | Rekordy, Odznaki (Figma); Waga, Dane ciała, Imię i zdjęcie, Cel AI (istniejące okna, bez nowych ramek) | `recordTimeline`/`dashBadges`; reszta jak dziś |

Zasady danych: żadnych nowych kluczy `localStorage`, żadnych nowych pól w `cloudWorkoutRow`/`cloudPlanRow`, żadnych nowych kolumn. Dane ciała i odczyty Zdrowia/sen tylko lokalnie (nie do payloadu AI, nie do chmury). `earnedOn` liczony przy renderze, nie zapisywany. Wszystkie odczyty przez try/catch i `dashValidIso` (jak dashboard), żeby wadliwy zapis nie wywalił ekranu. Pomiary wagi z Apple Zdrowie: tylko podgląd (bez edycji) — dotyczy okna wagi (popup 01/02, brak w Figmie).

## 4. Animacje i nawigacja (wg CLAUDE.md)

- **Push/pop (pkt 6):** Profil = wejście w głąb. W `goRoute()` dopisać do warunku `drill` pary: `X → profile-v2` (dla X = `dashboard`, `gym-v2`, `plans-v2`, `history-v2`, `stats-v2`; forward) i `profile-v2 → X` (back), oraz `profile-v2 ↔ profile-settings-v2`. UWAGA: dziś `drill` zakłada parę dokładnie dwóch tras, a `forward = route === 'plan-editor-v2'`; trzeba uogólnić (np. `DRILL_FORWARD = {'plan-editor-v2','profile-v2','profile-settings-v2'}`), a wracanie musi pamiętać trasę źródłową (`profileReturnRoute`), bo wejść jest pięć (awatar w każdym nagłówku); to nowa zmienna w pamięci, nie klucz localStorage.
- `V3_ROUTE_ALIAS`: dopisać `'profile-v2'` i `'profile-settings-v2'`; ponieważ menu jest ukryte, alias wskazuje trasę źródłową tylko, gdy menu miałoby zostać (pytanie 1). Dopisać też obie trasy do listy `isV3` w `goRoute()`.
- **Scroll-lock (pkt 6):** `html.profil-lock`, `profil-scrollable`, `body.profil-bg` (wzór `renderDashboard()` / `renderPlansListV2()`: scroll tylko gdy treść nie mieści się; mierzyć `scrollHeight` panelu od `rect.top`, nie `getBoundingClientRect().bottom`). Profil jest długi (1681 px), więc zawsze scrollowany: `profil-scrollable` stały; nie zapomnieć o `z-index`/paddingu dolnym przy ukrytym menu (`env(safe-area-inset-bottom)`).
- **Menu dolne ukryte:** dodać `body.profil-bg #bottomNav{display:none}` lub w `goRoute` `display = (route startsWith 'profile') ? 'none':'flex'` i ZABEZPIECZENIE w `hideNavOnKeyboard` (focusout przywraca `flex`; dziś robi to tylko dla `welcome`). Dodać też `positionNavBlob` bez błędu przy ukrytym nav (offsetWidth=0 → NaN w `s`), bo `positionNavBlob(navBlobReady)` jest wołane w każdym `goRoute`.
- **Wejście elementów:** `.m-rise` (małe), `.m-rise-tile` (kafle/karty) z `style="--i:N"` (60 ms/krok), tylko przy `animate=true` (otwarcie ekranu), nigdy przy re-renderze po zapisie wagi/imienia (`saveWeightSheet` dziś woła `renderAccountPanel()`, nowy kod ma wołać `renderProfileV2(false)`). Fill `backwards` (klasy go mają). Kolejność: tożsamość (i=0) → kafel statystyk (1) → Rekordy (2) → Odznaki (3) → Ciało (4) → Cele (5) → Połączenia (6) → stopka. Efekt „wow” tu niepotrzebny (ekran „często/czasem”): same wejścia kafli, bez dodatkowych ruchów.
- **Press (pkt 5):** `.m-press` na wierszach, kafelkach, pastylkach klikalnych, przyciskach 55 px, kartach odznak; własne `:active` dopisać do zbiorczej reguły na końcu `<style>`.
- **Strzałka wstecz:** `goRoute(profileReturnRoute)` (slide pop). **Gest od lewej krawędzi: w kodzie NIE ISTNIEJE** (przeszukane; Edytor planu go nie ma). Decyzja P1 mówi „strzałka + gest od lewej krawędzi”, ale to nowy gest, a w PWA na iOS krawędź jest zajęta przez systemowe „wstecz” Safari, więc ryzykowny; rekomendacja: w kroku K2 tylko strzałka, gest jako osobny, opcjonalny krok po testach na urządzeniu (pytanie w sekcji 9, nie blokuje).
- **Arkusze (pkt 7):** wspólna powłoka `.m-sheet` (overlay `.m-sheet-overlay`), `mSheetDrag(overlayId, closeFn)` podpięte raz na overlay, `closeFn(viaDrag)` pomija własną animację przy `viaDrag=true`, `finish()` czyści inline `transform`/`opacity` po dodaniu `hidden`; open/reset/finish usuwają `m-sheet-entered`; `html.modal-lock`; dodać nowe ID do `ACCT_SHEETS` (żeby `acctLockCheck` nie zdjął blokady). Wejście `mSheetUp` (`--m-dur-in`, `--m-ease-sheet`), zamknięcie przyciskiem `--m-dur-exit`/`--m-ease-exit`, rzut `MOTION.throw`.
- **Swipe miesięcy w arkuszu Rekordy (pkt 8):** kopiować wzorzec, pamiętając o konflikcie osi: `mSheetDrag` przejmuje pionowy ruch w dół, swipe poziomy tylko w obrębie karuzeli (`touch-action:pan-y`, blokada osi przy pierwszym ruchu); przełącznik Miesiące/Ćwiczenia: zmiana treści bez slajdu, tylko `opacity` w `--m-dur-quick` (częsta, mało ważna interakcja, pkt 1).
- **Pasek postępu odznaki/wykres wagi:** pasek przez `scaleX`; linia wykresu wagi: rysowanie raz przy wejściu ekranu (`--m-dur-draw`, `--m-ease`) tylko przy `animate=true` (rzadko = wolno, ale 0,9 s przy każdym wejściu w Profil to za dużo; rekomendacja: bez rysowania, same `.m-rise-tile` kafla; do decyzji, pytanie nie blokuje).
- Reduced motion: każde nowe `@keyframes` w `@media (prefers-reduced-motion: no-preference)`; hover tylko w `(hover:hover) and (pointer:fine)`.
- Zakaz: `transition: all`, animacja `width/height/left/top`, liczby na sztywno. Wszystkie czasy/krzywe z `--m-*` i `MOTION.*` (wymagane `MOTION.land`/`exit`/`throw` w swipe).

## 5. Wyrównanie awatara w nagłówku (globalna zmiana razem z Profilem)
Dziś dashboard i GYM = `max(14px, inset−8)`, Plany/Historia/Postępy = `16px + inset` (F2 w planie dotyczy tego samego; w F2 wysokość jest już ujednolicana). Przy wdrożeniu Profilu: sprawdzić, czy F2 (4.66.0) to dowiozło (tak wg planu, `statsv2/histv2/plansv2` używają klasy `*-acct-btn`), i dopisać nowy selektor `profil-*` do `ACCT_ENTRY_SEL` tylko dla awatara w bloku tożsamości (`.profile-av`). Awatar bloku tożsamości (60 px) różni się od awatara w nagłówkach (40 px).

## 6. Copy do przepuszczenia przez /człowiek

Teksty z Figmy (oznaczone: Z = z Figmy bez zmian do przeglądu, P = poprawka / propozycja agenta, N = nowy tekst potrzebny do implementacji, do akceptacji):

Ekran Profil
- Z: „PROFIL”; „TRENINGI”, „OBJĘTOŚĆ” (Figma „OBjętość”), „REKORDÓW”; „REKORDY”, „WSZYSTKIE”; „ODZNAKI”; „CIAŁO”, „WAGA”, „kg”, „/ 30 dni”, „WZROST”, „WIEK”, „PŁEĆ”, „45 lat”, „182 cm”, „DODAJ WAGĘ”; „CELE I TRENER”, „Cel treningowy”, „Czego unikać”, „Trener AI”, „Podpowiedzi po każdym treningu”; „POŁĄCZENIA”, „Apple Zdrowie”, „Waga i kalorie z zegarka”, „Połączono”, „Przypomnienie o treningu”, „PN, ŚR, PT • 18:00”; „Ustawienia i konto”.
- Z, do przeglądu: „W Mekkio od września 2026” (kształt zależny od danych, ? patrz 2.2).
- P: „Ustawienia i konto — Język, dźwięki, kopia zapasowa, usuń konto” → podpis nie może obiecywać „Język” (odłożony); propozycja robocza: „Dźwięki, dane, konto”.
- P: stopka „Mekkio 4.64.0” → dynamiczna wersja z `APP_VERSION` (dziś 4.66.0), nie wpisywać na sztywno.
- Gość (02): Z: „Cześć”, „Dodaj imię i zdjęcie”, „Zapisz swoje dane”, „Zaloguj się, żeby nie stracić treningów po zmianie telefonu.”, „ZALOGUJ SIĘ”, „Tu pojawią się Twoje rekordy.”, „Pierwszy zobaczysz po pierwszym treningu.”, „ZACZNIJ TRENING”, „Dodaj wagę, żeby śledzić zmiany”, „Waga / Dodaj pierwszy wpis”, „Wzrost, wiek, płeć / Do wyliczania kalorii” (w Figmie kończy się spacją).
- P: „Chrzest żelaza” → „Chrzest Żelaza” (zatwierdzona nazwa). „Zapisz pierwszy trening.” (opis stanu pustego odznaki, Z; dopasować do reszty opisów w trybie „co zrobić”).
- N (propozycja, jeśli Maciej zatwierdzi): opis „do zrobienia” dla pozostałych stanów pustych odznak nie jest potrzebny (pokazujemy tylko pierwszy).

Arkusz Rekordy
- Z: „REKORDY”, „Miesiące”, „Ćwiczenia”, „4 rekordy”, „9 treningów”, „Przesuń w lewo lub w prawo, żeby zmienić miesiąc.”, „WSZYSTKIE CASY”.
- P: „Paździenik 2026” → „Październik 2026” (z `MONTH_NAMES`); „Tapnij w rekord żeby zobaczyć treing.” → „Tapnij rekord, żeby zobaczyć trening.” (przecinek i literówka; sformułowanie do /człowiek); „WSZYSTKIE CASY” → „WSZYSTKIE CZASY”. Liczby mnogie „1 rekord / 2 rekordy / 5 rekordów”, „1 trening / 2 treningi / 5 treningów” trzeba obsłużyć (jest wzorzec `dashPlWeeksWord`).
- Wartość rekordu: „42,5 kg” (przecinek, sam ciężar), delta „+2 kg”. Ćwiczenia z masą ciała: „max powtórzeń” wg definicji, czasowe: czas (jest `fmtDur`).

Arkusz Odznaki
- Z: „ODZNAKI”, „5/10”, nazwy i opisy z `DASH_BADGES` (zatwierdzone w kodzie, nie z Figmy, bo w Figmie nazwy są pomylone z opisami), „11 / 25”.
- P: daty skrócone „12 wrz 2026”.

Ustawienia
- Z: „USTAWIENIA”, „POWIADOMIENIA I DŹWIĘK”, „Dźwięki”, „Odliczanie przerwy i koniec treningu”, „DANE I PRYWATNOŚĆ”, „Pobierz moje dane”, „Kopia zapasowa w pliku”, „Polityka prywatności”, „POMOC”, „Napisz do nas”, „Opinia i pomysły”, „Co nowego”, „Historia zmian”, „KONTO”, „Zalogowany przez Apple”, „Wyloguj się”, „Usuń konto”, „Trwale usuwa konto i dane w chmurze”.
- Stare teksty do poprawy (kontrakt z planu): `acctFootData` „dane treningowe tylko na tym urządzeniu” / „dane zsynchronizowane z chmurą” i `acctBackupHint` „Bez konta treningi są tylko na tym telefonie…” — w nowym ekranie nie ma stopki ani podpowiedzi w tej formie; ID zostają, teksty trzeba przepisać (ma być jasne, że dane gościa są lokalne, bez straszenia): N, propozycje robocze do /człowiek: stopka „Mekkio 4.66.0”; podpowiedź kopii „Bez konta treningi są tylko na tym telefonie. Zrób kopię albo załóż konto.” (do skrócenia/uczłowieczenia).
- Wyloguj: toast „Wylogowano” (istnieje).

Wszystkie teksty po angielsku: klucze `t('...')` z `T_EN`; wymagane tłumaczenia EN dla nowych kluczy (W5 język ODŁOŻONY, ale `t()` używa `LANG`). Nie dodawać nowych bez EN.

## 7. Co jest w Figmie, a czego nie (zakres wdrożenia)

| Popup / ekran z `popupy-v2` i makiet | W Figmie? | Decyzja |
|---|---|---|
| Profil zalogowany, Profil nowy gość | TAK (560:6731, 560:7900) | W zakresie |
| Ustawienia (ekran) | TAK (560:8368) | W zakresie |
| Arkusz Rekordy | TAK („05. Profil”, 560:8932) | W zakresie |
| Arkusz Odznaki | TAK („03-rekordy-arkusz”, 560:9642) | W zakresie |
| 01 Dodaj wagę | NIE | poza zakresem; zostaje obecny `weightSheet` |
| 02 Edytuj pomiar (edycja/usuwanie z „Cofnij”, W3) | NIE | poza zakresem |
| 03 Dane ciała (z klawiaturą Mekkio, W1) | NIE | poza zakresem; zostaje `bodyDataSheet` |
| 04 Imię i zdjęcie | NIE | poza zakresem; zostaje `nameEditOverlay` |
| 05 Odznaka zdobyta / 06 Odznaka niezdobyta (szczegół) | NIE | poza zakresem; tap w kartę w arkuszu Odznaki na razie bez akcji |
| 07 Szczegół rekordu | NIE | poza zakresem; tap w wiersz rekordu: na razie otwarcie treningu w Historii (jeśli Maciej tak chce, pytanie 3) albo bez akcji |
| 08 Zmień ćwiczenie, 09 Sortuj | NIE | Postępy, nie Profil |
| 10 Cel Trenera AI | NIE | poza zakresem; zostaje `aiPrefsSheet` |
| 11 Dialog usuń konto | TAK jako wzorzec GYM (`mConfirm`) | istnieje, zostaje |
| 12 Nowa odznaka (Gratulacje) | NIE | osobny etap (P4), poza Profilem |
| 13 Toasty | NIE (F2: toast z „Cofnij”) | tylko istniejące toasty |
| Okno Mekkio+ (W6), Udostępnij (W7), przełącznik języka (W5) | — | ODŁOŻONE |

## 8. Audyt zgodności

### 8.1 Minimum 11 px (`--m-fs-2xs` = twarda podłoga)
Poniżej 11 px w Figmie (do zgłoszenia, nie nadpisywać w Figmie; w kodzie użyć 11 px):
- Etykiety kafla statystyk (TRENINGI/OBJĘTOŚĆ/REKORDÓW): 10 px.
- Data pod nazwą rekordu w wierszach (np. „13 paź”): 10 px; podpisy wierszy w sekcjach CIAŁO, CELE I TRENER, POŁĄCZENIA, USTAWIENIA („Obciążanie kolana”, „Waga i kalorie z zegarka”…): 10 px.
- Podpis o gestach pod listą rekordów w arkuszu: 10 px.
- Stopka „Mekkio 4.64.0”: 10 px.
Razem 5 grup stylów 10 px. Zasada „nie nadpisujemy udokumentowanego systemu jedną ramką”: wdrożenie bierze 11 px i zgłasza Maciejowi różnicę (w Figmie do poprawy; już raz zgłaszane w Planach).

### 8.2 Cel dotyku 44 pt
Poniżej 44 w Figmie: strzałka wstecz 40×40 i zębatka 40×40 i ✕ w arkuszu 40×40 (wzorzec `::after{inset:-4px}` z `.dash-acct-btn` daje 48; `.v2-hdr-back` ma 40 → dodać `::after`); linki „WSZYSTKIE ›” (tekst 11 px, wysokość ~12: pole dotyku ma sięgać 44, `padding` + ujemny margin); strzałki miesięcy (6,5×11,5 glif: pole 44×44); wiersze kart (wysokość 29 przy odstępie 12 = ~41; w kodzie `min-height:44px` wiersza całego klikalnego, kosztem odstępów w kartach: kart jest dłuższa niż w Figmie, ~3 px na wiersz; do akceptacji); pastylki klikalne („MEKKIO+”, „Połączono”, „PN, ŚR, PT”) — klikalny jest cały wiersz, więc pastylka bez własnego celu; przełącznik Dźwięki 38×23: cały wiersz jako cel (jak dziś `acct-row`); kafel „182 cm / 45 lat / płeć”: kolumny 65×~57, trzeba 44 (OK po dodaniu padding); karty odznak (>100×120) OK; segmenty Miesiące/Ćwiczenia: wysokość 31 → min 44 (padding); pastylki delty i licznik 19 px: nieklikalne (OK).
Przyciski 55 px OK.

### 8.3 Tokeny i kolory (Figma → `:root`)
Zgodne 1:1: #FF3300 `--m-orange`, #343941 `--m-ink`, #6C6B78 `--m-muted-text`, #96959B `--m-muted`, #F1D7CB `--m-orange-tint`, #B9F3DE `--m-mint-tint`, #166D4F `--m-mint-ink`, #2CDA9D `--m-mint`, #CD1200 `--m-danger`, #C7C6CB `--m-line`, #F5F1FB `--m-panel`, #708FE1 `--m-plan-easy`, #FBECE3 `--m-page-top`, #E2E2E1 `--m-page-bot`, rgba(255,255,255,.84) `--m-glass`.
Niezgodne / bez tokenu (tylko zgłaszam):
- `#FA1228` („Usuń konto”, zmienna „Mekkio/Trener AI/Od”) vs `--m-danger` #cd1200. Propozycja: `--m-danger`.
- `rgba(52,57,65,.82)` etykiety kafla (brak tokenu; propozycja: `--m-ink` + opacity).
- `#FF9B82` obrys ✕ arkusza vs plan (#FF3300).
- Rozmiary czcionek: 36 (imię), 28 (liczby), 42,73 (waga; wartość z przeskalowania), 18 (tytuły stanów pustych, miesiąc), 14,69 („kg”): brak tokenów; istnieją 11/12/13/14/16/20/24/30/40.
- Kontrast: „−1,1 kg” #2CDA9D na białym (~1,9:1) — mięta wg tokenów to wypełnienia z ciemnym tekstem, tekst ma być `--m-mint-ink`; „5/10” biały na #708FE1 (~3,3:1, 11 px) poniżej 4,5:1; liczby gościa #96959B na białym (~2,8:1); #FF3300 na białym ~3,6:1 = udokumentowany wyjątek wg Figmy.
- Przerywana obwódka 4,2 (nieodtwarzalna 1:1 w CSS `dashed`).
- Sheet: r=33 vs kod 34; tło/blur okna jak wyżej: zostaje kod (wspólna powłoka).

### 8.4 Tokeny ruchu
Figma nie opisuje ruchu; cały ruch z `--m-ease*` / `--m-dur-*` / `MOTION.*` (sekcja 4). Nowy token: żaden potrzebny. Zakazy z CLAUDE.md (fill `backwards`, brak `all`, tylko `transform/opacity`) uwzględnione; pasek postępu i linia wykresu: `scaleX`/`stroke-dashoffset` (dopuszczalne, ale `stroke-dashoffset` nie jest transform/opacity, więc linię rysować tylko `clip`/`opacity` albo bez animacji; patrz 4).

### 8.5 Inne
- Safari: ikony SVG w flex/grid wymagają jawnego `width`/`height` na wszystkich warstwach (feedback_safari_svg_flexbox_sizing): dotyczy ikon odznak 51×51, chevronów, plusa, GenderMale.
- Tło z obrazem: `background-attachment` na iOS; użyć wzorca z dashboardu, nie nowego.

## 9. Ryzyka, pytania do Macieja, plan wdrożenia

### 9.1 Ryzyka
1. Podwójne ID `acct*` przy współistnieniu starego panelu i nowego ekranu (patrz sekcja 1); rozwiązanie: stary panel znika dopiero w K5, ID są przenoszone, nie kopiowane.
2. `goRoute` ma twardą logikę `drill` (para tras, `forward = plan-editor-v2`); Profil ma 5 źródeł wejścia → potrzebna pamięć trasy powrotu (zmienna w pamięci) i uogólnienie warunku; błąd da zły kierunek slajdu albo martwy back.
3. Ukrycie menu: `positionNavBlob` i `hideNavOnKeyboard` zakładają widoczne menu (NaN, ponowne pokazanie); `beginViewTransition` używa `#view-<route>`, każda nowa trasa musi mieć `#view-profile-v2` w `#viewStack`.
4. Silnik rekordów: zmiany z F1 (4.66.0) wpływają wstecz na odznaki; sprawdzić zgodność liczb „11 rekordów”, „11 / 25”, „5/10” z `recordTimeline().length` i `dashBadges().earned`.
5. `isPremium()` zwraca `true` stale; sekcje MEKKIO+ w Figmie sugerują blokadę, której nie ma.
6. Swipe poziomy wewnątrz arkusza z `mSheetDrag`: konflikt osi (kod rozstrzyga pierwszym ruchem; test na iPhone).
7. Gest od krawędzi: kolizja z systemowym back Safari (PWA) i brak istniejącego wzorca.
8. Dostępność kontrastu mięty/niebieskiego (8.3) przy bezpośrednim przeniesieniu Figmy.
9. Format liczby i wyrazów mnogich (PL); daty z `fmtDate`.
10. Dostawca logowania („Zalogowany przez Apple”): kod go nie czyta; `app_metadata.provider` do zweryfikowania w sesji Supabase.

### 9.2 Pytania do Macieja (max 5, każde z rekomendacją)
1. **Menu dolne w Profilu.** W Figmie jest narysowane, w decyzji P1 ma być ukryte (Edytor i GYM w kodzie go NIE ukrywają). Rekomendacja: ukryć, bo Profil jest „w głąb” (strzałka wstecz), a menu pokazywałoby fałszywą aktywną zakładkę; jeśli zostaje, który tab świeci?
2. **Tytuł i ✕ arkuszy.** Figma: tytuł 12 px SemiBold, ✕ z obrysem #FF9B82; Twój plan popupów: tytuł 20 px, ✕ z obrysem #FF3300. Rekomendacja: 20 px / #FF3300 (zgodnie z udokumentowanym systemem F2), poprawić w Figmie.
3. **Tap w rekord i „WSZYSTKIE CZASY”.** Co ma robić tap w wiersz rekordu (szczegół rekordu — nie ma go w Figmie) i przycisk „WSZYSTKIE CZASY” (przełącza na zakładkę Ćwiczenia z rekordami życiowymi?). Rekomendacja: tap = otwarcie treningu w Historii (istniejące wejście), „WSZYSTKIE CZASY” = przełączenie na „Ćwiczenia”; ramkę zakładki „Ćwiczenia” i szczegółu rekordu narysować w następnej kolejności.
4. **Wiersze MEKKIO+ (pastylka przy Trenerze AI i promo „Odblokuj…”).** Okno Mekkio+ jest odłożone, a `isPremium()` = true. Rekomendacja: w tym etapie nie pokazywać ani pastylki, ani promo; wiersz „Trener AI” tylko jako informacja (podpis, bez pastylki), miejsce zostaje w układzie.
5. **Stany bez ramek.** (a) gość z imieniem lub treningami bez konta; (b) które 5 odznak w rzędzie na ekranie; (c) skąd „W Mekkio od ...” bez nowego pola. Rekomendacja: (a) układ zalogowany + karta „Zapisz swoje dane”; (b) 3 ostatnio zdobyte + 2 najbliższe do zdobycia; (c) data pierwszego treningu lub wpisu wagi, a gdy brak, podpis ukryty.

(Nie blokują: gest od lewej krawędzi — rekomendacja: tylko strzałka w pierwszym wydaniu; rysowanie linii wagi — rekomendacja: bez animacji rysowania.)

### 9.3 Proponowany podział wdrożenia (kroki sekwencyjne, jeden plik `index.html`; każdy da się zrobić i zweryfikować osobno, każdy z zrzutami przed/po)

- **K0. Przygotowanie (bez zmian wizualnych).** Zrzuty „przed” (panel konta, wszystkie okna), `renderAccountPanel` rozdzielone na część danych i część widoku, sprawdzenie, że Geist ładuje wagę 200, ikony `gear`/`caret-*`/`plus`/`gender-*` w rejestrze `data-ph` (dopisać brakujące). Weryfikacja: zrzuty bez różnic.
- **K1. Trasa i pusty szkielet.** `#view-profile-v2`, `goRoute` (drill uogólniony + `profileReturnRoute`, `V3_ROUTE_ALIAS`, `isV3`, `profil-lock`/`profil-bg`, ukrycie menu z zabezpieczeniami `hideNavOnKeyboard` i `positionNavBlob`), `openAccountPanel()` → `goRoute('profile-v2')`; nagłówek (strzałka, tytuł, zębatka) + tło. Weryfikacja: wejście z 5 awatarów, slide push/pop w obu kierunkach, brak menu, powrót na właściwy ekran, brak regresji pozostałych tras.
  - *Wdrożone lokalnie (K0+K1, bez bumpu wersji):* awatary wołają nowe `openProfileV2()` (zapamiętuje `profileReturnRoute`), a `openAccountPanel()` na razie nadal otwiera STARY panel (zębatka w Profilu go używa), bo pusty szkielet zablokowałby dostęp do logowania/usuwania konta; przepięcie na `goRoute('profile-v2')` dopiero w K5. `V3_ROUTE_ALIAS['profile-v2']` to getter zwracający zakładkę ekranu źródłowego (menu ukryte, wyjście nie jest zmianą zakładki). Zrzuty „przed”: `mockups/profil-v2/przed/`, szkielet: `mockups/profil-v2/k1-szkielet.png`.
- **K2. Ekran Profil, stan zalogowany: tożsamość, kafel statystyk, sekcja Rekordy (3 wiersze), Ciało.** Dane z `dashboardModel`/`recordTimeline`/`dashWeightBlock`; `m-rise`/`m-press`; ID `acctWeightV`, `acctHeightV`, `acctAgeV`, `acctSexV`; „DODAJ WAGĘ” → `openWeightSheet()`. Weryfikacja: liczby zgodne z Dashboardem i Postępami, brak re-animacji po zapisie wagi, 11 px/44 pt, zrzut vs Figma 01 (screenshot-diff).
  - *Wdrożone lokalnie (K2, bez bumpu wersji):* `renderProfileV2(animate)` + `profileModel()` (dane na oczyszczonych kopiach przez wspólne `dashWithCleanData`, z którego korzysta teraz też `dashboardModel`). Kafel: TRENINGI = zapisane treningi, OBJĘTOŚĆ = suma kg×powt. (t od 1000 kg), REKORDÓW = `dashRecordEvents().length` (ciężar + powtórzenia + czas; bez rekordu objętości, tak samo jak odznaka Ściana Chwały). Etykiety odmieniane (TRENING/TRENINGI/TRENINGÓW, REKORD/REKORDY/REKORDÓW). Rekordy: 3 najświeższe `kind=weight`, tap otwiera Historię (`dashOpenHistoryDay`); link „WSZYSTKIE ›” pojawia się dopiero, gdy istnieje `openProfileRecordsSheet` (K4). Stan nowego gościa = brak imienia, zdjęcia, konta, treningów i wagi. Karta logowania dla każdego bez konta. Odświeżanie po zapisie: `renderAccountPanel()` woła `renderProfileV2(false)`. Zrzuty: `mockups/profil-v2/po/k2-*.png`.
- **K3. Odznaki (sekcja i arkusz) na wspólnym silniku.** Wyciągnięcie/użycie `dashBadges`, grafika `icons/badges/<id>.svg` z fallbackiem, szare w kodzie, pierścienie, arkusz z `mSheetDrag`. Weryfikacja: licznik 5/10 = `dashBadges().earned`, daty, tło/blur arkusza, zamykanie przeciągnięciem, `m-sheet-entered`.
- **K4. Arkusz Rekordy (Miesiące) + stan „Ćwiczenia” (minimalny).** Karuzela miesięcy wg wzorca swipe, pastylki, kropki, link z sekcji, tap w rekord. Weryfikacja: pomijanie pustych miesięcy, konflikt osi z `mSheetDrag`, test na iPhone/symulatorze.
- **K5. Reszta ekranu i Ustawienia + usunięcie starego panelu.** Cele i trener, Połączenia, Ustawienia (trasa `profile-settings-v2`), stan nowego gościa (02), karta logowania; przeniesienie ID `acct*`, przepięcie `openAiPrefsSheet`/`openAuthSheet`/`openHealthSheet`, usunięcie `#accountOverlay`, `acctFootData`/`acctBackupHint` z nowymi tekstami, Wyloguj bez dialogu. Weryfikacja: logowanie SIWA/Google (authSheet), usuń konto, polityka prywatności, eksport/import, przypomnienie, Zdrowie, dźwięk.
- **K6. Wyrównanie awatara w nagłówkach (jedna globalna zmiana), polerka, copy przez /człowiek, EN (`T_EN`), audyt 11 px/44 pt/tokeny, zrzuty przed/po.**
- **K7. Wersja + `docs/CHANGELOG.md` + pytanie o push.** (Bez `version.json`; build natywny po dashboardzie + Profilu + onboardingu wg planu.)

Kolejność K0 → K1 → K2 → K3 → K4 → K5 → K6 → K7 jest wymagana (jeden plik, zależności: trasa przed treścią, ID przed usunięciem starego panelu).
