// Mekkio — Faza "AI asystent", Krok 0: bezpieczny proxy do Anthropic API.
// Klient nigdy nie zna klucza API — woła tę funkcję z tokenem sesji Supabase,
// funkcja sprawdza limit dzienny i sama dokleja klucz z sekretu.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Ile wywołań danej funkcji AI może zrobić jeden user w ciągu doby.
// Startowo nisko — łatwiej podnieść limit niż odzyskać przepalone kredyty.
const DAILY_LIMIT = 25;
// Payload is our own compact workout summary (a few KB). Anything much
// bigger is abuse: input tokens are billed too, and max_tokens only caps
// the output.
const MAX_BODY_BYTES = 32 * 1024;

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
  // Podsumowanie JEDNEGO treningu (v11, 2026-10-25): wszystko liczbowe (e1RM, statusy,
  // porównanie z poprzednią sesją, następny cel, highlights) liczy KOD w kliencie
  // (renderDashboard). Model wybiera jedną historię i ją opowiada, niczego nie liczy.
  // payload:
  //   date, durationMin, totalVolumeKg, sessionsThisWeek
  //   vsLast: {samePlan, volumeDeltaPct, setsDelta, durationDeltaMin} | null
  //   highlights[]: max 3, posortowane od najważniejszego; [] = nic się nie wyróżnia
  //     {type: record|progress|stall|drop|volume|heavy_group, exercise?, e1rmDeltaPct?, ...}
  //   exercises[]: {name, group, sets:[{weightKg,reps}], rpe, repFadePercent,
  //     status: new|record|progress|steady|stall|drop, e1rmDeltaPct, lastTime, repRange, nextTarget}
  //     nextTarget: {kind: add_weight|add_reps|lighten|harder_variant, weightKg?, repsPerSet?} | null
  //   userPreferences: {goal, avoid} | null
  last_workout_summary: (payload) => ({
    system:
      'Piszesz po polsku krótki komentarz po treningu w aplikacji Mekkio, jak trener, który ' +
      'pamięta poprzednie treningi tej osoby i zauważa jedną rzecz. Czytelnik widzi już w ' +
      'Historii liczbę ćwiczeń, serii i objętość, więc NIE powtarzaj tych danych.\n\n' +
      'DANE: aplikacja policzyła wszystko za Ciebie. highlights to lista rzeczy wartych ' +
      'wzmianki, od najważniejszej. Typy: record (nowy rekord w ćwiczeniu), progress ' +
      '(siła rośnie od kilku sesji), stall (trzecia sesja bez zmiany), drop (wyraźnie słabiej ' +
      'niż ostatnio), volume (objętość wyraźnie inna niż na poprzednim takim treningu), ' +
      'heavy_group (jedna partia dostała bardzo dużo serii). e1rmDeltaPct to zmiana szacowanej ' +
      'siły maksymalnej w % względem ostatniego razu. nextTarget to gotowy cel na następny ' +
      'raz: add_weight (dołóż ciężar, wróć do dolnej granicy zakresu), add_reps (ten sam ' +
      'ciężar, więcej powtórzeń w serii), lighten (zmniejsz ciężar), harder_variant (trudniejszy ' +
      'wariant). Nie przeliczaj niczego i nie wymyślaj liczb spoza danych.\n\n' +
      'ZADANIE: wybierz JEDNĄ historię, zwykle pierwszy element highlights, i opowiedz ją z ' +
      'liczbami. Zwróć WYŁĄCZNIE JSON, bez markdownu i bez ```: ' +
      '{"headline": "...", "insight": "...", "next": [{"exercise": "...", "target": "..."}]}\n' +
      '- headline: do 8 słów, konkret, najlepiej z liczbą lub nazwą ćwiczenia. Bez wykrzyknika.\n' +
      '- insight: maksymalnie 2 zdania. Co się stało, w porównaniu do czego (ostatnio, ' +
      'poprzednie sesje), co z tego wynika. Użyj lastTime i sets, żeby podać konkret ' +
      '("było 80 kg x 8, jest 80 kg x 10").\n' +
      '- next: 0-2 pozycje. exercise skopiuj dokładnie z danych. target to jedno krótkie ' +
      'zdanie oparte na nextTarget tego ćwiczenia, np. "75 kg x 8 w każdej serii" albo "ten ' +
      'sam ciężar, 9 powtórzeń w każdej serii". Wybieraj ćwiczenia z highlights; jeśli ' +
      'highlights jest puste, next to [].\n\n' +
      'Gdy highlights jest puste: headline krótko o regularności (użyj sessionsThisWeek), ' +
      'insight jedno rzeczowe zdanie, next []. Nie udawaj sukcesu ani problemu.\n' +
      'Gdy status to drop albo wysoki repFadePercent/rpe: napisz spokojnie, bez straszenia, ' +
      'z jedną prawdopodobną przyczyną do sprawdzenia (sen, przerwa, zbyt duży ciężar). ' +
      'Jeśli userPreferences.avoid jest ustawione, nie sugeruj dokładania ciężaru w ćwiczeniach, ' +
      'które mogą dotyczyć tego obszaru. Cel (userPreferences.goal) tylko lekko dopasuj ton: ' +
      'przy "sila" liczy się ciężar, przy "masa" objętość i powtórzenia.\n\n' +
      'JĘZYK: zwykłe słowa dla osoby z siłowni. Nie używaj nazw pól ani żargonu (RPE, e1RM, ' +
      'push/pull, status, highlights). Zamiast "e1RM +6%" napisz "Twoja siła w tym ćwiczeniu ' +
      'poszła w górę o ok. 6%". Ton rzeczowy, bez entuzjazmu i bez ocen typu "świetnie".\n\n' +
      'PRZYKŁAD DOBRY: {"headline": "Wyciskanie ruszyło po trzech tygodniach", "insight": ' +
      '"Dziś 80 kg x 10, a ostatnio było 80 kg x 8. To pierwszy wzrost od trzech sesji ' +
      'na tym samym ciężarze.", "next": [{"exercise": "Bench Press", "target": "82,5 kg x ' +
      '8 w każdej serii"}]}\n' +
      'PRZYKŁAD ZŁY: {"headline": "Świetny trening!", "insight": "Wykonałeś 5 ćwiczeń i ' +
      'podniosłeś łącznie 12 400 kg. Tak trzymaj!", "next": []}\n\n' +
      PL_LANGUAGE_RULES,
    user: JSON.stringify(payload),
    maxTokens: 500,
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
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
      return json({ error: 'payload_too_large' }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const feature = body.feature ?? '';
  const buildPrompt = FEATURES[feature];
  if (!buildPrompt) {
    return json({ error: 'unknown_feature' }, 400);
  }

  // Reserve first, count second: with "count, then insert after the AI
  // call", N parallel requests all saw the same count and all got through.
  // Inserting before counting means every request's count includes every
  // concurrent one, so at most DAILY_LIMIT can ever pass.
  const { data: reservation, error: reserveErr } = await supabase
    .from('ai_usage')
    .insert({ user_id: userId, feature })
    .select('id')
    .single();
  if (reserveErr || !reservation) {
    console.error('rate reserve failed', reserveErr);
    return json({ error: 'rate_check_failed' }, 500);
  }
  // Failed calls give their slot back (needs the delete grant from
  // supabase-schema.sql; without it the slot is just kept).
  const release = async () => {
    const { error } = await supabase.from('ai_usage').delete().eq('id', reservation.id);
    if (error) console.error('rate release failed', error);
  };

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
    await release();
    return json({ error: 'rate_check_failed' }, 500);
  }
  if ((count ?? 0) > DAILY_LIMIT) {
    await release();
    return json({ error: 'rate_limited' }, 429);
  }

  const { system, user, maxTokens, jsonResponse } = buildPrompt(body.payload);

  let aiRes: Response;
  try {
    aiRes = await fetch('https://api.anthropic.com/v1/messages', {
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
  } catch (e) {
    console.error('anthropic fetch failed', e);
    await release();
    return json({ error: 'ai_call_failed' }, 502);
  }

  if (!aiRes.ok) {
    console.error('anthropic error', aiRes.status, await aiRes.text());
    await release();
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
      await release();
      return json({ error: 'invalid_ai_response' }, 502);
    }
    return json(parsed);
  }

  return json({ text });
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
