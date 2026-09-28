// Mekkio — called once, right after a successful native Sign in with Apple,
// with the one-time authorizationCode from ASAuthorizationAppleIDCredential.
// Exchanges it with Apple for a durable refresh_token and stores it in
// apple_tokens (service-role only, never client-readable — see
// supabase-schema.sql). delete-account uses that token later to revoke the
// Sign in with Apple authorization when the user deletes their account
// (guideline 5.1.1(v)). Never blocks sign-in: any failure here is logged and
// swallowed — the user is already signed in via Supabase by this point.
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

  let body: { authorizationCode?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  if (!body.authorizationCode) {
    return json({ error: 'missing_code' }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const jwt = authHeader.replace('Bearer ', '');
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return json({ error: 'invalid_auth' }, 401);
  }

  try {
    const clientSecret = await appleClientSecret(APPLE_NATIVE_CLIENT_ID);
    const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: APPLE_NATIVE_CLIENT_ID,
        client_secret: clientSecret,
        code: body.authorizationCode,
        grant_type: 'authorization_code',
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.refresh_token) {
      console.error('apple-store-token: token exchange failed', tokenRes.status, tokenJson);
      return json({ ok: false, reason: 'apple_token_exchange_failed' }, 200);
    }

    const { error: upsertErr } = await supabase
      .from('apple_tokens')
      .upsert({ user_id: userData.user.id, refresh_token: tokenJson.refresh_token, updated_at: new Date().toISOString() });
    if (upsertErr) {
      console.error('apple-store-token: db upsert failed', upsertErr);
      return json({ ok: false, reason: 'db_upsert_failed' }, 200);
    }

    return json({ ok: true });
  } catch (e) {
    console.error('apple-store-token: unexpected error', e);
    return json({ ok: false, reason: 'unexpected_error' }, 200);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
