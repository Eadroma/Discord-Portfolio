import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AlertTriangle, ExternalLink, LogOut, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfileEditor from '@/components/admin/ProfileEditor';
import type { Profile } from '@/content/profile';
import { validateProfile, type Issue } from '@/lib/profileSchema';

type Page =
  | { kind: 'loading' }
  | { kind: 'login'; reason?: string }
  | { kind: 'error'; error: string }
  | { kind: 'ready' };

// Kept across the trip to Discord when the session expires mid-edit, so no work is lost.
const DRAFT_KEY = 'adminDraft';

const readError = async (response: Response) => {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === 'string' ? body.error : 'upstream';
  } catch {
    return 'upstream';
  }
};

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [page, setPage] = useState<Page>({ kind: 'loading' });
  const [draft, setDraft] = useState<Profile | null>(null);
  const [saved, setSaved] = useState<Profile | null>(null);
  const [sha, setSha] = useState('');
  const [branch, setBranch] = useState('');
  const [serverIssues, setServerIssues] = useState<Issue[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [message, setMessage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [lastCommit, setLastCommit] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPage({ kind: 'loading' });
    const response = await fetch('/api/admin/profile');
    if (response.status === 401) {
      setPage({ kind: 'login', reason: params.get('error') ?? undefined });
      return;
    }
    if (!response.ok) {
      setPage({ kind: 'error', error: await readError(response) });
      return;
    }
    const data = (await response.json()) as { profile: unknown; sha: string; branch: string };
    const result = validateProfile(data.profile);
    if (!result.ok) {
      setPage({ kind: 'error', error: 'remoteInvalid' });
      return;
    }

    let start = result.profile;
    try {
      const kept = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as {
        sha: string;
        draft: Profile;
      } | null;
      sessionStorage.removeItem(DRAFT_KEY);
      // Only if nobody published in between; otherwise the kept draft would undo their change.
      if (kept?.sha === data.sha) start = kept.draft;
    } catch {
      // No storage, or unreadable: start from the published version.
    }

    setSaved(result.profile);
    setDraft(start);
    setSha(data.sha);
    setBranch(data.branch);
    setConflict(false);
    setPage({ kind: 'ready' });
  }, [params]);

  useEffect(() => {
    load().catch(() => setPage({ kind: 'error', error: 'upstream' }));
  }, [load]);

  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);

  // Warn before closing the tab with unpublished edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (page.kind === 'loading') {
    return (
      <div role="status" aria-label={t('admin.loading')} className="flex justify-center p-16">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (page.kind === 'login') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <ShieldCheck className="size-10 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-extrabold">{t('admin.login.title')}</h1>
        {page.reason && (
          <p role="alert" className="rounded-md bg-destructive/15 p-3 text-body text-destructive">
            {t(`admin.errors.${page.reason}`, { defaultValue: t('admin.errors.login') })}
          </p>
        )}
        <p className="text-body text-muted-foreground">{t('admin.login.text')}</p>
        {/* A full navigation: the server sends the browser to Discord. */}
        <a
          href="/api/auth/login"
          className="rounded-md bg-primary px-5 py-3 text-body font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {t('admin.login.button')}
        </a>
      </div>
    );
  }

  if (page.kind === 'error' || !draft) {
    const error = page.kind === 'error' ? page.error : 'upstream';
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
        <h1 className="text-2xl font-extrabold">{t('admin.errors.title')}</h1>
        <p className="text-body text-muted-foreground">
          {t(`admin.errors.${error}`, { defaultValue: t('admin.errors.upstream') })}
        </p>
        <Button variant="secondary" className="h-11" onClick={() => void load()}>
          <RefreshCw aria-hidden="true" />
          {t('admin.actions.retry')}
        </Button>
      </div>
    );
  }

  // After a first try at publishing, fields show their errors as they are typed.
  const live = attempted ? validateProfile(draft) : null;
  const issues = live ? (live.ok ? [] : live.issues) : serverIssues;
  const errorAt = (path: string) => {
    const issue = issues.find((i) => i.path === path);
    return issue && t(`admin.issues.${issue.code}`);
  };

  const patch = (edit: (d: Profile) => void) =>
    setDraft((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      edit(next);
      return next;
    });

  const publish = async () => {
    setAttempted(true);
    const result = validateProfile(draft);
    if (!result.ok) {
      toast.error(t('admin.fixErrors'));
      return;
    }
    setPublishing(true);
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: result.profile, sha, message }),
      });
      if (response.ok) {
        const body = (await response.json()) as { sha: string; commitUrl: string };
        setSha(body.sha);
        setSaved(result.profile);
        setDraft(result.profile);
        setMessage('');
        setAttempted(false);
        setServerIssues([]);
        setLastCommit(body.commitUrl);
        toast.success(t('admin.published', { branch }));
        return;
      }
      if (response.status === 401) {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ sha, draft }));
        } catch {
          // Storage blocked: the login screen still works, the edits are lost.
        }
        setPage({ kind: 'login', reason: 'expired' });
        return;
      }
      if (response.status === 409) {
        setConflict(true);
        return;
      }
      if (response.status === 400) {
        const body = (await response.json()) as { issues?: Issue[] };
        setServerIssues(body.issues ?? []);
      }
      toast.error(
        t(`admin.errors.${await readError(response)}`, {
          defaultValue: t('admin.errors.upstream'),
        }),
      );
    } catch {
      toast.error(t('admin.errors.upstream'));
    } finally {
      setPublishing(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setPage({ kind: 'login' });
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-3 pt-6 pb-32 sm:px-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold">{t('admin.title')}</h1>
          <p className="text-body text-muted-foreground">{t('admin.subtitle', { branch })}</p>
        </div>
        <Button variant="secondary" className="h-11" onClick={() => void logout()}>
          <LogOut aria-hidden="true" />
          {t('header.CTA.logout')}
        </Button>
      </header>

      {conflict && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4"
        >
          <p className="text-body font-semibold">{t('admin.conflict.title')}</p>
          <p className="text-body text-muted-foreground">{t('admin.conflict.text')}</p>
          <Button variant="secondary" className="h-11 self-start" onClick={() => void load()}>
            <RefreshCw aria-hidden="true" />
            {t('admin.conflict.reload')}
          </Button>
        </div>
      )}

      {lastCommit && !dirty && (
        <p className="flex flex-wrap items-center gap-2 rounded-xl bg-online/15 p-4 text-body">
          {t('admin.publishedDetail', { branch })}
          <a
            href={lastCommit}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-link underline-offset-2 hover:underline"
          >
            {t('admin.seeCommit')}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </p>
      )}

      <ProfileEditor draft={draft} patch={patch} errorAt={errorAt} />

      {/* Stays at the bottom of the screen while scrolling through the long form. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-3 py-3 backdrop-blur sm:px-4">
        <form
          className="mx-auto flex max-w-4xl flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void publish();
          }}
        >
          <span className="text-sm font-semibold text-muted-foreground" aria-live="polite">
            {dirty ? t('admin.dirty') : t('admin.clean')}
          </span>
          <label htmlFor="commit-message" className="sr-only">
            {t('admin.message.label')}
          </label>
          <Input
            id="commit-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('admin.message.placeholder')}
            maxLength={64}
            className="h-11 min-w-0 flex-1 basis-48 bg-secondary text-base"
          />
          <Button
            type="submit"
            disabled={!dirty || publishing}
            className="h-11 bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Send aria-hidden="true" />
            {publishing ? t('admin.actions.publishing') : t('admin.actions.publish')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
