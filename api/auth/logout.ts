import { cookie, json, sameOrigin, SESSION_COOKIE } from '../_lib/session.js';

// POST, not GET: a link or an image on another site must not be able to log the admin out.
export function POST(request: Request): Response {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': cookie(SESSION_COOKIE, '', 0, 'Strict') },
  });
}
