// Mekkio — dane do prywatnego dashboardu stats.html: KTO korzysta z apki
// (aktualni, nowi, regularnie wracający), nie ile trenują. Zwraca WYŁĄCZNIE
// zbiorcze liczby (żadnych e-maili, id ani treści konkretnych osób) i tylko
// kontom z sekretu STATS_ADMIN_EMAILS (lista po przecinku; bez niego
// funkcja nikogo nie wpuszcza). Ustawienie raz:
//   npx supabase secrets set STATS_ADMIN_EMAILS=twoj@mail
// Wymaga `grant select on public.workouts to service_role` (patrz
// supabase-schema.sql) — ten projekt nie nadaje go automatycznie.
// Widać tylko konta w chmurze: goście trzymają dane na telefonie.
//
// „Aktywny dnia X” = tego dnia zapisał trening, użył Trenera AI albo się
// zalogował. Okna 7/14/28 dni są kroczące (do dziś włącznie), więc liczby
// nie spadają sztucznie w poniedziałek.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_EMAILS = (Deno.env.get('STATS_ADMIN_EMAILS') || '')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
// Konto demo dla recenzenta App Store — nie jest prawdziwym użytkownikiem.
const EXCLUDED_EMAILS = new Set(['review@mekkio.app']);

const TZ = 'Europe/Warsaw';
const WEEKS = 12;
const DAY_MS = 86400000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'missing_auth' }, 401);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const jwt = authHeader.replace('Bearer ', '');
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user) return json({ error: 'invalid_auth' }, 401);
  const email = (userData.user.email || '').toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) return json({ error: 'forbidden' }, 403);

  try {
    const today = warsawDate(Date.now());
    const from = shiftDate(mondayOf(today), -7 * (WEEKS - 1));

    // ---- konta (auth.users przez admin API, stronicowane) ----
    type U = { id: string; created: string; provider: string };
    const users: U[] = [];
    const activity = new Map<string, Set<string>>(); // user_id -> daty aktywności
    const touch = (id: string, d: string) => {
      const s = activity.get(id);
      if (s) s.add(d);
    };
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      data.users.forEach((u) => {
        if (EXCLUDED_EMAILS.has((u.email || '').toLowerCase())) return;
        users.push({ id: u.id, created: warsawDate(Date.parse(u.created_at)), provider: String(u.app_metadata?.provider || 'email') });
        activity.set(u.id, new Set());
        if (u.last_sign_in_at) touch(u.id, warsawDate(Date.parse(u.last_sign_in_at)));
      });
      if (data.users.length < 1000) break;
    }

    // ---- aktywność: treningi + Trener AI z ostatnich 12 tygodni ----
    for (let off = 0; ; off += 1000) {
      const { data, error } = await supabase
        .from('workouts').select('user_id, date').gte('date', from)
        .order('date', { ascending: true }).range(off, off + 999);
      if (error) throw error;
      (data || []).forEach((r) => touch(r.user_id, r.date));
      if (!data || data.length < 1000) break;
    }
    const { data: aiRows, error: aiErr } = await supabase
      .from('ai_usage').select('user_id, created_at')
      .gte('created_at', new Date(Date.parse(from + 'T00:00:00Z') - DAY_MS).toISOString()).limit(50000);
    if (aiErr) throw aiErr;
    (aiRows || []).forEach((r) => touch(r.user_id, warsawDate(Date.parse(r.created_at))));

    // ---- liczenie ----
    const activeBetween = (id: string, a: string, b: string) => {
      for (const d of activity.get(id) || []) if (d >= a && d <= b) return true;
      return false;
    };
    const countActive = (a: string, b: string) => users.filter((u) => activeBetween(u.id, a, b)).length;

    const d7 = shiftDate(today, -6), d30 = shiftDate(today, -29);

    // regularność: w ilu z 4 ostatnich kroczących tygodni ktoś był aktywny
    const segments = { regular: 0, occasional: 0, dormant: 0, fresh: 0 };
    users.forEach((u) => {
      let weeksActive = 0;
      for (let w = 0; w < 4; w++) {
        const b = shiftDate(today, -7 * w), a = shiftDate(b, -6);
        if (activeBetween(u.id, a, b)) weeksActive++;
      }
      if (u.created > shiftDate(today, -14)) segments.fresh++;         // konto młodsze niż 2 tyg. — za wcześnie oceniać
      else if (weeksActive >= 3) segments.regular++;
      else if (weeksActive >= 1) segments.occasional++;
      else segments.dormant++;
    });

    // wracający: aktywni 8–14 dni temu i znowu w ostatnich 7 dniach
    const prevA = shiftDate(today, -13), prevB = shiftDate(today, -7);
    const prev = users.filter((u) => activeBetween(u.id, prevA, prevB));
    const returning = { prev: prev.length, back: prev.filter((u) => activeBetween(u.id, d7, today)).length };

    const weekStart = mondayOf(today);
    const weeks = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const ws = shiftDate(weekStart, -7 * i), we = shiftDate(ws, 6);
      weeks.push({
        start: ws,
        active: countActive(ws, we),
        newUsers: users.filter((u) => u.created >= ws && u.created <= we).length,
      });
    }

    const providers: Record<string, number> = {};
    users.forEach((u) => { providers[u.provider] = (providers[u.provider] || 0) + 1; });

    return json({
      generatedAt: new Date().toISOString(),
      today,
      total: users.length,
      active: { today: countActive(today, today), d7: countActive(d7, today), d30: countActive(d30, today) },
      newUsers: { d7: users.filter((u) => u.created >= d7).length, d30: users.filter((u) => u.created >= d30).length },
      segments,
      returning,
      weeks,
      providers,
    });
  } catch (e) {
    console.error('admin-stats failed', e);
    return json({ error: 'stats_failed' }, 500);
  }
});

function warsawDate(ms: number): string {
  // en-CA daje YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}
function shiftDate(ymd: string, days: number): string {
  const d = new Date(ymd + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function mondayOf(ymd: string): string {
  const dow = new Date(ymd + 'T12:00:00Z').getUTCDay(); // 0 = niedziela
  return shiftDate(ymd, -((dow + 6) % 7));
}
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
