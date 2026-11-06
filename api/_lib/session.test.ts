import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requireAdmin, SESSION_COOKIE, signSession, verifySession } from './session.js';

const SECRET = 'test-secret-with-enough-entropy';
const ADMIN = '194543374533918720';
const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

const withCookie = (value: string) =>
  new Request('https://eadroma.dev/api/admin/profile', {
    headers: { cookie: `other=1; ${SESSION_COOKIE}=${value}` },
  });

describe('session cookie', () => {
  beforeEach(() => {
    vi.stubEnv('SESSION_SECRET', SECRET);
    vi.stubEnv('VITE_ADMIN_DISCORD_ID', ADMIN);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('round-trips a signed session', async () => {
    const token = await signSession({ sub: ADMIN, exp: inOneHour() }, SECRET);
    expect(await verifySession(token, SECRET)).toMatchObject({ sub: ADMIN });
    expect(await requireAdmin(withCookie(token))).toBe(ADMIN);
  });

  it('rejects a payload edited after signing', async () => {
    const token = await signSession({ sub: '1', exp: inOneHour() }, SECRET);
    const forgedPayload = btoa(JSON.stringify({ sub: ADMIN, exp: inOneHour() })).replace(/=+$/, '');
    const forged = `${forgedPayload}.${token.split('.')[1]}`;
    expect(await verifySession(forged, SECRET)).toBeNull();
  });

  it('rejects a session signed with another secret, expired, or malformed', async () => {
    const other = await signSession({ sub: ADMIN, exp: inOneHour() }, 'another-secret');
    const expired = await signSession({ sub: ADMIN, exp: 1 }, SECRET);
    for (const token of [other, expired, 'garbage', 'a.b.c', '']) {
      expect(await verifySession(token, SECRET)).toBeNull();
    }
  });

  it('answers 401 without a valid cookie and 403 for another user', async () => {
    const stranger = await signSession({ sub: '42', exp: inOneHour() }, SECRET);
    expect(((await requireAdmin(withCookie('nope'))) as Response).status).toBe(401);
    expect(((await requireAdmin(withCookie(stranger))) as Response).status).toBe(403);
  });

  it('fails closed when the admin id or the secret is missing', async () => {
    const token = await signSession({ sub: ADMIN, exp: inOneHour() }, SECRET);
    vi.stubEnv('VITE_ADMIN_DISCORD_ID', '');
    expect(((await requireAdmin(withCookie(token))) as Response).status).toBe(500);
  });
});
