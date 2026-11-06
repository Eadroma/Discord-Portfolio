import { validateProfile } from '../../src/lib/profileSchema.js';
import { githubConfig, GithubError, readProfileFile, writeProfileFile } from '../_lib/github.js';
import { json, requireAdmin, sameOrigin } from '../_lib/session.js';

const MAX_BODY = 100_000;

// GitHub refuses a bad token, a token without access to the repo, or a branch that doesn't exist:
// those are setup mistakes, reported as such instead of "try again later".
function githubFailure(error: unknown): Response {
  if (error instanceof GithubError && [401, 403, 404].includes(error.status)) {
    return json({ error: 'githubConfig' }, 500);
  }
  return json({ error: 'upstream' }, 502);
}

/** One line, prefixed "content:" so these commits are easy to find in the history. */
export function commitMessage(input: unknown): string {
  const line = typeof input === 'string' ? (input.split(/\r?\n/)[0] ?? '').trim() : '';
  const text = line.replace(/^content:\s*/i, '').slice(0, 64) || 'update profile';
  return `content: ${text}`;
}

// The profile as it is on the configured branch now, not the copy bundled in the site,
// which can be older. `sha` must come back with the next PUT.
export async function GET(request: Request): Promise<Response> {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;
  const config = githubConfig();
  if (!config) return json({ error: 'notConfigured' }, 500);

  try {
    const { text, sha } = await readProfileFile(config);
    return json({ profile: JSON.parse(text) as unknown, sha, branch: config.branch });
  } catch (error) {
    return githubFailure(error);
  }
}

export async function PUT(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return json({ error: 'unsupportedMediaType' }, 415);
  }
  const config = githubConfig();
  if (!config) return json({ error: 'notConfigured' }, 500);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'tooLarge' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'invalidJson' }, 400);
  }
  if (
    typeof body !== 'object' ||
    body === null ||
    !('sha' in body) ||
    typeof body.sha !== 'string'
  ) {
    return json({ error: 'invalidJson' }, 400);
  }
  const { sha, profile, message } = body as { sha: string; profile?: unknown; message?: unknown };

  const result = validateProfile(profile);
  if (!result.ok) return json({ error: 'invalid', issues: result.issues }, 400);

  try {
    const saved = await writeProfileFile(
      config,
      `${JSON.stringify(result.profile, null, 2)}\n`,
      sha,
      commitMessage(message),
    );
    return json(saved);
  } catch (error) {
    // The file changed since this tab loaded it (another tab, or a commit by hand).
    if (error instanceof GithubError && error.status === 409) {
      return json({ error: 'conflict' }, 409);
    }
    return githubFailure(error);
  }
}
