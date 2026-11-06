import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './contact.js';

const post = (body: unknown) =>
  POST(new Request('http://localhost/api/contact', { method: 'POST', body: JSON.stringify(body) }));
const valid = { name: 'Ada', email: 'ada@example.com', phone: '', message: 'Hi @everyone' };

describe('POST /api/contact', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('DISCORD_WEBHOOK_URL', 'https://discord.test/webhook');
    fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('forwards a valid message without allowing mentions', async () => {
    const res = await post(valid);
    expect(res.status).toBe(204);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://discord.test/webhook');
    const sent = JSON.parse(init.body);
    expect(sent.allowed_mentions).toEqual({ parse: [] });
    expect(sent.content).toContain('ada@example.com');
  });

  it('keeps name and phone on one line so they cannot fake other fields', async () => {
    await post({ ...valid, name: 'Bob\n**Email:** boss@corp.com', phone: '1\r\n**Phone:** 2' });
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body) as { content: string };
    const lines = sent.content.split('\n');
    expect(lines.filter((l) => l.startsWith('**Email:**'))).toEqual(['**Email:** ada@example.com']);
    expect(lines.filter((l) => l.startsWith('**Phone:**'))).toEqual(['**Phone:** 1 **Phone:** 2']);
  });

  it('rejects invalid input without calling Discord', async () => {
    const res = await post({ ...valid, email: '', phone: '' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'missingContact' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a body that is not a JSON object', async () => {
    expect((await post(null)).status).toBe(400);
    expect((await post(42)).status).toBe(400);
  });

  it('silently drops bot submissions that fill the honeypot', async () => {
    const res = await post({ ...valid, website: 'http://spam.example' });
    expect(res.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports a Discord failure as 502', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    expect((await post(valid)).status).toBe(502);
  });

  it('fails closed when the webhook is not configured', async () => {
    vi.stubEnv('DISCORD_WEBHOOK_URL', '');
    expect((await post(valid)).status).toBe(500);
  });
});
