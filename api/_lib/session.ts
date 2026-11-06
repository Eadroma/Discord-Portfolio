// Admin session: a signed cookie, no store. Files under api/_lib are helpers, not routes (Vercel skips "_").
//
// `__Host-` makes the browser refuse the cookie unless it is Secure, has Path=/ and no Domain,
// so a site on a subdomain (project.eadroma.dev) can neither read nor overwrite it.

export const SESSION_COOKIE = '__Host-admin_session';
export const STATE_COOKIE = '__Host-admin_oauth_state';
export const SESSION_SECONDS = 8 * 60 * 60;

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromBase64Url = (text: string) =>
  Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

const hmacKey = (secret: string) =>
  crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);

export interface Session {
  /** Discord user id */
  sub: string;
  /** expiry, seconds since epoch */
  exp: number;
}

export async function signSession(session: Session, secret: string): Promise<string> {
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

/** The session if the signature holds and it has not expired; null for anything else. */
export async function verifySession(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<Session | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts as [string, string];
  if (!payload || !signature) return null;
  try {
    // crypto.subtle.verify compares in constant time.
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      fromBase64Url(signature),
      encoder.encode(payload),
    );
    if (!valid) return null;
    const session = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as Partial<Session>;
    if (typeof session.sub !== 'string' || typeof session.exp !== 'number') return null;
    return session.exp * 1000 > now ? { sub: session.sub, exp: session.exp } : null;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return null;
}

export function cookie(name: string, value: string, maxAge: number, sameSite: 'Strict' | 'Lax') {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=${sameSite}`;
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });

export function redirect(location: string, cookies: string[] = []) {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
}

/** Must be listed exactly in the Discord app's OAuth2 redirects, for each origin the site runs on. */
export const callbackUrl = (request: Request) => new URL('/api/auth/callback', request.url).href;

/** The configured admin id, or null when the admin area is disabled. */
export const adminId = () => process.env.VITE_ADMIN_DISCORD_ID?.trim() || null;

/**
 * Lets the request through only with a valid session cookie for the configured admin.
 * Returns the Discord id, or the Response to send back.
 */
export async function requireAdmin(request: Request): Promise<string | Response> {
  const secret = process.env.SESSION_SECRET;
  const admin = adminId();
  if (!secret || !admin) return json({ error: 'notConfigured' }, 500);

  const token = readCookie(request, SESSION_COOKIE);
  const session = token ? await verifySession(token, secret) : null;
  if (!session) return json({ error: 'unauthenticated' }, 401);
  // A session signed for a previous admin id stops working when the env changes.
  if (session.sub !== admin) return json({ error: 'forbidden' }, 403);
  return session.sub;
}

/**
 * Blocks cross-site writes. The Strict cookie already stays home on cross-site requests;
 * this is the second lock, in case a browser ignores SameSite.
 */
export const sameOrigin = (request: Request) =>
  request.headers.get('origin') === new URL(request.url).origin;
