// Mekkio — RODO: "prawo do bycia zapomnianym". Kasuje konto usera i,
// dzięki `on delete cascade` w supabase-schema.sql (profiles → auth.users,
// plans/workouts/ai_usage → profiles), wszystkie jego dane w chmurze razem
// z nim. Wymaga service_role (auth.admin.deleteUser nie działa na anon key),
// więc — tak jak ai-proxy — żyje jako Edge Function, nigdy w kliencie.
//
// Guideline 5.1.1(v): jeśli konto było kiedyś połączone przez Sign in with
// Apple, usunięcie konta musi też unieważnić TĘ autoryzację po stronie
// Apple (inaczej Mekkio zostaje widoczne w „Apps Using Your Apple ID”, mimo
// że konto w Supabase już nie istnieje). Token do unieważnienia zapisuje
// apple-store-token przy logowaniu; jeśli go nie ma (konto nigdy nie użyło
// Apple, albo zapis się nie powiódł), ten krok jest po prostu pomijany.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { appleClientSecret, APPLE_NATIVE_CLIENT_ID } from '../_shared/apple.ts';

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

  // Revoke Sign in with Apple first (best-effort — RODO deletion must not
  // be blocked by Apple's own servers being unavailable). The row is read
  // before deleteUser() runs, since the cascade would otherwise remove it
  // first.
  const { data: appleRow } = await supabase
    .from('apple_tokens')
    .select('refresh_token')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (appleRow?.refresh_token) {
    try {
      const clientSecret = await appleClientSecret(APPLE_NATIVE_CLIENT_ID);
      const revokeRes = await fetch('https://appleid.apple.com/auth/revoke', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: APPLE_NATIVE_CLIENT_ID,
          client_secret: clientSecret,
          token: appleRow.refresh_token,
          token_type_hint: 'refresh_token',
        }),
      });
      if (!revokeRes.ok) {
        console.error('delete-account: apple revoke failed', revokeRes.status, await revokeRes.text());
      }
    } catch (e) {
      console.error('delete-account: apple revoke threw', e);
    }
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
