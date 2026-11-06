import { validateContact, type ContactInput } from '../src/lib/contact.js';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
// A newline in a one-line field would let a visitor fake an extra "**Email:**" line in the message.
const oneLine = (s: string) => s.replace(/\s+/g, ' ');

// shortcut: no rate limit (needs a shared store); add Vercel KV or a firewall rule if spam shows up.
export async function POST(request: Request): Promise<Response> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return Response.json({ error: 'notConfigured' }, { status: 500 });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null) throw new Error('not an object');
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'invalidJson' }, { status: 400 });
  }

  // Honeypot: the "website" field is hidden from people, bots fill it in.
  if (str(body.website)) return new Response(null, { status: 204 });

  const input: ContactInput = {
    name: str(body.name),
    email: str(body.email),
    phone: str(body.phone),
    message: str(body.message),
  };
  const error = validateContact(input);
  if (error) return Response.json({ error }, { status: 400 });

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `**Name:** ${oneLine(input.name)}\n**Email:** ${input.email || '-'}\n**Phone:** ${oneLine(input.phone) || '-'}\n\n${input.message}`,
      username: 'Portfolio contact',
      // Visitor text must never ping @everyone, roles or users.
      allowed_mentions: { parse: [] },
    }),
  });

  if (!response.ok) return Response.json({ error: 'upstream' }, { status: 502 });
  return new Response(null, { status: 204 });
}
