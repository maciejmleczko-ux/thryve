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
// systemowej instrukcji.
const FEATURES: Record<string, (payload: unknown) => { system: string; user: string; maxTokens: number }> = {
  // Krok 1, "szerzej i porządnie" (Maciej, 2026-09-16): analiza POJEDYNCZEGO,
  // najnowszego treningu, ale z "pro tip"-owym kontekstem POLICZONYM W KODZIE
  // (renderDashboard() w index.html) — model dostaje gotowe sygnały zamiast
  // zgadywać z surowych liczb. payload kształt:
  //   exercises[]: {name, group, sets:[{weightKg,reps}], rpe, isNewRecord, repFadePercent}
  //   muscleGroupsThisWorkout[]: {group, sets, highVolume}  — >10 serii/partię w TYM treningu
  //   neglectedGroups[]: {group, daysSinceLastTrained}      — partie pominięte >7 dni (może być [])
  //   pushPullBalance: {pushSets, pullSets, skewed} | null  — z ostatnich 7 dni, null gdy za mało danych
  last_workout_summary: (payload) => ({
    system:
      'Jesteś asystentem fitness w aplikacji Mekkio, analizujesz pojedynczy trening jak ' +
      'doświadczony trener personalny. Dane wejściowe (JSON) to jeden, najnowszy trening: ' +
      'data, czas trwania, ćwiczenia z realnymi seriami (waga w kg, powtórzenia), ' +
      'opcjonalnym RPE (1-10, ile wysiłku kosztowała seria — 9-10 to blisko upadku, ' +
      'poniżej 6 to duży zapas sił), repFadePercent (spadek powtórzeń między pierwszą a ' +
      'ostatnią serią — wysoki spadek też sugeruje pracę blisko upadku) i flagą ' +
      'isNewRecord. Plus krótki kontekst z ostatnich 7 dni: muscleGroupsThisWorkout ' +
      '(liczba serii per partia mięśniowa w TYM treningu, highVolume=true przy >10 serii ' +
      'na partię — to dużo jak na jedną sesję), neglectedGroups (partie nietrenowane ' +
      'bezpośrednio dłużej niż tydzień — może być pusta lista, to normalne), ' +
      'pushPullBalance (bilans serii pchających vs ciągnących z ostatnich 7 dni, ' +
      'skewed=true przy wyraźnym przekrzywieniu — może być null, gdy za mało danych). ' +
      'Napisz krótkie, 4-5 zdaniowe podsumowanie po polsku, w drugiej osobie, w dwóch ' +
      'akapitach rozdzielonych jedną pustą linią (dwa znaki nowej linii, "\\n\\n") — bez ' +
      'nagłówków, bez wypunktowań, tylko zwykły tekst. Pierwszy akapit (1-2 zdania) — ' +
      'bardzo krótkie podsumowanie TEGO treningu (liczba ćwiczeń, objętość, ewentualnie ' +
      'jedno słowo o rekordzie jeśli isNewRecord — NIE wyliczaj każdego ćwiczenia z ' +
      'osobna, to nie ma być lista). Drugi akapit (2-3 zdania) — konkretna sugestia na ' +
      'NASTĘPNY trening, oparta na realnych seriach i RPE/fade jeśli są dostępne. Jeśli w ' +
      'danych jest istotny sygnał (highVolume=true, niepusta neglectedGroups, albo ' +
      'skewed=true) — wspomnij o NAJWAŻNIEJSZYM jednym z nich jednym zdaniem, jak trener ' +
      'zwracający uwagę na coś realnie ważnego. Jeśli żaden sygnał nie jest istotny — ' +
      'pomiń ten wątek całkowicie, nie zmyślaj problemu, którego nie ma. Wszystko musi ' +
      'wynikać wyłącznie z podanych danych — nie zgaduj i nie wymyślaj wartości, których ' +
      'nie dostałeś. WAŻNE — piszesz dla przeciętnego użytkownika siłowni, nie dla ' +
      'trenera ani studenta AWF: nazwy pól z JSON-a (RPE, push/pull, fade, isNewRecord, ' +
      'highVolume) to etykiety danych dla Ciebie, nie słowa do użycia w odpowiedzi. Zamiast ' +
      'żargonu opisz to zwykłymi słowami — np. zamiast "balans push/pull jest skewed" ' +
      'napisz "częściej trenujesz mięśnie, które pchają (klatka, barki, triceps), niż te, ' +
      'które ciągną (plecy, biceps)"; zamiast "wysokie RPE" napisz "seria była bliska ' +
      'granicy wysiłku"; zamiast "duży fade" napisz coś jak "pod koniec zabrakło Ci sił na ' +
      'te same powtórzenia". Krótkie, konkretne zdania, zero specjalistycznych skrótów. ' +
      'Ton: rzeczowy, konkretny, jak trener, bez sztucznego entuzjazmu i wykrzykników. ' +
      PL_LANGUAGE_RULES,
    user: JSON.stringify(payload),
    maxTokens: 350,
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

  const { system, user, maxTokens } = buildPrompt(body.payload);

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
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!aiRes.ok) {
    console.error('anthropic error', aiRes.status, await aiRes.text());
    return json({ error: 'ai_call_failed' }, 502);
  }

  const aiJson = await aiRes.json();
  const text: string = aiJson?.content?.[0]?.text ?? '';

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
