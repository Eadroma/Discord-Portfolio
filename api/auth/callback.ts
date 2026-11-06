import {
  adminId,
  callbackUrl,
  cookie,
  readCookie,
  redirect,
  SESSION_COOKIE,
  SESSION_SECONDS,
  signSession,
  STATE_COOKIE,
} from '../_lib/session.js';

// Discord sends the admin back here with a one-time code. The code becomes a token on the server,
// the token tells us who logged in, and only the configured admin gets a session cookie.
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const clearState = cookie(STATE_COOKIE, '', 0, 'Lax');
  const fail = (reason: string) => redirect(`/admin?error=${reason}`, [clearState]);

  const state = readCookie(request, STATE_COOKIE);
  const code = url.searchParams.get('code');
  if (!code || !state || url.searchParams.get('state') !== state) return fail('login');

  const { VITE_DISCORD_CLIENT_ID: clientId, DISCORD_CLIENT_SECRET: clientSecret } = process.env;
  const secret = process.env.SESSION_SECRET;
  const admin = adminId();
  if (!clientId || !clientSecret || !secret || !admin) return fail('notConfigured');

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl(request),
      }),
    });
    if (!tokenResponse.ok) return fail('login');
    const { access_token: accessToken } = (await tokenResponse.json()) as { access_token: string };

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userResponse.ok) return fail('login');
    const user = (await userResponse.json()) as { id: string };
    if (user.id !== admin) return fail('forbidden');

    const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    const session = await signSession({ sub: user.id, exp }, secret);
    return redirect('/admin', [
      clearState,
      cookie(SESSION_COOKIE, session, SESSION_SECONDS, 'Strict'),
    ]);
  } catch {
    return fail('login');
  }
}
