// Reads and commits src/content/profile.json through GitHub's Contents API.
// The file's sha is the lock: a write based on an old sha gets 409 instead of overwriting.

export const PROFILE_PATH = 'src/content/profile.json';

export interface GithubConfig {
  token: string;
  /** owner/name */
  repo: string;
  branch: string;
}

export class GithubError extends Error {
  constructor(readonly status: number) {
    super(`GitHub API ${status}`);
  }
}

export function githubConfig(): GithubConfig | null {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo, GITHUB_BRANCH: branch } = process.env;
  if (!token || !repo || !branch || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { token, repo, branch };
}

const headers = (config: GithubConfig) => ({
  Authorization: `Bearer ${config.token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'discord-portfolio-admin',
});

const url = (config: GithubConfig) =>
  `https://api.github.com/repos/${config.repo}/contents/${PROFILE_PATH}`;

export async function readProfileFile(
  config: GithubConfig,
): Promise<{ text: string; sha: string }> {
  const response = await fetch(`${url(config)}?ref=${encodeURIComponent(config.branch)}`, {
    headers: headers(config),
  });
  if (!response.ok) throw new GithubError(response.status);
  const file = (await response.json()) as { content: string; sha: string };
  return { text: Buffer.from(file.content, 'base64').toString('utf8'), sha: file.sha };
}

export async function writeProfileFile(
  config: GithubConfig,
  text: string,
  sha: string,
  message: string,
): Promise<{ sha: string; commitUrl: string }> {
  const response = await fetch(url(config), {
    method: 'PUT',
    headers: { ...headers(config), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(text, 'utf8').toString('base64'),
      sha,
      branch: config.branch,
    }),
  });
  if (!response.ok) throw new GithubError(response.status);
  const result = (await response.json()) as {
    content: { sha: string };
    commit: { html_url: string };
  };
  return { sha: result.content.sha, commitUrl: result.commit.html_url };
}
