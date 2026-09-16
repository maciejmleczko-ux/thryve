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

// Każda funkcja AI ma tu swój prompt — klient wysyła tylko dane, nigdy
// gotowy prompt, żeby nie dało się przez konsolę przeglądarki podmienić
// systemowej instrukcji.
const FEATURES: Record<string, (payload: unknown) => { system: string; user: string; maxTokens: number }> = {
  weekly_summary: (payload) => ({
    system:
      'Jesteś asystentem fitness w aplikacji Mekkio. Na podstawie danych treningowych ' +
      'użytkownika z ostatniego tygodnia (JSON) napisz krótkie, 3-4 zdaniowe podsumowanie ' +
      'po polsku, w drugiej osobie. Struktura: pierwsze 1 (max 2) zdanie — bardzo krótkie ' +
      'podsumowanie tygodnia (liczba treningów, ewentualnie jedno słowo o rekordzie jeśli ' +
      'był — NIE wyliczaj każdego rekordu z osobna, to nie ma być lista). Pozostałe 2-3 ' +
      'zdania — konkretna, praktyczna sugestia na NASTĘPNY trening: które ćwiczenie warto ' +
      'pociągnąć dalej (dodać ciężar/powtórzenie), na którym się skupić, czego spróbować. ' +
      'Sugestia musi wynikać wyłącznie z podanych danych (topExercises, prs) — nie zgaduj i ' +
      'nie wymyślaj wartości, których nie dostałeś. Ton: rzeczowy, konkretny, jak trener, ' +
      'bez sztucznego entuzjazmu i wykrzykników.',
    user: JSON.stringify(payload),
    maxTokens: 300,
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
      model: 'claude-haiku-4-5-20251001',
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
