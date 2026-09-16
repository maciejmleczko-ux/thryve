// Mekkio — Faza "AI asystent", Krok 0: bezpieczny proxy do Anthropic API.
// Klient nigdy nie zna klucza API — woła tę funkcję z tokenem sesji Supabase,
// funkcja sprawdza limit dzienny i sama dokleja klucz z sekretu.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Ile wywołań danej funkcji AI może zrobić jeden user w ciągu doby.
// Startowo nisko — łatwiej podnieść limit niż odzyskać przepalone kredyty.
const DAILY_LIMIT = 20;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Wspólne zasady poprawnej polszczyzny (skrót normy Rady Języka Polskiego
// 2024/skill poprawna-polszczyzna, zawężony do tego, co faktycznie dotyczy
// krótkiego, liczbowego tekstu treningowego) — doklejane do KAŻDEJ funkcji
// AI poniżej, żeby nie duplikować w każdym prompt-cie z osobna.
const PL_LANGUAGE_RULES =
  'Zasady języka: liczby dziesiętne zapisuj z przecinkiem, nie kropką (82,5 kg, nie ' +
  '82.5 kg). Jednostkę oddziel spacją (70 kg, nie 70kg). Nigdy nie używaj myślnika em ' +
  '(—) jako pauzy retorycznej — zamiast niego przecinek, dwukropek albo krótsze zdanie. ' +
  'Przecinek zawsze przed "że", "który", "bo", "gdy", "jeśli" oraz przed całym ' +
  'zestawieniem typu "mimo że", "podczas gdy"; nigdy przed pojedynczym "i"/"lub"/"albo", ' +
  'jeśli spójnik nie jest powtórzony. Nie powtarzaj tego samego słowa w jednym zdaniu. ' +
  'Nie pisz pustych zdań, które nic nie wnoszą (np. "to świetny wynik", "brawo"). ' +
  'Odmieniaj nazwy ćwiczeń i liczebniki gramatycznie poprawnie w zdaniu.';

// Każda funkcja AI ma tu swój prompt — klient wysyła tylko dane, nigdy
// gotowy prompt, żeby nie dało się przez konsolę przeglądarki podmienić
// systemowej instrukcji. jsonResponse:true → handler niżej parsuje
// odpowiedź modelu jako JSON i zwraca ją klientowi 1:1 zamiast {text}.
const FEATURES: Record<string, (payload: unknown) => { system: string; user: string; maxTokens: number; jsonResponse?: boolean }> = {
  // Krok 1, "szerzej i porządnie" (Maciej, 2026-09-16), potem przepisane na
  // strukturalny JSON zamiast dwóch akapitów prozy (Maciej, 2026-09-16: chce
  // 1) krótkie podsumowanie, 2) komentarz o spadku/progresie, 3) czytelną
  // listę konkretnych akcji per ćwiczenie — trzy różne bloki w popupie, nie
  // ściana tekstu). payload kształt:
  //   exercises[]: {name, group, sets:[{weightKg,reps}], rpe, isNewRecord, repFadePercent, trend}
  //     trend[]: {date, weightKg, reps} — best set z do 3 POPRZEDNICH sesji tego
  //     ćwiczenia, od najstarszej do najnowszej (może być [] — brak historii)
  //   muscleGroupsThisWorkout[]: {group, sets, highVolume}  — >10 serii/partię w TYM treningu
  //   neglectedGroups[]: {group, daysSinceLastTrained}      — partie pominięte >7 dni (może być [])
  //   pushPullBalance: {pushSets, pullSets, skewed} | null  — z ostatnich 7 dni, null gdy za mało danych
  //   userPreferences: {goal, avoid} | null — ustawione ręcznie w panelu konta, może być null
  last_workout_summary: (payload) => ({
    system:
      'Jesteś asystentem fitness w aplikacji Mekkio, analizujesz pojedynczy trening jak ' +
      'doświadczony trener personalny. Dane wejściowe (JSON) to jeden, najnowszy trening: ' +
      'data, czas trwania, ćwiczenia z realnymi seriami (waga w kg, powtórzenia), ' +
      'opcjonalnym RPE (1-10, ile wysiłku kosztowała seria — 9-10 to blisko upadku, ' +
      'poniżej 6 to duży zapas sił), repFadePercent (spadek powtórzeń między pierwszą a ' +
      'ostatnią serią — wysoki spadek też sugeruje pracę blisko upadku), flagą isNewRecord, ' +
      'i trend (wynik z do 3 poprzednich sesji tego ćwiczenia, od najstarszej — użyj tego, ' +
      'żeby odróżnić realny, wieloseryjny postęp od jednorazowego dobrego dnia; pusta lista ' +
      'oznacza brak wcześniejszej historii, to normalne przy nowym ćwiczeniu). Plus krótki ' +
      'kontekst z ostatnich 7 dni: muscleGroupsThisWorkout (liczba serii per partia ' +
      'mięśniowa w TYM treningu, highVolume=true przy >10 serii na partię — to dużo jak na ' +
      'jedną sesję), neglectedGroups (partie nietrenowane bezpośrednio dłużej niż tydzień — ' +
      'może być pusta lista, to normalne), pushPullBalance (bilans serii pchających vs ' +
      'ciągnących z ostatnich 7 dni, skewed=true przy wyraźnym przekrzywieniu — może być ' +
      'null, gdy za mało danych). Na końcu userPreferences — ustawione ręcznie przez ' +
      'użytkownika w apce, może być null: goal to cel treningowy ("masa" = wyższa objętość, ' +
      '8-12 powtórzeń w serii; "sila" = niższe powtórzenia 3-6, większy ciężar; ' +
      '"wytrzymalosc" = wyższe powtórzenia, mniejszy ciężar; "ogolna" = bez konkretnego ' +
      'nachylenia), a avoid to wolny tekst o kontuzji/ograniczeniu — jeśli jest ustawiony, ' +
      'NIGDY nie sugeruj zwiększania ciężaru ani obciążenia w ćwiczeniu, które może dotyczyć ' +
      'tego obszaru; zamiast tego zaproponuj ostrożność albo alternatywę. ' +
      'Zwróć WYŁĄCZNIE poprawny JSON, bez markdown, bez ``` , bez żadnego tekstu poza samym ' +
      'obiektem, dokładnie w tym kształcie: {"summary": "...", "analysis": "...", ' +
      '"actions": [{"exercise": "...", "action": "..."}]}. summary: 1-2 zdania, bardzo ' +
      'krótkie podsumowanie TEGO treningu (liczba ćwiczeń, objętość, ewentualnie jedno ' +
      'słowo o rekordzie jeśli isNewRecord) — NIE wyliczaj każdego ćwiczenia z osobna. ' +
      'analysis: 1-3 zdania — komentarz o KONKRETNYCH ćwiczeniach (po nazwie) ze spadkiem ' +
      'powtórzeń/wysokim RPE (blisko granicy wysiłku) albo z realnym, wieloseryjnym ' +
      'postępem (po trend); jeśli w danych jest istotny sygnał kontekstowy (highVolume=true, ' +
      'niepusta neglectedGroups, albo skewed=true), wspomnij o NAJWAŻNIEJSZYM jednym z nich ' +
      'jednym zdaniem; jeśli nic się nie wyróżnia, jedno neutralne zdanie że trening ' +
      'przebiegł standardowo — nie zmyślaj problemu, którego nie ma. actions: wybierz 1-3 ' +
      'NAJWAŻNIEJSZE ćwiczenia z tej listy exercises (dokładna nazwa, skopiowana z danych), ' +
      'NIE każde — te, gdzie repFadePercent/trend/RPE/isNewRecord faktycznie sugerują zmianę ' +
      'na następny trening; action to krótka, konkretna czynność, np. "dołóż 2,5 kg", "zrób ' +
      'jedną serię więcej", "spróbuj jedno powtórzenie więcej w każdej serii", "zostań przy ' +
      'tym ciężarze i popracuj nad formą"; jeśli żadne ćwiczenie się nie wyróżnia, actions ' +
      'może być pustą listą []. Wszystkie trzy pola: dopasuj do celu z userPreferences ' +
      '(jeśli podany) i respektuj avoid (jeśli podany) — patrz zasada wyżej. Wszystko musi ' +
      'wynikać wyłącznie z podanych danych — nie zgaduj i nie wymyślaj wartości, których nie ' +
      'dostałeś. WAŻNE — piszesz dla przeciętnego użytkownika siłowni, nie dla trenera ani ' +
      'studenta AWF: nazwy pól z JSON-a wejściowego (RPE, push/pull, fade, isNewRecord, ' +
      'highVolume, trend, goal, avoid) to etykiety danych dla Ciebie, nie słowa do użycia w ' +
      'odpowiedzi. Zamiast żargonu opisz to zwykłymi słowami — np. zamiast "balans push/pull ' +
      'jest skewed" napisz "częściej trenujesz mięśnie, które pchają (klatka, barki, ' +
      'triceps), niż te, które ciągną (plecy, biceps)"; zamiast "wysokie RPE" napisz "seria ' +
      'była bliska granicy wysiłku"; zamiast "duży fade" napisz coś jak "pod koniec zabrakło ' +
      'Ci sił na te same powtórzenia". Krótkie, konkretne zdania, zero specjalistycznych ' +
      'skrótów. Ton: rzeczowy, konkretny, jak trener, bez sztucznego entuzjazmu i ' +
      'wykrzykników. ' + PL_LANGUAGE_RULES,
    user: JSON.stringify(payload),
    maxTokens: 650,
    jsonResponse: true,
  }),
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'missing_auth' }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const jwt = authHeader.replace('Bearer ', '');
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return json({ error: 'invalid_auth' }, 401);
  }
  const userId = userData.user.id;

  let body: { feature?: string; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const feature = body.feature ?? '';
  const buildPrompt = FEATURES[feature];
  if (!buildPrompt) {
    return json({ error: 'unknown_feature' }, 400);
  }

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const { count, error: countErr } = await supabase
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', since.toISOString());

  if (countErr) {
    console.error('rate check failed', countErr);
    return json({ error: 'rate_check_failed' }, 500);
  }
  if ((count ?? 0) >= DAILY_LIMIT) {
    return json({ error: 'rate_limited' }, 429);
  }

  const { system, user, maxTokens, jsonResponse } = buildPrompt(body.payload);

  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: maxTokens,
      // Sonnet 5 runs adaptive thinking by default, and thinking tokens
      // count against max_tokens — with a short budget like ours, thinking
      // alone can eat the whole thing (stop_reason "max_tokens" before any
      // real text) and also bills like output. This task is short-form
      // writing from signals we already computed, not multi-step reasoning,
      // so it doesn't need thinking — turn it off.
      thinking: { type: 'disabled' },
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!aiRes.ok) {
    console.error('anthropic error', aiRes.status, await aiRes.text());
    return json({ error: 'ai_call_failed' }, 502);
  }

  const aiJson = await aiRes.json();
  // Sonnet 5 runs adaptive thinking by default, so content[0] is often a
  // `thinking` block (no .text field) with the real answer at content[1] —
  // content[0].text silently came back "" once we switched off Haiku
  // (which doesn't think by default). Find the actual text block instead
  // of assuming a position.
  const textBlock = (aiJson?.content ?? []).find((b: { type?: string }) => b?.type === 'text');
  const text: string = textBlock?.text ?? '';

  if (jsonResponse) {
    // Model was told "raw JSON only", but strip a stray ```json fence
    // defensively rather than fail the whole request over formatting.
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('ai json parse failed', e, text);
      return json({ error: 'invalid_ai_response' }, 502);
    }
    await supabase.from('ai_usage').insert({ user_id: userId, feature });
    return json(parsed);
  }

  // Log dopiero po sukcesie — nieudane wywołanie nie zjada limitu usera.
  await supabase.from('ai_usage').insert({ user_id: userId, feature });

  return json({ text });
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
