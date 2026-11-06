import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, FolderGit2, GitBranch, Search, SearchX, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components';
import { profile } from '@/content/profile';

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics?: string[];
}

// GitHub's own language colors (data, not theme): shown as small dots next to the language name.
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Python: '#3572a5',
  Java: '#b07219',
  PHP: '#4f5d95',
  Ruby: '#701516',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Go: '#00add8',
  Rust: '#dea584',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Lua: '#000080',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};
const languageColor = (language: string) => LANGUAGE_COLORS[language] ?? '#8257e5';

const PAGE_SIZE = 12;

// GitHub allows 60 unauthenticated requests per hour per IP, shared by everyone behind that IP.
// shortcut: cached for the tab's lifetime only (a reload refetches); use sessionStorage if visitors still hit the limit.
let reposRequest: Promise<Repository[]> | null = null;

function loadRepos(username: string): Promise<Repository[]> {
  reposRequest ??= fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`,
  ).then(async (response) => {
    // GitHub answers 403 or 429 when the rate limit is reached.
    if (!response.ok) {
      throw new Error(
        response.status === 403 || response.status === 429 ? 'rateLimit' : 'loadError',
      );
    }
    const repos = (await response.json()) as Repository[];
    return repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  });
  // A failed request is not cached: the next visit tries again.
  reposRequest.catch(() => (reposRequest = null));
  return reposRequest;
}

const GitHubRepos: React.FC = () => {
  const { t, i18n } = useTranslation();
  const username = profile.socials.github;
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<'rateLimit' | 'loadError' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!username.trim()) return;
    let active = true;
    setLoading(true);
    setError(null);
    loadRepos(username)
      .then((data) => active && setRepos(data))
      .catch((err: unknown) => {
        if (active)
          setError(err instanceof Error && err.message === 'rateLimit' ? 'rateLimit' : 'loadError');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [username]);

  const languages = useMemo(
    () => [...new Set(repos.flatMap((repo) => (repo.language ? [repo.language] : [])))].sort(),
    [repos],
  );

  const filteredRepos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return repos.filter(
      (repo) =>
        (repo.name.toLowerCase().includes(term) ||
          (repo.description?.toLowerCase().includes(term) ?? false)) &&
        (!selectedLanguage || repo.language === selectedLanguage),
    );
  }, [repos, searchTerm, selectedLanguage]);

  // A new search or filter starts again from the first page.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedLanguage]);

  const displayedRepos = filteredRepos.slice(0, visibleCount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(i18n.resolvedLanguage, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    // Content is absolute so loading more repos scrolls inside the card instead of growing it:
    // on desktop the card takes the profile column's height, on phones a fixed 640px.
    <section
      aria-label={t('github.profile')}
      className="relative h-[640px] w-full rounded-xl border bg-card shadow-sm lg:h-auto lg:w-[60%]"
    >
      <div className="absolute inset-0 overflow-y-auto rounded-xl p-3 sm:p-4">
        {repos.length > 0 && (
          <div className="sticky top-0 z-10 -mx-1 mb-3 flex flex-col gap-2 bg-card px-1 pb-2 sm:flex-row sm:items-center">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('github.profile')}
              className="hidden size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
            >
              <FolderGit2 className="size-5" aria-hidden="true" />
            </a>
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('github.search')}
                aria-label={t('github.search')}
                className="h-9 border-transparent bg-secondary pl-9"
              />
            </div>
            {languages.length > 1 && (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                aria-label={t('github.filter')}
                className="h-9 rounded-md border border-transparent bg-secondary px-2 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">{t('github.filter')}</option>
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mb-3 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-body text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {t(`github.${error}`)}
          </p>
        )}

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
          {displayedRepos.map((repo) => (
            <li key={repo.id}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col gap-2 rounded-lg border bg-secondary p-3 transition-[background-color,transform] duration-200 ease-out hover:bg-accent active:scale-[0.98] motion-safe:hover:-translate-y-0.5"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate text-body font-semibold group-hover:underline">
                    {repo.name}
                  </span>
                  <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                    {formatDate(repo.updated_at)}
                  </span>
                </span>

                <span
                  className={`line-clamp-2 text-sm ${repo.description ? 'text-muted-foreground' : 'text-muted-foreground/70 italic'}`}
                >
                  {repo.description ?? t('github.noDescription')}
                </span>

                <span className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: languageColor(repo.language) }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5" aria-hidden="true" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="size-3.5" aria-hidden="true" />
                    {repo.forks_count}
                  </span>
                </span>

                {repo.topics && repo.topics.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {repo.topics.slice(0, 2).map((topic) => (
                      <span
                        key={topic}
                        className="max-w-[120px] truncate rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 2 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        +{repo.topics.length - 2}
                      </span>
                    )}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        {displayedRepos.length < filteredRepos.length && (
          <div className="py-3 text-center">
            <Button variant="secondary" onClick={() => setVisibleCount((n) => n + 6)}>
              {t('github.loadMore')}
            </Button>
          </div>
        )}

        {repos.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-secondary p-6 text-center">
            <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-base font-semibold">{t('github.noRepositories')}</h3>
            <p className="text-body text-muted-foreground">
              {t('github.noRepositoriesConfigured')}
            </p>
          </div>
        )}

        {loading && (
          <div role="status" aria-label={t('github.loading')} className="flex justify-center p-6">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    </section>
  );
};

export default GitHubRepos;
