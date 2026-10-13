# F1: zestawienie odznak przed/po (silnik rekordów)

Stan na 2026-10-13, gałąź worktree `worktree-agent-a513c9fd14c2c551d`. „Przed” = `index.html` z commitu `553fdf6` (4.65.0), „po” = silnik rekordów z etapu F1. Obie wersje uruchomione w tej samej przeglądarce na tych samych 11 syntetycznych historiach (`dashboardModel()` z datą 2026-10-13, waga ciała 80 kg), więc różnice pochodzą wyłącznie z silnika rekordów.

## Co się zmieniło w definicji

- Rekord ćwiczenia: najcięższy faktycznie podniesiony ciężar (seria z ciężarem i co najmniej 1 powtórzeniem), w podpisie z powtórzeniami. Masa ciała: najwięcej powtórzeń w serii. Czasowe: najdłuższy czas. Kardio nigdy.
- Wzrost samej objętości ćwiczenia (więcej serii albo powtórzeń przy tym samym ciężarze) NIE jest już rekordem ćwiczenia. Rekord objętości jest osobny i dotyczy całego treningu.
- Seria „ciężar bez powtórzeń” nie liczy się do rekordu.
- Pierwsze wykonanie ćwiczenia, remis i ten sam ciężar z większą liczbą powtórzeń nie są rekordem (jak dotąd).
- Ściana Chwały i Człowiek orkiestra liczą rekordy ćwiczeń (ciężar, powtórzenia przy masie ciała, czas). Rekord objętości treningu do odznak się nie liczy.

## Podsumowanie: które odznaki się zmieniają

Tylko dwie odznaki zależą od silnika rekordów w sposób, który zmienia wynik: **Ściana Chwały** (25 rekordów) i **Człowiek orkiestra** (rekord w 5 ćwiczeniach). **Pierwsza Krew** (pierwszy rekord ciężaru) nie zmienia się na żadnej z historii. Pozostałe 7 odznak (Chrzest Żelaza, Pełny Etat, Nokaut Tygodnia, Wagon Towarowy, Waga Ciężka, Rakieta, Gryf Mocy) nie używa rekordów i jest bez zmian na wszystkich historiach.

Zmiana dotyka wyłącznie użytkowników, którzy do tej pory zbierali „rekordy” samą objętością (dokładanie serii i powtórzeń przy stałym ciężarze). Każdy, kto zwiększa ciężar, ma te same odznaki co wcześniej, z tymi samymi datami.

| Odznaka | A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Chrzest Żelaza | = | = | = | = | = | = | = | = | = | = | = |
| Pełny Etat | = | = | = | = | = | = | = | = | = | = | = |
| Pierwsza Krew | = | = | = | = | = | = | = | = | = | = | = |
| Ściana Chwały | = | = | = | = | = | **ZMIANA** | = | = | = | **ZMIANA** | = |
| Nokaut Tygodnia | = | = | = | = | = | = | = | = | = | = | = |
| Wagon Towarowy | = | = | = | = | = | = | = | = | = | = | = |
| Waga Ciężka | = | = | = | = | = | = | = | = | = | = | = |
| Rakieta | = | = | = | = | = | = | = | = | = | = | = |
| Człowiek orkiestra | = | = | = | = | = | **ZMIANA** | = | = | = | **ZMIANA** | = |
| Gryf Mocy | = | = | = | = | = | = | = | = | = | = | = |

Legenda historii:

- **A**: Nowy użytkownik (pusta historia) [0 wpisów]
- **B**: 1 trening [1 wpisów]
- **C**: 10 treningów (progres co 2. trening, 4 ćwiczenia) [10 wpisów]
- **D**: 40 treningów z masą ciała i czasowymi [40 wpisów]
- **E**: Plan zmieniony w trakcie (A → B → A), 30 treningów [30 wpisów]
- **F**: Plateau: ten sam ciężar, więcej powtórzeń (+ 2 dni z dwoma treningami) [22 wpisów]
- **G**: 60 treningów po ok. 2 t objętości + kardio [60 wpisów]
- **H**: Import ze złymi wpisami (zła data, brak ćwiczeń) + 4 dobre treningi [7 wpisów]
- **I**: 9 treningów, 6 ćwiczeń, każde rośnie co trening (dużo rekordów) [9 wpisów]
- **J**: Dokładanie serii: ciężar i powtórzenia stałe, +1 seria co 2. trening [12 wpisów]
- **K**: Pomyłkowa seria 200 kg × 0 w 3. treningu, potem zwykły progres [8 wpisów]

## Zdarzenia rekordów (liczone przez `dashRecordEvents()`, wejście do Ściany Chwały i Człowieka orkiestry)

| Historia | Przed: zdarzeń / ćwiczeń | Przed: rodzaje | Po: zdarzeń / ćwiczeń | Po: rodzaje |
|---|---|---|---|---|
| A | 0 / 0 | - | 0 / 0 | - |
| B | 0 / 0 | - | 0 / 0 | - |
| C | 16 / 4 | weight 16, volume 16 | 16 / 4 | weight 16 |
| D | 43 / 5 | volume 31, reps 15, time 12, weight 16 | 43 / 5 | reps 15, time 12, weight 16 |
| E | 31 / 7 | weight 31, volume 31 | 31 / 7 | weight 31 |
| F | 12 / 3 | volume 12 | 0 / 0 | - |
| G | 18 / 2 | weight 18, volume 18 | 18 / 2 | weight 18 |
| H | 2 / 1 | weight 2 | 2 / 1 | weight 2 |
| I | 48 / 6 | weight 48, volume 48 | 48 / 6 | weight 48 |
| J | 30 / 6 | volume 30 | 0 / 0 | - |
| K | 14 / 2 | weight 9, volume 14 | 14 / 2 | weight 14 |

Uwaga: „zdarzeń” to liczba par (trening, ćwiczenie), w których padł rekord; w starym silniku rekord ciężaru i rekord objętości tego samego ćwiczenia w jednym treningu były jednym zdarzeniem z dwoma rodzajami, więc liczba zdarzeń różni się dopiero tam, gdzie rekord pochodził WYŁĄCZNIE z objętości (historie F i J).

## Szczegóły: odznaka × historia, stary wynik vs nowy wynik

### Historia A: Nowy użytkownik (pusta historia) [0 wpisów]

Brak zmian: nic do porównania.

Karta „Rekord” na dashboardzie: przed: brak; po: brak.

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | nie (0/1) | nie (0/1) |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | nie (0/1) | nie (0/1) |  |
| Ściana Chwały | nie (0/25) | nie (0/25) |  |
| Nokaut Tygodnia | nie (0/1) | nie (0/1) |  |
| Wagon Towarowy | nie (0/100000) | nie (0/100000) |  |
| Waga Ciężka | nie (0/80) | nie (0/80) |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | nie (0/5) | nie (0/5) |  |
| Gryf Mocy | nie (0/10) | nie (0/10) |  |

### Historia B: 1 trening [1 wpisów]

Brak zmian: pierwszy trening niczego nie bije w obu silnikach. Karta „Rekord” na dashboardzie pokazuje najcięższy wynik z tego treningu (80 kg, ścieżka „najcięższy wynik”).

Karta „Rekord” na dashboardzie: przed: Barbell Back Squat, 80 kg (best); po: Barbell Back Squat, 80 kg (best).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-10-05 | tak, 2026-10-05 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | nie (0/1) | nie (0/1) |  |
| Ściana Chwały | nie (0/25) | nie (0/25) |  |
| Nokaut Tygodnia | nie (0/1) | nie (0/1) |  |
| Wagon Towarowy | nie (1360/100000) | nie (1360/100000) |  |
| Waga Ciężka | nie (80/80) | nie (80/80) |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | nie (0/5) | nie (0/5) |  |
| Gryf Mocy | nie (1/10) | nie (1/10) |  |

### Historia C: 10 treningów (progres co 2. trening, 4 ćwiczenia) [10 wpisów]

Brak zmian w odznakach. Zmienia się tylko podpis rekordu: „100 kg” → „100 kg × 5” (ciężar z powtórzeniami).

Karta „Rekord” na dashboardzie: przed: Barbell Back Squat, 100 kg | Nowy rekord (workout); po: Barbell Back Squat, 100 kg × 5 | Nowy rekord (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-08-03 | tak, 2026-08-03 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | tak, 2026-08-07 | tak, 2026-08-07 |  |
| Ściana Chwały | nie (16/25) | nie (16/25) |  |
| Nokaut Tygodnia | tak, 2026-08-14 | tak, 2026-08-14 |  |
| Wagon Towarowy | nie (37750/100000) | nie (37750/100000) |  |
| Waga Ciężka | tak, 2026-08-07 | tak, 2026-08-07 |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | nie (4/5) | nie (4/5) |  |
| Gryf Mocy | tak, 2026-08-24 | tak, 2026-08-24 |  |

### Historia D: 40 treningów z masą ciała i czasowymi [40 wpisów]

Brak zmian w odznakach. Rekordy powtórzeń (masa ciała) i czasu liczone tak samo jak wcześniej; stare zdarzenia „objętość” szły równolegle do rekordów ciężaru i nie zmieniały liczby zdarzeń.

Karta „Rekord” na dashboardzie: przed: Barbell Bench Press, 82,5 kg | Nowy rekord (workout); po: Barbell Bench Press, 82,5 kg × 8 | Nowy rekord (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-03-02 | tak, 2026-03-02 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | tak, 2026-03-16 | tak, 2026-03-16 |  |
| Ściana Chwały | tak, 2026-04-10 | tak, 2026-04-10 |  |
| Nokaut Tygodnia | tak, 2026-03-20 | tak, 2026-03-20 |  |
| Wagon Towarowy | nie (82900/100000) | nie (82900/100000) |  |
| Waga Ciężka | tak, 2026-03-02 | tak, 2026-03-02 |  |
| Rakieta | tak, 2026-04-03 | tak, 2026-04-03 |  |
| Człowiek orkiestra | tak, 2026-03-20 | tak, 2026-03-20 |  |
| Gryf Mocy | tak, 2026-04-03 | tak, 2026-04-03 |  |

### Historia E: Plan zmieniony w trakcie (A → B → A), 30 treningów [30 wpisów]

Brak zmian: nowe ćwiczenia po zmianie planu zaczynają od zera w obu silnikach (pierwszy raz nie jest rekordem), powrót do planu A bije stare rekordy tak samo.

Karta „Rekord” na dashboardzie: przed: Barbell Back Squat, 100 kg | Nowy rekord (workout); po: Barbell Back Squat, 100 kg × 5 | Nowy rekord (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-05-04 | tak, 2026-05-04 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | tak, 2026-05-13 | tak, 2026-05-13 |  |
| Ściana Chwały | tak, 2026-07-21 | tak, 2026-07-21 |  |
| Nokaut Tygodnia | tak, 2026-05-22 | tak, 2026-05-22 |  |
| Wagon Towarowy | nie (51116/100000) | nie (51116/100000) |  |
| Waga Ciężka | tak, 2026-05-13 | tak, 2026-05-13 |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | tak, 2026-06-18 | tak, 2026-06-18 |  |
| Gryf Mocy | tak, 2026-05-31 | tak, 2026-05-31 |  |

### Historia F: Plateau: ten sam ciężar, więcej powtórzeń (+ 2 dni z dwoma treningami) [22 wpisów]

ZMIANA: patrz uwagi przy Ścianie Chwały i Człowieku orkiestrze. Karta „Rekord” na dashboardzie: stare „Barbell Bench Press 1600 kg, rekord objętości” → nowe „3084 kg, rekord objętości treningu” (cały trening).

Karta „Rekord” na dashboardzie: przed: Barbell Bench Press, 1600 kg | Nowy rekord objętości (workout); po: Test, 3084 kg | Nowy rekord objętości (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-06-01 | tak, 2026-06-01 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | nie (0/1) | nie (0/1) |  |
| Ściana Chwały | nie (12/25) | **nie (0/25)** | Stary silnik liczył jako rekord każdy wzrost OBJĘTOŚCI ćwiczenia w treningu (12 takich zdarzeń, same z dodatkowych powtórzeń przy tym samym ciężarze). Nowa definicja liczy tylko najcięższy ciężar (z powtórzeniami), powtórzenia przy masie ciała i czas. Stały ciężar = 0 rekordów. |
| Nokaut Tygodnia | tak, 2026-06-28 | tak, 2026-06-28 |  |
| Wagon Towarowy | nie (56620/100000) | nie (56620/100000) |  |
| Waga Ciężka | nie (80/80) | nie (80/80) |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | nie (3/5) | **nie (0/5)** | Jak wyżej: rekordy w 3 ćwiczeniach pochodziły wyłącznie z objętości, więc znikają. |
| Gryf Mocy | tak, 2026-06-25 | tak, 2026-06-25 |  |

### Historia G: 60 treningów po ok. 2 t objętości + kardio [60 wpisów]

Brak zmian w odznakach (Wagon Towarowy liczy sumę objętości, nie rekordy). Kardio (bieżnia) pominięte w obu silnikach.

Karta „Rekord” na dashboardzie: przed: Barbell Back Squat, 122,5 kg | Nowy rekord (workout); po: Barbell Back Squat, 122,5 kg × 8 | Nowy rekord (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2025-12-01 | tak, 2025-12-01 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | tak, 2025-12-13 | tak, 2025-12-13 |  |
| Ściana Chwały | nie (18/25) | nie (18/25) |  |
| Nokaut Tygodnia | tak, 2025-12-21 | tak, 2025-12-21 |  |
| Wagon Towarowy | tak, 2025-12-17 | tak, 2025-12-17 |  |
| Waga Ciężka | tak, 2025-12-01 | tak, 2025-12-01 |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | nie (2/5) | nie (2/5) |  |
| Gryf Mocy | tak, 2025-12-19 | tak, 2025-12-19 |  |

### Historia H: Import ze złymi wpisami (zła data, brak ćwiczeń) + 4 dobre treningi [7 wpisów]

Brak zmian: wpisy ze złą datą / bez ćwiczeń pomijane w obu silnikach (dashboard i tak je filtruje).

Karta „Rekord” na dashboardzie: przed: Barbell Bench Press, 65 kg | Nowy rekord (workout); po: Barbell Bench Press, 65 kg × 5 | Nowy rekord (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-09-01 | tak, 2026-09-01 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | tak, 2026-09-08 | tak, 2026-09-08 |  |
| Ściana Chwały | nie (2/25) | nie (2/25) |  |
| Nokaut Tygodnia | nie (0/1) | nie (0/1) |  |
| Wagon Towarowy | nie (1555/100000) | nie (1555/100000) |  |
| Waga Ciężka | nie (65/80) | nie (65/80) |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | nie (1/5) | nie (1/5) |  |
| Gryf Mocy | nie (4/10) | nie (4/10) |  |

### Historia I: 9 treningów, 6 ćwiczeń, każde rośnie co trening (dużo rekordów) [9 wpisów]

Brak zmian: każdy rekord ciężaru jest też rekordem objętości, więc liczba zdarzeń taka sama; Ściana Chwały 2026-01-25 w obu.

Karta „Rekord” na dashboardzie: przed: Triceps Pushdown, 110 kg | Nowy rekord (workout); po: Triceps Pushdown, 110 kg × 8 | Nowy rekord (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-01-05 | tak, 2026-01-05 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | tak, 2026-01-09 | tak, 2026-01-09 |  |
| Ściana Chwały | tak, 2026-01-25 | tak, 2026-01-25 |  |
| Nokaut Tygodnia | tak, 2026-01-17 | tak, 2026-01-17 |  |
| Wagon Towarowy | nie (56700/100000) | nie (56700/100000) |  |
| Waga Ciężka | tak, 2026-01-05 | tak, 2026-01-05 |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | tak, 2026-01-09 | tak, 2026-01-09 |  |
| Gryf Mocy | nie (9/10) | nie (9/10) |  |

### Historia J: Dokładanie serii: ciężar i powtórzenia stałe, +1 seria co 2. trening [12 wpisów]

ZMIANA: patrz uwagi. Karta „Rekord” na dashboardzie: „Triceps Pushdown 5760 kg, rekord objętości” → „24 960 kg, rekord objętości treningu”.

Karta „Rekord” na dashboardzie: przed: Triceps Pushdown, 5760 kg | Nowy rekord objętości (workout); po: Test, 24 960 kg | Nowy rekord objętości (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-04-01 | tak, 2026-04-01 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | nie (0/1) | nie (0/1) |  |
| Ściana Chwały | tak, 2026-05-01 | **nie (0/25)** | Dokładanie serii przy stałym ciężarze i powtórzeniach dawało 30 „rekordów objętości ćwiczenia” (25 osiągnięte 2026-05-01). Nowa definicja: 0 rekordów ćwiczeń, objętość całego treningu jest osobnym rekordem i nie liczy się do tej odznaki. |
| Nokaut Tygodnia | tak, 2026-04-10 | tak, 2026-04-10 |  |
| Wagon Towarowy | tak, 2026-04-22 | tak, 2026-04-22 |  |
| Waga Ciężka | tak, 2026-04-01 | tak, 2026-04-01 |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | tak, 2026-04-07 | **nie (0/5)** | Jak wyżej: wszystkie 6 ćwiczeń miało tylko „rekordy objętości”. Odznaka cofa się z „tak” na „nie (0/5)”. |
| Gryf Mocy | tak, 2026-04-28 | tak, 2026-04-28 |  |

### Historia K: Pomyłkowa seria 200 kg × 0 w 3. treningu, potem zwykły progres [8 wpisów]

Odznaki bez zmian, ale zmienia się karta „Rekord”: seria 200 × 0 (ciężar wpisany bez powtórzeń) w starym silniku zablokowała rekordy wyciskania na 200 kg, więc „najnowszy rekord” pokazywał wiosłowanie (67,5 kg). Nowy silnik wymaga co najmniej 1 powtórzenia („faktycznie podniesiony”) i pokazuje wyciskanie 77,5 kg × 8.

Karta „Rekord” na dashboardzie: przed: Barbell Row, 67,5 kg | Nowy rekord (workout); po: Barbell Bench Press, 77,5 kg × 8 | Nowy rekord (workout).

| Odznaka | Przed | Po | Uwaga |
|---|---|---|---|
| Chrzest Żelaza | tak, 2026-07-01 | tak, 2026-07-01 |  |
| Pełny Etat | nie (0/-) | nie (0/-) |  |
| Pierwsza Krew | tak, 2026-07-04 | tak, 2026-07-04 |  |
| Ściana Chwały | nie (14/25) | nie (14/25) |  |
| Nokaut Tygodnia | tak, 2026-07-10 | tak, 2026-07-10 |  |
| Wagon Towarowy | nie (13500/100000) | nie (13500/100000) |  |
| Waga Ciężka | tak, 2026-07-07 | tak, 2026-07-07 |  |
| Rakieta | nie (0/3) | nie (0/3) |  |
| Człowiek orkiestra | nie (2/5) | nie (2/5) |  |
| Gryf Mocy | nie (8/10) | nie (8/10) |  |

## Pierwsza Krew: kiedy mogłaby się zmienić

Na tych 11 historiach data Pierwszej Krwi jest identyczna. Różnica pojawiłaby się tylko wtedy, gdyby pierwszym „rekordem ciężaru” w starym silniku była seria z ciężarem i zerem powtórzeń (np. pomyłkowe 200 × 0 jak w historii K, tyle że jako pierwszy wzrost ciężaru w ogóle): stara odznaka wpadłaby wcześniej, nowa dopiero przy pierwszym prawdziwym wzroście ciężaru.

## Zmiany poza odznakami, które zobaczy użytkownik

- Podpis rekordu z powtórzeniami: dashboard (karta „Rekord”), ekran Gratulacje i rozwinięta karta w Historii pokazują „100 kg × 5” zamiast samego „100 kg”. Karta udostępniania nadal pokazuje sam ciężar (układ dopasowany do Figmy).
- Rekord objętości jest teraz rekordem CAŁEGO treningu (suma kg × powt.), nie jednego ćwiczenia; pod liczbą stoi nazwa dnia/planu z zapisu treningu albo „Cały trening”. Trening bez żadnego ciężaru liczy się w powtórzeniach i porównuje się tylko z takimi treningami.
- Kafel „Rekord” w „Ostatnim treningu” na dashboardzie liczy wszystkie rekordy z tego treningu (dotąd 0 albo 1).
- Reguła trenera „Nowy rekord w ćwiczeniu X” nie odpala się dla rekordu objętości całego treningu (nie ma ćwiczenia do nazwania).
- Postępy, szczegół ćwiczenia: duży wynik to rekord („77,5 kg × 8”), strzałka pokazuje o ile rekord urósł od końca zeszłego miesiąca, „Prognoza maxa ≈ 100 kg z 75 × 10” to osobny wiersz. Tag przy sesji to jedno słowo „rekord” (dawne „siła”, „ciężar”, „seria”, „objętość” znikają; największa objętość ćwiczenia w sesji zostaje jako zwykła statystyka). Pierwszy wynik na wykresie nie ma już tagu PR.
- Karta startowa ćwiczenia: „SZACOWANY MAX” → „PROGNOZA MAXA” (EN „PROJECTED MAX”), dla ćwiczeń z masą ciała zostaje „REKORD” (najwięcej powtórzeń).
- Historia: ten sam dzień, dwa treningi: porównanie wg kolejności zapisu (drugi może pobić pierwszy); wcześniej karta Historii ignorowała treningi z tego samego dnia.

## Jak powstało to zestawienie

Harness w przeglądarce (headless Chrome, sieć poza localhost zablokowana): oba `index.html` ładowane obok siebie, ta sama historia wstawiona do `workouts`, wynik z `dashboardModel(new Date("2026-10-13T12:00:00"))` (`badge.all`, `record`, `lastWorkout.record`) oraz `dashRecordEvents()`. Historie są syntetyczne i deterministyczne (nie pochodzą z danych użytkowników).
