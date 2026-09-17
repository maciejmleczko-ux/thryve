// Mekkio — RODO: "prawo do bycia zapomnianym". Kasuje konto usera i,
// dzięki `on delete cascade` w supabase-schema.sql (profiles → auth.users,
// plans/workouts/ai_usage → profiles), wszystkie jego dane w chmurze razem
// z nim. Wymaga service_role (auth.admin.deleteUser nie działa na anon key),
// więc — tak jak ai-proxy — żyje jako Edge Function, nigdy w kliencie.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  const { error: deleteErr } = await supabase.auth.admin.deleteUser(userData.user.id);
  if (deleteErr) {
    console.error('delete-account failed', deleteErr);
    return json({ error: 'delete_failed' }, 500);
  }

  return json({ ok: true });
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
