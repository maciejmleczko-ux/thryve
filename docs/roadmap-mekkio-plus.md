# Mekkio+ – roadmapa funkcji premium: adaptacja planu (AI)

Dodane do roadmapy 2026-10-08. Status: **plan, nic jeszcze nie zbudowane.** Doprecyzowuje wcześniejszy szkic modelu freemium (Premium = Trener AI): płatna wartość to adaptacja planu na podstawie historii użytkownika.

Cel: użytkownik płaci za to, że aplikacja zna jego historię treningów i na jej podstawie zmienia plan (zamiast generować plan „z niczego”, co każdy dostaje za darmo w czacie).

## Zasady

1. AI i reguły proponują, użytkownik jednym dotknięciem zatwierdza lub odrzuca.
2. Rdzeń działa regułami i offline (siłownie bez zasięgu); AI dokłada wyjaśnienia i dopasowanie.
3. Propozycje wyłącznie z biblioteki Mekkio (każde ćwiczenie ma ikonę i opis).
4. Do modelu idą tylko dane treningowe (ćwiczenia, ciężary, daty), bez danych osobowych (RODO).
5. Bez obietnic zdrowotnych; to zmiana bodźca treningowego.
6. Każda propozycja ma krótkie uzasadnienie po polsku („dlaczego”).

## Fundament (wspólny dla wszystkich faz)

- Tagi ruchu i sprzętu przy ćwiczeniach (przysiad, wyciskanie, wiosłowanie…; maszyna, hantle, sztanga…): do wyboru zamiennika i trybu dom/siłownia/plener.
- Osobna historia dla każdego wariantu ćwiczenia (maszyna i hantle mają inne ciężary).
- Podpowiedź ciężaru z ostatniego treningu (pole serii nie zaczyna pusto).
- Ujednolicone dane planów (cel, poziom, sprzęt, opis).
- Konto i synchronizacja (krok 3 w kolejności rozwoju).

### Stan w kodzie (2026-10-08, wersja 4.57.0)

| Element fundamentu | Stan |
|---|---|
| Tag sprzętu | Częściowo: ćwiczenia w gotowych planach mają `equipment` („maszyny” itd.). Biblioteka ćwiczeń nie ma jeszcze tagów **wzorca ruchu** ani sprzętu per ćwiczenie. |
| Historia per wariant | Częściowo: historia jest liczona po nazwie ćwiczenia (`lastSessionsFor(name)`), więc warianty o różnych nazwach (np. Shoulder Press vs wyciskanie hantli) już mają osobne historie. Brak powiązania „to są warianty tego samego ruchu”. |
| Podpowiedź ciężaru | **Jest:** `lgPrefillFor()` wypełnia serię ciężarem i powtórzeniami z ostatniego treningu. |
| Ujednolicone dane planów | Częściowo: `customizationV2` (cel, trudność, sprzęt, częstotliwość) z „Dostosuj plan” (4.56.0). Brak wspólnego schematu dla wszystkich planów (gotowe / własne / AI). |
| Konto i synchronizacja | **Jest** (od 4.35.0, sync v2 od 4.43). |
| Rekordy / e1RM | **Jest:** szacowany maks (Epley) używany w statystykach — gotowy do reguły zastoju. |
| Trener AI + limit zapytań | **Jest:** Edge Function `ai-proxy` + tabela `ai_usage`. |

## Fazy

| Faza | Zakres | Płatność | Rozmiar | Zależy od |
|---|---|---|---|---|
| 0. Fundament | Tagi ruchu/sprzętu, historia per wariant, prefill ciężaru, normalizacja planów, zapis zdarzenia „zastój wykryty” bez UI. | free | średni | — |
| 1. Wykrycie zastoju | Reguła + baner „Stoisz w miejscu od 4 treningów w: Shoulder Press”. | wykrycie free (do decyzji), działania premium | mały | 0 |
| 2. Zmiana wariantu i powrót | Propozycja zamiennika na 4–6 tygodni (np. maszyna → hantle), potem pytanie o powrót z ostatnim ciężarem. | premium | średni | 0–1 |
| 3. Plan na dziś w zmienionych warunkach | Skrócenie sesji („mam 40 min”: zostają główne ćwiczenia, odpadają dodatki), podmiana sprzętu („bez sztangi”, dom/plener). | premium | średni | 0 + filtr miejsca (dom/siłownia/plener) |
| 4. Przegląd co 4 tygodnie z AI | Analiza historii, propozycje zmian objętości i ćwiczeń, wyjaśnienia po polsku, zatwierdzanie jednym dotknięciem. | premium | duży | konto i sync, fazy 1–2, API AI z limitem |
| 5. Plan z rozmowy i moduł trenera | Plan z odpowiedzi (cel, dni, sprzęt) tylko z biblioteki; dla trenera szkic planu dla podopiecznego do zatwierdzenia oraz alerty o zastoju i pominiętych treningach. | premium / trener | duży | moduł trener–podopieczny, faza 4 |

**Kolejność względem planu rozwoju:** fazy 0–2 w krokach 1–2 (wersja darmowa i App Store, dane lokalne); faza 3 razem z filtrem miejsca; faza 4 po koncie (krok 3); faza 5 po module trenera (krok 4) i w ramach kroku 5 (AI).

## Reguła zastoju (parametry startowe do strojenia)

- Minimum 4 zapisane treningi z danym ćwiczeniem.
- Zastój: brak poprawy najlepszej serii (ciężar, powtórzenia lub szacowane 1RM wg Epleya) w ostatnich 4 treningach.
- Nie sugeruj po przerwie dłuższej niż 14 dni.
- Maks. jedna propozycja na ćwiczenie co 6 tygodni; odrzucona nie wraca przez 8 tygodni.
- Lżejszy tydzień (deload): jeśli spadek jest planowany, nie traktuj go jako zastoju (do dopracowania). Uwaga: plany z „Zmienną intensywnością” (`plan.periodized`) celowo zmieniają ciężar co trening — reguła musi porównywać serie w obrębie tego samego poziomu (Max / Objętość / Siła / Gęstość), inaczej każdy lżejszy dzień wyglądałby jak zastój.

## Co płatne, a co nie

- **Free:** ręczna edycja i wymiana ćwiczeń, wykrycie zastoju (decyzja: czy baner ma być darmowy), historia i statystyki podstawowe.
- **Mekkio+:** zatwierdzane propozycje zmiany wariantu, plan na dziś, przegląd co 4 tygodnie, plan z rozmowy.
- **Trener:** szkice planów i alerty (osobna cena).
- Nie ograniczamy pojedynczych ćwiczeń paywallem.

## Jak sprawdzić przed budową

- Po 4 tygodniach ręczny przegląd dla 4 testerów na ich logach: „Zmieniłbyś plan tak, jak proponuję?” i „Zapłaciłbyś za to co miesiąc?”.
- Zapytać, kto doświadczył zastoju.
- Miary po wdrożeniu: odsetek zaakceptowanych propozycji, powrót progresu w 4–6 tygodni po zmianie, retencja w tygodniu 4 i 8, konwersja na Mekkio+, koszt AI na użytkownika. Wartości docelowe po pierwszych danych.

## Otwarte decyzje

1. Czy baner zastoju jest darmowy, a płatna dopiero akcja?
2. Cena i próg opłacalności (koszt zapytań AI na użytkownika).
3. Apple In-App Purchase dla treści cyfrowych w iOS: zweryfikować przed wdrożeniem. Domyślnie subskrypcja odblokowująca funkcje w apce na iOS idzie przez IAP; w UE (DMA) są dodatkowe ścieżki z płatnością zewnętrzną, ale z własnymi warunkami i prowizją — sprawdzić aktualne zasady przy wdrożeniu.
4. Czy trener płaci osobno, czy to wyższy plan Mekkio+.
5. Parametry reguły zastoju: po pierwszych danych od testerów.
