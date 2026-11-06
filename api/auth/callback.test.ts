import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './callback.js';
import { SESSION_COOKIE, STATE_COOKIE } from '../_lib/session.js';

const ADMIN = '194543374533918720';

const callback = (query: string, state = 'expected-state') =>
  GET(
    new Request(`https://eadroma.dev/api/auth/callback?${query}`, {
      headers: { cookie: `${STATE_COOKIE}=${state}` },
    }),
  );

describe('GET /api/auth/callback', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('VITE_DISCORD_CLIENT_ID', 'client-id');
    vi.stubEnv('DISCORD_CLIENT_SECRET', 'client-secret');
    vi.stubEnv('SESSION_SECRET', 'session-secret');
    vi.stubEnv('VITE_ADMIN_DISCORD_ID', ADMIN);
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const discordReturns = (userId: string) =>
    fetchMock
      .mockResolvedValueOnce(Response.json({ access_token: 'token' }))
      .mockResolvedValueOnce(Response.json({ id: userId }));

  it('gives the admin a Strict, HttpOnly session cookie', async () => {
    discordReturns(ADMIN);
    const res = await callback('code=abc&state=expected-state');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/admin');
    const session = res.headers.getSetCookie().find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    expect(session).toMatch(/HttpOnly; Secure; SameSite=Strict/);
    // The code is exchanged with the redirect URI Discord saw.
    const tokenBody = (fetchMock.mock.calls[0] as [string, { body: URLSearchParams }])[1].body;
    expect(tokenBody.get('redirect_uri')).toBe('https://eadroma.dev/api/auth/callback');
  });

  it('sends anyone else away without a session', async () => {
    discordReturns('42');
    const res = await callback('code=abc&state=expected-state');
    expect(res.headers.get('location')).toBe('/admin?error=forbidden');
    expect(res.headers.getSetCookie().some((c) => c.startsWith(`${SESSION_COOKIE}=`))).toBe(false);
  });

  it('refuses a callback whose state does not match the cookie, before calling Discord', async () => {
    const res = await callback('code=abc&state=attacker-state');
    expect(res.headers.get('location')).toBe('/admin?error=login');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports a failed code exchange as a login error', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 400 }));
    const res = await callback('code=used&state=expected-state');
    expect(res.headers.get('location')).toBe('/admin?error=login');
  });
});
