import re
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','landing'))+'/'
s=open(ROOT+'index.html').read()
miss=[]
def R(a,b,count=None):
    global s
    if a not in s: miss.append(a[:70]); return
    s=s.replace(a,b) if count is None else s.replace(a,b,count)

# ---------- head ----------
R('<html lang="pl">','<html lang="en">')
R('content="Układasz plan, na siłowni wpisujesz ciężar i powtórzenia, a Mekkio pokazuje, czy idziesz do przodu. Za darmo, po polsku, bez zakładania konta."',
  'content="Build your plan, log weight and reps at the gym, and Mekkio shows whether you\'re moving forward. Free, and no account needed."')
R('content="Mekkio · dziennik treningowy na iPhone\'a"','content="Mekkio · workout log for iPhone"')
R('content="Ty dźwigasz. Mekkio liczy."','content="You lift. Mekkio counts."')
R('content="https://mekkio.app/"','content="https://mekkio.app/en/"')
s=re.sub(r'<title>[^<]*</title>','<title>Mekkio · workout log for iPhone</title>',s,1)
# absolute asset paths (the page lives in /en/)
s=s.replace('href="img/','href="/img/').replace('src="img/','src="/img/').replace('url(img/','url(/img/')
s=s.replace("loader.loadAsync('3d/iphone.glb')","loader.loadAsync('/3d/iphone.glb')")
assert "'/3d/iphone.glb'" in s
# English screens / renders / crops
for n in ['r-orbit','r-split-l','r-split-r','r-caro-0','r-caro-1','r-caro-2','r-caro-3','r-caro-4','r-caro-5','r-ai','r-ai-blur','crop-ytd','crop-ring','crop-cal','scr-ai','scr-ai-blur','scr-logset','scr-gym-finish']:
    s=s.replace(f'/img/{n}.webp',f'/img/en/{n}.webp')
s=s.replace('data-screen="img/scr-','data-screen="/img/en/scr-').replace('data-blur="img/scr-','data-blur="/img/en/scr-')
R('data-screens="img/scr-dashboard.webp img/scr-gym.webp img/scr-logset.webp"','data-screens="/img/en/scr-dashboard.webp /img/en/scr-gym.webp /img/en/scr-logset.webp"')
# hreflang + canonical
R('<link rel="canonical" href="https://mekkio.app/">','<link rel="canonical" href="https://mekkio.app/en/">')

T=[
# nav + hero
('aria-label="Mekkio, strona główna"','aria-label="Mekkio, home"'),
('aria-label="Sekcje strony"','aria-label="Page sections"'),
('>Jak to działa</a>','>How it works</a>'),('>Funkcje</a>','>Features</a>'),('>Trener AI</a>','>AI Coach</a>'),('>Pytania</a>','>FAQ</a>'),
('<a href="/kontakt">Kontakt</a>','<a href="/en/contact">Contact</a>'),
('aria-label="Aplikacja na iPhone\'a wkrótce w App Store"','aria-label="iPhone app coming soon to the App Store"'),
('<small>Wkrótce w</small>','<small>Coming soon to</small>'),
('<span class="l1">każda seria</span><span class="l2">jest ważna</span>','<span class="l1">every rep</span><span class="l2">counts</span>'),
("alt=\"Trzy iPhone'y z aplikacją Mekkio: pulpit z planem na dziś i podsumowaniem tygodnia, ekran treningu z ćwiczeniami z planu oraz logowanie serii z wyborem ciężaru i powtórzeń\"",
 'alt="Three iPhones running Mekkio: the dashboard with today\'s plan and weekly summary, the workout screen with the exercises from your plan, and set logging with weight and reps"'),
('aria-label="Poprzedni ekran"','aria-label="Previous screen"'),('aria-label="Następny ekran"','aria-label="Next screen"'),
('Ty dźwigasz.<br>Mekkio liczy.','You lift.<br>Mekkio counts.'),
('Układasz plan, na siłowni wpisujesz ciężar i powtórzenia, a apka pokazuje, czy idziesz do przodu. Bez arkuszy i notatek w telefonie.',
 "Build your plan, log weight and reps at the gym, and the app shows whether you're moving forward. No spreadsheets, no notes app."),
# split
('Po co to','Why it matters'),
('Notatki w telefonie nie powiedzą Ci, czy robisz postęp. <em>Mekkio powie od razu.</em>',"A notes app won't tell you if you're making progress. <em>Mekkio tells you right away.</em>"),
('Po lewej wpisujesz serie, po prawej widzisz wynik. Mekkio porównuje każdą serię z poprzednim treningiem i pokazuje, co się zmieniło, zaraz po zapisaniu.',
 'Log your sets on the left, see the result on the right. Mekkio compares every set with your previous workout and shows what changed the moment you save.'),
('alt="Logowanie serii: Incline Chest, ciężar 27 kg ustawiany na tarczy, powtórzenia i lista trzech serii"','alt="Set logging: Incline Chest, 27 kg set on the dial, reps and a list of three sets"'),
('alt="Ekran po treningu: nowy rekord 75 kg w Leg Press Machine, 46 min, 7 ćwiczeń, 412 kcal, objętość 5693 kg, +8% względem poprzedniego treningu"',
 'alt="After the workout: new 75 kg record on Leg Press Machine, 46 min, 7 exercises, 412 kcal, 5,693 kg volume, +8% vs the previous workout"'),
# carousel
('Od planu do rekordu.<br><span style="color:var(--m-on-dark-muted)">Sześć ekranów, zero arkuszy.</span>','From plan to personal record.<br><span style="color:var(--m-on-dark-muted)">Six screens, zero spreadsheets.</span>'),
('aria-roledescription="karuzela" aria-label="Ekrany aplikacji"','aria-roledescription="carousel" aria-label="App screens"'),
('alt="Pulpit: plan na dziś z przyciskiem Start, podsumowanie tygodnia, ostatni rekord i odznaka"','alt="Dashboard: today\'s plan with a Start button, this week\'s summary, latest record and badge"'),
('alt="Trening: Fullbody Workout, licznik czasu, Powtórz ostatni trening, rozgrzewka i kafle ćwiczeń"','alt="Workout: Fullbody Workout, timer, Repeat last workout, warm-up and exercise tiles"'),
('alt="Logowanie serii: ciężar na tarczy, powtórzenia plusem i minusem, lista serii"','alt="Set logging: weight on a dial, reps with plus and minus, list of sets"'),
('alt="Ekran po treningu: nowy rekord, czas, ćwiczenia, kalorie, objętość i porównanie z poprzednim treningiem"','alt="After the workout: new record, time, exercises, calories, volume and a comparison with the previous workout"'),
('alt="Historia: kalendarz października z zaznaczonymi treningami i podsumowaniem wybranego dnia"','alt="History: an October calendar with workouts marked and a summary of the selected day"'),
('alt="Postępy: pierścień tygodnia, kalorie, masa ciała i objętość od początku roku"','alt="Progress: weekly ring, calories, body weight and volume year to date"'),
("['Pulpit','Tydzień na jednym ekranie','Plan na dziś startujesz jednym stuknięciem. Obok podsumowanie tygodnia, ostatni rekord i odznaki.'],",
 "['Dashboard','Your week on one screen','Start today\\'s plan with one tap. Right next to it: your week, your latest record and badges.'],"),
("['Trening','Plan na dziś','Rozgrzewka, ćwiczenia z planu i czas treningu na jednym ekranie. Ćwiczenie zajęte? Ikonka w rogu kafla pokaże zamiennik.'],",
 "['Workout','Today\\'s plan','Warm-up, the exercises from your plan and the workout timer on one screen. Exercise taken? The icon in the tile\\'s corner shows a swap.'],"),
("['Seria po serii','Wpisujesz, nie liczysz','Ciężar ustawiasz na tarczy, powtórzenia plusem i minusem. Seria zapisana, lecisz dalej.'],",
 "['Set by set','You log, it counts','Set the weight on the dial, reps with plus and minus. Set saved, on to the next one.'],"),
("['Po treningu','Wynik od razu','Od razu widzisz, czy padł rekord, ile to trwało, ile spaliłeś i jak wypadłeś na tle poprzedniego treningu.'],",
 "['After the workout','Results right away','See right away whether you hit a record, how long it took, how much you burned and how you did against your last workout.'],"),
("['Historia','Cały miesiąc w kalendarzu','Zrobione, zaplanowane i przepadłe treningi. Stuknij dzień, żeby zobaczyć szczegóły.'],",
 "['History','The whole month in a calendar','Done, planned and missed workouts. Tap a day to see the details.'],"),
("['Postępy','Postęp, który widać','Pierścień tygodnia, kalorie, masa ciała i objętość od początku roku.']",
 "['Progress','Progress you can see','Weekly ring, calories, body weight and volume year to date.']"),
# features
('Zrobione pod to, co naprawdę <span class="dim">dzieje się na siłowni.</span>','Built for what actually <span class="dim">happens at the gym.</span>'),
('Zajęta maszyna, zapomniane ustawienie siedzenia, telefon, który padł w połowie treningu. Każda z tych rzeczy ma w Mekkio rozwiązanie.',
 'A machine that\'s taken, a forgotten seat setting, a phone that died mid-workout. Mekkio has an answer for each of them.'),
('<h3>Rekord i prognoza maxa</h3>','<h3>Records and projected max</h3>'),
('Rekord to najcięższy ciężar, jaki podniosłeś. Ale jedno powtórzenie więcej przy tym samym ciężarze też jest postępem. Widać je w prognozie maxa.',
 "Your record is the heaviest weight you've lifted. But one more rep at the same weight is progress too, and it shows in your projected max."),
('aria-label="Przykład: Chest Press 35 kg. Poprzednio 8 powtórzeń, dziś 9. Prognoza maxa rośnie z 44,3 do 45,5 kg."','aria-label="Example: Chest Press 35 kg. Last time 8 reps, today 9. Projected max goes from 44.3 to 45.5 kg."'),
('<span>Poprzedni trening</span>','<span>Last workout</span>'),('<span>Dziś</span>','<span>Today</span>'),('<span class="plus">+1 powt.</span>','<span class="plus">+1 rep</span>'),
('<span class="k">Prognoza maxa · e1RM</span>','<span class="k">Projected max · e1RM</span>'),
('<span class="p1-num" data-from="44.3" data-to="45.5">45,5</span>','<span class="p1-num" data-from="44.3" data-to="45.5">45.5</span>'),
('<span class="d">+1,2 kg · Chest Press</span>','<span class="d">+1.2 kg · Chest Press</span>'),
("fmt = function(x){ return x.toFixed(1).replace('.', ','); }","fmt = function(x){ return x.toFixed(1); }"),
('aria-label="Co Mekkio liczy jako rekord"><li class="on">Najcięższy ciężar</li><li>Najwięcej powtórzeń</li><li>Najdłuższy czas</li><li>Objętość treningu</li>',
 'aria-label="What Mekkio counts as a record"><li class="on">Heaviest weight</li><li>Most reps</li><li>Longest time</li><li>Workout volume</li>'),
('<h3>Cały rok na jednym wykresie</h3>','<h3>Your whole year on one chart</h3>'),
('Objętość od stycznia, miesiąc po miesiącu, plus kalorie, masa ciała i linia ciężaru w każdym ćwiczeniu. Wykresy przesuwasz palcem.',
 'Volume since January, month by month, plus calories, body weight and a weight line for every exercise. Swipe between the charts.'),
('alt="Karta Objętość od początku roku: 129 940 kg, wykres rosnący od stycznia do września"','alt="Volume year to date card: a chart rising from January to September"'),
('<h3>Pierścień tygodnia</h3>','<h3>Weekly ring</h3>'),
('Ile treningów z planu już za Tobą, a ile zostało.',"How many of this week's planned workouts are done and how many are left."),
('alt="Postęp tygodniowy: 2 z 5 dni zrobione"','alt="Weekly progress: 2 of 5 days done"'),
('<h3>Historia w kalendarzu</h3>','<h3>History in a calendar</h3>'),
('Zrobione, zaplanowane i przepadłe treningi. Każdy wpis rozwiniesz do pełnego podsumowania.','Done, planned and missed workouts. Open any entry for the full summary.'),
('alt="Kalendarz września z zaznaczonymi treningami"','alt="Calendar with workouts marked"'),
('<h3>Zmienna intensywność</h3>','<h3>Changing intensity</h3>'),
('Jeden przełącznik w Kreatorze i ćwiczenia zmieniają wersję co tydzień: od maksymalnego ciężaru po dużo powtórzeń. Apka podpowie ciężar na dziś.',
 "One switch in the Builder and your exercises change version every week, from max weight to high reps. The app suggests today's weight."),
('<em class="wk">tydz. 1</em><em class="wk">tydz. 2</em><em class="wk">tydz. 3</em><em class="wk">tydz. 4</em>','<em class="wk">wk 1</em><em class="wk">wk 2</em><em class="wk">wk 3</em><em class="wk">wk 4</em>'),
('<em>Przysiad</em>','<em>Squat</em>'),('<em>Wyciskanie</em>','<em>Bench</em>'),('<em>Wiosłowanie</em>','<em>Row</em>'),
('>Średnio</i>','>Medium</i>'),('>Duży</i>','>Heavy</i>'),('>Dużo&nbsp;powt.</i>','>High&nbsp;reps</i>'),
('<h3>Zamiana na dziś</h3>','<h3>Swap for today</h3>'),('Maszyna zajęta? Zamiennik na tę samą partię. Plan zostaje bez zmian.',"Machine taken? Get a swap for the same muscle group. Your plan stays as it is."),
('<h3>Notatki przy ćwiczeniu</h3>','<h3>Exercise notes</h3>'),('Wysokość siedzenia, chwyt, numer maszyny. Wrócą przy następnym otwarciu.',"Seat height, grip, machine number. They're back the next time you open the exercise."),
('<h3>Trening nie przepada</h3>','<h3>Nothing gets lost</h3>'),('Zamkniesz apkę albo padnie bateria. Wpisane serie poczekają na miejscu.','Close the app or run out of battery. Your logged sets wait right where you left them.'),
('<h3>Rozgrzewka i rozciąganie</h3>','<h3>Warm-up and stretching</h3>'),('Dobierają się same do partii, które dziś trenujesz. Zegar prowadzi krok po kroku.','Picked automatically for the muscles you train today. A timer walks you through each step.'),
('<h3>Jak ćwiczyć</h3>','<h3>How to do it</h3>'),('Przy każdym ćwiczeniu ilustracja, ustawienie, ruch i najczęstszy błąd. Wystarczy przesunąć palcem.','Every exercise comes with an illustration, setup, movement and the most common mistake. Just swipe.'),
('<h3>Rekordy i odznaki</h3>','<h3>Records and badges</h3>'),('W Profilu rekordy przejrzysz miesiąc po miesiącu i zobaczysz, ile brakuje do kolejnej odznaki.','Browse your records month by month in your Profile and see how close you are to the next badge.'),
('<h3>Karta treningu</h3>','<h3>Workout card</h3>'),('Trening jako grafika na Stories, w 4:5 albo 1:1. Udostępnisz ją prosto z ekranu Gratulacje.','Your workout as a graphic for Stories, 4:5 or 1:1. Share it straight from the end-of-workout screen.'),
('<h3>Plan przez link</h3>','<h3>Share a plan by link</h3>'),('Wyślij plan SMS-em albo na WhatsAppie. Druga osoba nie musi zakładać konta.',"Send a plan by text or WhatsApp. The other person doesn't need an account."),
('<h3>Każdy sprzęt</h3>','<h3>Any equipment</h3>'),('Sztanga, hantle, maszyny, kettlebell, gumy oporowe i kalistenika. Plank albo kardio odmierzy zegar.','Barbell, dumbbells, machines, kettlebells, resistance bands and calisthenics. Planks and cardio run on a timer.'),
# AI
('>Trener AI</span>','>AI Coach</span>'),
('Po treningu dostajesz konkretną wskazówkę <span style="color:var(--m-on-dark-muted)">na następny.</span>','After every workout you get a concrete tip <span style="color:var(--m-on-dark-muted)">for the next one.</span>'),
('Trener AI przegląda zapisany trening i porównuje go z poprzednimi. Zamiast ogólników mówi wprost, co zrobić przy konkretnym ćwiczeniu.',
 'AI Coach reviews your saved workout and compares it with the previous ones. Instead of generic advice, it tells you exactly what to do with a specific exercise.'),
('Krótkie podsumowanie treningu i ćwiczenia, w których widać spadek sił albo realny postęp.',"A short workout summary, plus the exercises where you're losing strength or making real progress."),
('Kiedy następnym razem otworzysz to ćwiczenie, podpowiedź będzie czekać w przeglądzie, razem z celem na dziś.',"Next time you open that exercise, the tip is waiting in the overview, together with today's target."),
('Ustawiasz cel i to, czego unikać, na przykład kontuzjowany bark. Sugestie biorą to pod uwagę.','Set your goal and what to avoid, like an injured shoulder. The suggestions take it into account.'),
('aria-label="Przykładowe okno Trenera AI z podsumowaniem treningu i wskazówkami na następny trening"','aria-label="Example AI Coach window with a workout summary and tips for the next workout"'),
('<span class="pill-label">Jak to działa</span>','<span class="pill-label">How it works</span>'),
('<span class="pill-label">Funkcje</span>','<span class="pill-label">Features</span>'),
('TRENER AI','AI COACH'),
("b.setAttribute('aria-label','Ekran '+(i+1)","b.setAttribute('aria-label','Screen '+(i+1)"),
('Trening obejmował 8 ćwiczeń na całe ciało przy łącznej objętości ponad 10800 kg, z dwoma nowymi rekordami w brzuchu i biceps.',
 'A full-body workout with 8 exercises and over 10,800 kg of total volume, with two new records, for abs and biceps.'),
('Barki i klatka wyraźnie osłabły pod koniec serii, w Shoulder Press i Chest Press zabrakło Ci sił na te same powtórzenia w ostatnich seriach, więc te ćwiczenia są blisko granicy wysiłku. Preacher Curl pokazuje realny postęp w kilku ostatnich sesjach, nie tylko jednorazowy skok. Warto też zauważyć, że w ostatnim tygodniu wyraźnie częściej trenujesz mięśnie, które pchają, niż te, które ciągną, więc dobrze byłoby dołożyć trochę pracy na plecy.',
 "Shoulders and chest clearly faded towards the end of your sets: on Shoulder Press and Chest Press you couldn't match the same reps in the last sets, so those lifts are close to your limit. Preacher Curl shows real progress over the last few sessions, not just a one-off jump. Over the past week you've also trained pushing muscles much more often than pulling ones, so it would be good to add some back work."),
('Na następny trening','For your next workout'),
('Dołóż 2,5 kg przy następnym treningu, bo od kilku sesji rośnie liczba powtórzeń przy tym samym ciężarze','Add 2.5 kg next time, your reps at this weight have been going up for several sessions'),
('Zostań przy tym ciężarze i popracuj nad formą, seria wyraźnie traci na sile pod koniec','Stay at this weight and work on form, the set clearly loses power towards the end'),
('Trzymaj obecny ciężar i kontroluj technikę, pamiętając o ostrożności wobec prawego kolana','Keep the current weight and control your technique, going easy on your right knee'),
('Trener AI działa po zalogowaniu. To podpowiedzi treningowe, a nie porada medyczna: przy bólu albo kontuzji idź do fizjoterapeuty. Tekst na ekranie jest przykładowy.',
 "AI Coach works when you're signed in. These are training tips, not medical advice: if you're in pain or injured, see a physiotherapist. The text on screen is an example."),
# data
('>Twoje dane</span>','>Your data</span>'),
('Twoje treningi <span class="dim">należą do Ciebie.</span>','Your workouts <span class="dim">belong to you.</span>'),
('<h3>Bez konta na start</h3>','<h3>No account to start</h3>'),('Otwierasz i trenujesz. Dane zostają na telefonie, dopóki sam nie założysz konta.','Open it and train. Your data stays on your phone until you decide to create an account.'),
('<h3>Zaloguj się przez Apple</h3>','<h3>Sign in with Apple</h3>'),('Jedno dotknięcie i Face ID. Możesz ukryć swój e-mail, a treningi i tak zobaczysz na każdym urządzeniu.','One tap and Face ID. You can hide your email and still see your workouts on every device.'),
('<h3>Pobierz wszystko</h3>','<h3>Download everything</h3>'),('Plany, treningi, wagę i notatki pobierzesz jednym przyciskiem w Profilu, w Ustawieniach i koncie.','Plans, workouts, weight and notes, with one button in your Profile under Settings and account.'),
('<h3>Usuń konto w apce</h3>','<h3>Delete your account in the app</h3>'),('Bez maili do supportu. Konto i dane w chmurze znikają ze wszystkich urządzeń.','No emails to support. Your account and cloud data disappear from every device.'),
('href="/polityka-prywatnosci">Przeczytaj politykę prywatności','href="/en/privacy">Read the privacy policy'),
# price
('0<span>zł</span>','<span style="margin:0 .04em 0 0">$</span>0'),
('>Cena</span>','>Price</span>'),('Teraz płacisz zero.','Right now it costs nothing.'),
('Wszystkie funkcje są teraz darmowe, łącznie z Trenerem AI. Jeśli kiedyś pojawi się płatna wersja, dowiesz się o tym w apce, zanim cokolwiek się zmieni.',
 "Every feature is free right now, AI Coach included. If a paid version ever arrives, you'll hear about it in the app before anything changes."),
# faq
('>Pytania</span>','>FAQ</span>'),
('Zanim <span class="dim">zaczniesz</span>','Before <span class="dim">you start</span>'),
('Nie ma tu Twojego pytania? Zajrzyj do <a href="/kontakt">pomocy</a> albo napisz na','Can\'t find your question? Check the <a href="/en/contact">help page</a> or write to'),
('Na jakim telefonie działa Mekkio?','What phone does Mekkio run on?'),("Mekkio to aplikacja na iPhone'a. Już wkrótce będzie do pobrania z App Store.","Mekkio is an iPhone app. It's coming to the App Store soon."),
('Kiedy Mekkio będzie w App Store?','When will Mekkio be on the App Store?'),('Wkrótce, kończymy ostatnie przygotowania. Gdy tylko aplikacja będzie dostępna, link do App Store pojawi się na tej stronie.',"Soon, we're wrapping up the last details. As soon as it's available, the App Store link will appear on this page."),
('Czy muszę zakładać konto?','Do I need an account?'),
('Nie. Bez konta wszystko działa, a dane zostają na tym jednym telefonie. Konto przydaje się, kiedy chcesz mieć treningi na kilku urządzeniach, nie stracić ich przy zmianie telefonu albo korzystać z Trenera AI.',
 "No. Everything works without one, and your data stays on this one phone. An account helps when you want your workouts on several devices, don't want to lose them when you switch phones, or want to use AI Coach."),
('Co się stanie z moimi danymi, kiedy zmienię telefon?','What happens to my data when I switch phones?'),
('Z kontem zalogujesz się na nowym telefonie i wszystko będzie na miejscu. Bez konta utwórz kopię zapasową w Profilu (Ustawienia i konto) i wczytaj ją na nowym telefonie. Jeśli trenowałeś jako gość i dopiero zakładasz konto, nic nie przepada: plany, treningi i notatki dołączą do konta.',
 "With an account, sign in on the new phone and everything is there. Without one, create a backup in your Profile (Settings and account) and restore it on the new phone. If you trained as a guest and only now create an account, nothing is lost: your plans, workouts and notes move into the account."),
('Czy Mekkio łączy się z Apple Zdrowie?','Does Mekkio connect to Apple Health?'),
("Tak, jeśli chcesz. Po włączeniu w Profilu Mekkio pobiera z Apple Zdrowie wagę i kalorie spalone na treningu, które zmierzył zegarek. Dostęp odbierzesz w każdej chwili w Ustawieniach iPhone'a.",
 "Yes, if you want it to. Turn it on in your Profile and Mekkio reads your weight and the workout calories your watch measured from Apple Health. You can revoke access anytime in your iPhone's Settings."),
('Czy Trener AI zastąpi prawdziwego trenera?','Will AI Coach replace a real coach?'),
('Nie. Dobrze pilnuje progresji i łapie spadki formy, ale nie widzi Twojej techniki. Traktuj jego sugestie jak podpowiedzi. Przy bólu albo kontuzji skonsultuj się z fizjoterapeutą lub lekarzem.',
 "No. It's good at keeping track of progression and catching drops in strength, but it can't see your technique. Treat its suggestions as tips. If you're in pain or injured, see a physiotherapist or a doctor."),
('Mam już swój plan. Muszę układać go od nowa?','I already have a plan. Do I have to build it from scratch?'),
('Przepiszesz go w Kreatorze w kilka minut: wybierasz dni, dodajesz ćwiczenia, ustawiasz serie. Jeśli ktoś ma plan w Mekkio, może Ci go po prostu wysłać linkiem.',
 'You can copy it into the Builder in a few minutes: pick the days, add exercises, set your sets. If someone already has the plan in Mekkio, they can just send it to you as a link.'),
('Mogę dodać ćwiczenie, którego nie ma w bibliotece?',"Can I add an exercise that isn't in the library?"),
('Tak. Tworzysz własne ćwiczenie, przypisujesz partię mięśniową i sprzęt, a potem używasz go w planach jak każdego innego.','Yes. Create your own exercise, assign a muscle group and equipment, then use it in plans like any other.'),
# final + footer
('Następny trening<br>zapisz już w Mekkio.','Log your next workout<br>in Mekkio.'),
('Otwierasz, wybierasz plan i idziesz na siłownię. Rejestracja nie jest potrzebna.','Open it, pick a plan and head to the gym. No sign-up needed.'),
('Chętnie odpiszemy<br>na każdą wiadomość.',"We're happy to reply<br>to every message."),
('<h4>Aplikacja</h4>','<h4>App</h4>'),('App Store · wkrótce','App Store · coming soon'),
('<h4>Kontakt</h4>','<h4>Contact</h4>'),('<a href="/kontakt">Pomoc i kontakt</a>','<a href="/en/contact">Help and contact</a>'),
('<h4>Prawne</h4>','<h4>Legal</h4>'),('<a href="/polityka-prywatnosci">Polityka prywatności</a>','<a href="/en/privacy">Privacy policy</a>'),
]
for a,b in T: R(a,b)
# language switch: next to the nav links (PL on the English page)
R('<a class="lang-switch" href="/en/" hreflang="en" lang="en" aria-label="English">EN</a>','<a class="lang-switch" href="/" hreflang="pl" lang="pl" aria-label="Polski">PL</a>')
open(ROOT+'en/index.html','w').write(s)
print('missing:', miss)
# leftover Polish check (text + attributes + inline JS)
body=s[s.index('<body'):]
left=re.findall(r'[^<>"\'\n]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^<>"\'\n]*', re.sub(r'<style.*?</style>','',body,flags=re.S))
left=[l.strip() for l in left if l.strip() and not l.strip().startswith(('/*','//','*'))]
print('leftover:', left[:40])
