#!/usr/bin/env node
/**
 * One-time helper to obtain the STRAVA_REFRESH_TOKEN used by api/strava.js.
 *
 * Prerequisite: create an API application at https://www.strava.com/settings/api
 * (any name; set Authorization Callback Domain to "localhost"). That gives you
 * a Client ID and Client Secret.
 *
 * Step 1 — print the authorization URL, open it in a browser, click Authorize:
 *   node scripts/strava-auth.mjs <client_id> <client_secret>
 *
 * Step 2 — the browser lands on http://localhost/?code=XXXX (the page won't
 * load; that's fine — copy the `code` value from the address bar):
 *   node scripts/strava-auth.mjs <client_id> <client_secret> <code>
 *
 * This prints the refresh token. Put all three values in Vercel env vars
 * (and .env.local for `vercel dev`); never commit them.
 */

const [clientId, clientSecret, code] = process.argv.slice(2);

if (!clientId || !clientSecret) {
  console.error('Usage: node scripts/strava-auth.mjs <client_id> <client_secret> [code]');
  process.exit(1);
}

if (!code) {
  const url =
    `https://www.strava.com/oauth/authorize?client_id=${clientId}` +
    `&redirect_uri=http://localhost&response_type=code&scope=activity:read_all`;
  console.log('Open this URL in your browser and click "Authorize":\n');
  console.log(`  ${url}\n`);
  console.log('Then re-run with the code from the redirect URL:');
  console.log(`  node scripts/strava-auth.mjs ${clientId} <client_secret> <code>`);
  process.exit(0);
}

const res = await fetch('https://www.strava.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
  }),
});

const body = await res.json();
if (!res.ok || !body.refresh_token) {
  console.error(`✗ Token exchange failed (${res.status}):`, body);
  process.exit(1);
}

console.log(`✓ Authorized as ${body.athlete?.firstname ?? 'athlete'} ${body.athlete?.lastname ?? ''}`.trim());
console.log('\nSet these environment variables (Vercel → Settings → Environment Variables):\n');
console.log(`  STRAVA_CLIENT_ID=${clientId}`);
console.log(`  STRAVA_CLIENT_SECRET=${clientSecret}`);
console.log(`  STRAVA_REFRESH_TOKEN=${body.refresh_token}`);
