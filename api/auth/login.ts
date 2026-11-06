import { adminId, callbackUrl, cookie, redirect, STATE_COOKIE } from '../_lib/session.js';

// Starts the admin login: Discord's code grant, so the access token only ever exists on the server.
export function GET(request: Request): Response {
  const clientId = process.env.VITE_DISCORD_CLIENT_ID;
  if (
    !clientId ||
    !process.env.DISCORD_CLIENT_SECRET ||
    !process.env.SESSION_SECRET ||
    !adminId()
  ) {
    return redirect('/admin?error=notConfigured');
  }

  // Checked by the callback, so a login started on another site can't land a session here.
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'identify',
    redirect_uri: callbackUrl(request),
    state,
    prompt: 'none',
  });
  // Lax, not Strict: the callback is a top-level navigation coming from discord.com.
  return redirect(`https://discord.com/oauth2/authorize?${params.toString()}`, [
    cookie(STATE_COOKIE, state, 600, 'Lax'),
  ]);
}
