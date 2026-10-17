# Odznaki Mekkio: lista do zaprojektowania i prompty

Dziesięć odznak z apki (`DASH_BADGES` w `index.html`). Styl wzorowany na odznakach Suunto ze zrzutów: płaskie wektory, jasna ramka z delikatnym wzorem, wstęga z krótkim napisem, drobny napis po łuku. Każda odznaka ma inny kształt (medalion, tarcza, tablica), tak jak Suunto różnicuje bieg i kolarstwo. Kolory z palety Mekkio: pomarańcz `#FF3300`, grafit `#343941`, miętowy `#2CDA9D`, krem, liliowy `#ECEAF1`.

## Lista

| # | Id | Nazwa | Warunek | Kształt |
|---|---|---|---|---|
| 1 | `first` | Chrzest Żelaza | 5 zapisanych treningów | okrągły medalion |
| 2 | `fullweek` | Pełny Etat | komplet treningów z planu przez 8 tygodni z rzędu | tarcza (herb) |
| 3 | `firstpr` | Rekordzista | 3 nowe rekordy ciężaru | okrągły medalion |
| 4 | `pr25` | Ściana Chwały | 100 rekordów łącznie | prostokąt z zaokrąglonymi rogami (jak odznaki kolarskie) |
| 5 | `beatweek` | Nokaut Tygodnia | najlepszy tydzień w historii pod względem objętości | okrągły medalion |
| 6 | `ton` | Wagon Towarowy | ponad 1000 t łącznej objętości | tarcza (herb) |
| 7 | `bodyweight` | Waga Ciężka | seria z ciężarem 1,5 × masa ciała | okrągły medalion |
| 8 | `growth3` | Rakieta | 8 tygodni z rzędu z większą objętością niż tydzień wcześniej | okrągły medalion |
| 9 | `allround` | Człowiek orkiestra | rekord w 15 różnych ćwiczeniach | prostokąt z zaokrąglonymi rogami |
| 10 | `gryf` | Gryf Mocy | 100 zapisanych treningów | okrągły medalion (najwyższa, złota) |

## Zasady wspólne

- Wygeneruj wszystkie dziesięć w jednej sesji i jednym narzędziu (ten sam seed lub wariant jednej udanej odznaki), żeby grubość ramki i styl były spójne.
- Jedna wersja kolorowa. Stan „niezdobyta” robi kod (szary + pierścień postępu), nie rysuj go osobno.
- Do apki: kwadrat, PNG 224×224 z przezroczystym tłem (lub SVG), pliki `first, fullweek, firstpr, pr25, beatweek, ton, bodyweight, growth3, allround, gryf` do `icons/badges/`.
- Napisy na odznace (wstęga, łuk) generatory często psują. Jeśli wyjdą nieczytelne, poproś o wersję bez napisów i dodaj tekst w Figmie.
- Odznaka musi być czytelna przy 44 pt: mało detali w środku, mocny kontrast figury do pola.

## Negatywny prompt (do każdej odznaki, jeśli narzędzie ma takie pole)

```
photo, realistic render, 3D, glossy plastic, drop shadow, busy background, human face, hands, gibberish text, misspelled text, watermark, logo, multiple badges, cartoon outline
```

## Wspólny początek promptu (już wpisany w każdy prompt niżej)

```
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024
```

*

## Prompty (do skopiowania za jednym razem)

Kolejność jak w tabeli: Chrzest Żelaza, Pełny Etat, Rekordzista, Ściana Chwały, Nokaut Tygodnia, Wagon Towarowy, Waga Ciężka, Rakieta, Człowiek orkiestra, Gryf Mocy.

```
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a round medallion with a deep graphite (#343941) field, a bright orange (#FF3300) barbell with a small lightning spark in the centre, the ribbon reads "FIRST", edge text "IRON BAPTISM".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a shield-shaped badge with an orange (#FF3300) and cream split background, a calendar page with eight tick marks in a row and a gold star above it, the ribbon reads "8 WEEKS", edge text "FULL TIME".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a round medallion with a mint (#2CDA9D) and graphite field, a weight plate wrapped in a laurel wreath with a small upward arrow, the ribbon reads "3 PR", edge text "RECORD HOLDER".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a rounded-rectangle plaque with an orange (#FF3300) background and a subtle brick-wall pattern, a golden trophy with a star in the centre, the ribbon reads "100 PR", edge text "WALL OF FAME".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a round medallion with a lilac (#ECEAF1) and graphite field, a boxing glove punching through a bullseye target, the ribbon reads "BEST WEEK", edge text "KNOCKOUT".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a shield-shaped badge with a dark graphite (#343941) background and orange details, a freight train wagon loaded with stacked weight plates, the ribbon reads "1000 T", edge text "FREIGHT TRAIN".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a round medallion with a blue-grey field and orange rim accents, a simplified faceless lifter figure in a deadlift pose seen from the side, silhouette style, the ribbon reads "1.5 x BW", edge text "HEAVYWEIGHT".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a round medallion with a mint (#2CDA9D) to graphite field, a rocket launching up along a rising bar chart of eight bars, the ribbon reads "8 WEEKS UP", edge text "ROCKET".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a rounded-rectangle plaque with a cream and orange background, a clipboard with fifteen small ticked rows and a tiny medal clipped to it, the ribbon reads "15 LIFTS", edge text "ALL-ROUNDER".
*
flat vector badge illustration in the style of a sports-watch app achievement badge (Suunto style), clean geometric shapes, solid flat colours with only a subtle gradient on the metal rim, thin cream-coloured outer rim with a small embossed pattern, a ribbon banner across the lower half with a short word in bold spaced capital letters, tiny arched text along the edge of the medallion, centered composition filling about 85% of the frame, transparent background, no drop shadow, no 3D render, no photo-realism, no people faces, square 1:1, 1024x1024. a round gold-rimmed medallion with a deep graphite field, a heavy Olympic barbell with two plates on a rising orange sun, laurel leaves on both sides, the ribbon reads "100", edge text "POWER BAR".
```
