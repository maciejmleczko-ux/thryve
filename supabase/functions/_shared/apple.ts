// Sign a fresh ES256 "client_secret" JWT for Apple's token/revoke endpoints,
// on every call — no 6-month rotation needed (unlike Supabase's own Apple
// provider config, which uses a long-lived one; see docs/CHANGELOG.md).
// Needs three Edge Function secrets (set once via `supabase secrets set` or
// the Dashboard, never committed): APPLE_TEAM_ID, APPLE_KEY_ID and
// APPLE_PRIVATE_KEY (the full .p8 file contents, PEM format, same key already
// used for Supabase's Apple provider — key ID CYPKZ2CHPZ, team RRFD32759F).
export async function appleClientSecret(sub: string): Promise<string> {
  const teamId = Deno.env.get('APPLE_TEAM_ID');
  const keyId = Deno.env.get('APPLE_KEY_ID');
  const pem = Deno.env.get('APPLE_PRIVATE_KEY');
  if (!teamId || !keyId || !pem) {
    throw new Error('apple_secrets_missing: set APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY');
  }

  const pkcs8Base64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pkcs8Base64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const now = Math.floor(Date.now() / 1000);
  const b64url = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const header = { alg: 'ES256', kid: keyId };
  const payload = { iss: teamId, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub };
  const signingInput = `${b64url(header)}.${b64url(payload)}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput),
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${signingInput}.${sigB64}`;
}

// The native app's Apple App ID (client_id used by nativeSignInWithApple()
// in index.html) — distinct from the Services ID (app.mekkio.web) Supabase's
// own Apple provider uses for the web OAuth flow.
export const APPLE_NATIVE_CLIENT_ID = 'app.mekkio';
