// Mekkio — dane do prywatnego dashboardu stats.html. Zwraca WYŁĄCZNIE
// zbiorcze liczby (żadnych e-maili, id ani treści konkretnych osób) i tylko
// kontom z sekretu STATS_ADMIN_EMAILS (lista po przecinku; bez niego
// funkcja nikogo nie wpuszcza). Ustawienie raz:
//   npx supabase secrets set STATS_ADMIN_EMAILS=twoj@mail
// Wymaga `grant select on public.workouts to service_role` (patrz
// supabase-schema.sql) — ten projekt nie nadaje go automatycznie.
// Widać tylko konta w chmurze: goście trzymają dane na telefonie.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_EMAILS = (Deno.env.get('STATS_ADMIN_EMAILS') || '')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

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
    const from = shiftDate(today, -(WEEKS * 7 - 1));

    // ---- konta (auth.users przez admin API, stronicowane) ----
    const users: { created_at: string; last_sign_in_at?: string | null; provider: string }[] = [];
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      data.users.forEach((u) => users.push({
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        provider: String(u.app_metadata?.provider || 'email'),
      }));
      if (data.users.length < 1000) break;
    }

    // ---- treningi z ostatnich 12 tygodni + łączna liczba ----
    const rows: { user_id: string; date: string; duration_min: number | null; exercises: unknown }[] = [];
    for (let off = 0; ; off += 1000) {
      const { data, error } = await supabase
        .from('workouts')
        .select('user_id, date, duration_min, exercises')
        .gte('date', from)
        .order('date', { ascending: true })
        .range(off, off + 999);
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    const { count: workoutsTotal, error: cntErr } = await supabase
      .from('workouts').select('id', { count: 'exact', head: true });
    if (cntErr) throw cntErr;

    // ---- Trener AI, ostatnie 30 dni ----
    const aiFrom = new Date(Date.now() - 30 * DAY_MS).toISOString();
    const { data: aiRows, error: aiErr } = await supabase
      .from('ai_usage').select('user_id, created_at').gte('created_at', aiFrom).limit(20000);
    if (aiErr) throw aiErr;

    // ---- liczenie ----
    const d7 = shiftDate(today, -6), d30 = shiftDate(today, -29);
    const activeIn = (since: string) => new Set(rows.filter((r) => r.date >= since).map((r) => r.user_id)).size;

    const weekStart = mondayOf(today);
    const weeks = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const ws = shiftDate(weekStart, -7 * i), we = shiftDate(ws, 6);
      const inWeek = rows.filter((r) => r.date >= ws && r.date <= we);
      const signups = users.filter((u) => { const d = warsawDate(Date.parse(u.created_at)); return d >= ws && d <= we; }).length;
      weeks.push({ start: ws, workouts: inWeek.length, activeUsers: new Set(inWeek.map((r) => r.user_id)).size, signups });
    }

    // wracający: trenowali w poprzednim tygodniu i też w bieżącym
    const lastWeekStart = shiftDate(weekStart, -7), lastWeekEnd = shiftDate(weekStart, -1);
    const prevUsers = new Set(rows.filter((r) => r.date >= lastWeekStart && r.date <= lastWeekEnd).map((r) => r.user_id));
    const thisUsers = new Set(rows.filter((r) => r.date >= weekStart).map((r) => r.user_id));
    const returning = [...prevUsers].filter((u) => thisUsers.has(u)).length;

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = shiftDate(today, -i);
      days.push({ date: d, workouts: rows.filter((r) => r.date === d).length });
    }

    const exCount = new Map<string, number>();
    rows.filter((r) => r.date >= d30).forEach((r) => {
      (Array.isArray(r.exercises) ? r.exercises : []).forEach((e: { name?: unknown }) => {
        if (e && typeof e.name === 'string' && e.name) exCount.set(e.name, (exCount.get(e.name) || 0) + 1);
      });
    });
    const topExercises = [...exCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const durs = rows.filter((r) => r.date >= d30 && r.duration_min && r.duration_min > 0).map((r) => r.duration_min as number);
    const avgDurationMin = durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length) : null;

    const providers: Record<string, number> = {};
    users.forEach((u) => { providers[u.provider] = (providers[u.provider] || 0) + 1; });

    const createdSince = (n: number) => users.filter((u) => Date.parse(u.created_at) >= Date.now() - n * DAY_MS).length;
    const ai = aiRows || [];
    const aiToday = ai.filter((r) => warsawDate(Date.parse(r.created_at)) === today).length;

    return json({
      generatedAt: new Date().toISOString(),
      today,
      users: { total: users.length, new7: createdSince(7), new30: createdSince(30), providers },
      active: { today: activeIn(today), d7: activeIn(d7), d30: activeIn(d30) },
      workouts: { total: workoutsTotal ?? 0, today: rows.filter((r) => r.date === today).length, d7: rows.filter((r) => r.date >= d7).length, d30: rows.filter((r) => r.date >= d30).length, avgDurationMin },
      returning: { lastWeek: prevUsers.size, alsoThisWeek: returning },
      ai: { today: aiToday, d30: ai.length, users30: new Set(ai.map((r) => r.user_id)).size },
      weeks,
      days,
      topExercises,
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
