import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import profile from '../../src/content/profile.json';
import { validateProfile } from '../../src/lib/profileSchema.js';
import { commitMessage, GET, PUT } from './profile.js';
import { SESSION_COOKIE, signSession } from '../_lib/session.js';

const ADMIN = '194543374533918720';
const ORIGIN = 'https://eadroma.dev';
let adminCookie = '';

const put = (body: unknown, headers: Record<string, string> = {}) =>
  PUT(
    new Request(`${ORIGIN}/api/admin/profile`, {
      method: 'PUT',
      headers: {
        cookie: adminCookie,
        origin: ORIGIN,
        'content-type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    }),
  );

describe('/api/admin/profile', () => {
  const fetchMock = vi.fn();

  beforeEach(async () => {
    vi.stubEnv('SESSION_SECRET', 'session-secret');
    vi.stubEnv('VITE_ADMIN_DISCORD_ID', ADMIN);
    vi.stubEnv('GITHUB_TOKEN', 'gh-token');
    vi.stubEnv('GITHUB_REPO', 'Eadroma/Discord-Portfolio');
    vi.stubEnv('GITHUB_BRANCH', 'v2');
    const exp = Math.floor(Date.now() / 1000) + 3600;
    adminCookie = `${SESSION_COOKIE}=${await signSession({ sub: ADMIN, exp }, 'session-secret')}`;
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reads the profile from the configured branch', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ content: btoa(JSON.stringify({ name: 'é' })), sha: 'abc' }),
    );
    const res = await GET(
      new Request(`${ORIGIN}/api/admin/profile`, { headers: { cookie: adminCookie } }),
    );
    expect(res.status).toBe(200);
    expect(String(fetchMock.mock.calls[0][0])).toContain('?ref=v2');
  });

  it('refuses visitors without a session, without calling GitHub', async () => {
    const res = await GET(new Request(`${ORIGIN}/api/admin/profile`));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('commits a valid profile on the branch with the sha it was based on', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ content: { sha: 'new' }, commit: { html_url: 'https://github.com/c/1' } }),
    );
    const res = await put({ profile, sha: 'old', message: 'bio FR' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sha: 'new', commitUrl: 'https://github.com/c/1' });
    const sent = JSON.parse((fetchMock.mock.calls[0] as [string, { body: string }])[1].body) as {
      sha: string;
      branch: string;
      message: string;
      content: string;
    };
    expect(sent).toMatchObject({ sha: 'old', branch: 'v2', message: 'content: bio FR' });
    // Same formatting as the file in the repo, so the diff only shows real changes.
    expect(Buffer.from(sent.content, 'base64').toString('utf8')).toBe(
      `${JSON.stringify(profile, null, 2)}\n`,
    );
  });

  it('rejects an invalid profile with the failing fields, without calling GitHub', async () => {
    const res = await put({ profile: { ...profile, email: 'nope' }, sha: 'old' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'invalid',
      issues: [{ path: 'email', code: 'invalidEmail' }],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports a stale sha as a conflict', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 409 }));
    expect((await put({ profile, sha: 'stale' })).status).toBe(409);
  });

  it('blocks writes from another origin and non-JSON bodies', async () => {
    expect((await put({ profile, sha: 'old' }, { origin: 'https://evil.example' })).status).toBe(
      403,
    );
    expect((await put({ profile, sha: 'old' }, { 'content-type': 'text/plain' })).status).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('writes profile.json byte for byte as it is in the repo', () => {
    // If this fails after a hand edit, run the file through validateProfile's order and
    // JSON.stringify(…, null, 2): otherwise the first admin save rewrites the whole file.
    const onDisk = readFileSync(new URL('../../src/content/profile.json', import.meta.url), 'utf8');
    const result = validateProfile(JSON.parse(onDisk));
    expect(result.ok && `${JSON.stringify(result.profile, null, 2)}\n`).toBe(onDisk);
  });

  it('keeps commit messages to one prefixed line', () => {
    expect(commitMessage('bio\nsecond line')).toBe('content: bio');
    expect(commitMessage('content: accent')).toBe('content: accent');
    expect(commitMessage(undefined)).toBe('content: update profile');
  });
});
