import React, { useEffect, useState } from 'react';
import { Button } from '@/components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, ShieldCheck } from 'lucide-react';
import { avatarUrl, DISCORD_STATE_KEY, DISCORD_USER_KEY, readDiscordUser } from '@/lib/discord';
import type { DiscordUser } from '@/types/user';

interface DiscordLoginProps {
  clientId: string;
  /** Defaults to this origin's /auth/discord/callback. */
  redirectUri?: string;
}

const DiscordLogin: React.FC<DiscordLoginProps> = ({ clientId, redirectUri }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Re-read on navigation, on login/logout in this tab, and on changes from other tabs
  useEffect(() => {
    setUser(readDiscordUser());
  }, [location.pathname]);

  useEffect(() => {
    const refresh = () => setUser(readDiscordUser());
    const onStorage = (e: StorageEvent) => e.key === DISCORD_USER_KEY && refresh();

    window.addEventListener('storage', onStorage);
    window.addEventListener('discord-auth-change', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('discord-auth-change', refresh);
    };
  }, []);

  const login = () => {
    // The callback rejects any token whose state doesn't match, so other sites can't log a visitor in.
    const state = crypto.randomUUID();
    sessionStorage.setItem(DISCORD_STATE_KEY, state);
    const params = new URLSearchParams({
      response_type: 'token',
      client_id: clientId,
      scope: 'identify',
      // `||`: an empty VITE_DISCORD_REDIRECT_URI= line in .env counts as unset.
      redirect_uri: redirectUri || `${window.location.origin}/auth/discord/callback`,
      state,
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  };

  const logout = () => {
    localStorage.removeItem(DISCORD_USER_KEY);
    setUser(null);
    window.dispatchEvent(new Event('discord-auth-change'));
    void navigate('/');
  };

  const closeOnEscape = (e: React.KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);

  if (!user) {
    return (
      <Button
        onClick={login}
        aria-label={t('header.CTA.login')}
        className="h-9 gap-1.5 bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
      >
        <svg viewBox="0 0 71 55" fill="currentColor" aria-hidden="true" className="size-4">
          <path d="M60.1 4.9A58.5 58.5 0 0 0 45.6.4a40 40 0 0 0-1.9 4A54.1 54.1 0 0 0 27.4 4.2 40 40 0 0 0 25.5.4 58.4 58.4 0 0 0 10.9 4.9C1.6 18.7-.9 32.1.3 45.4a58.9 58.9 0 0 0 17.8 9.1 43.6 43.6 0 0 0 3.9-6.3 38.3 38.3 0 0 1-6-2.9l1.5-1.2a42 42 0 0 0 36.1 0l1.5 1.2a38.3 38.3 0 0 1-6 2.9 43.3 43.3 0 0 0 3.8 6.3 58.7 58.7 0 0 0 17.8-9.1c1.5-15.3-2.5-28.6-10.5-40.4ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.2 6.4-7.2 6.4 3.3 6.4 7.2-2.8 7.1-6.4 7.1Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.2 6.4-7.2 6.4 3.3 6.4 7.2-2.8 7.1-6.4 7.1Z" />
        </svg>
        <span className="hidden sm:inline">{t('header.CTA.login')}</span>
      </Button>
    );
  }

  return (
    // Opens on hover (mouse), on tap/Enter (touch, keyboard); closes when focus leaves.
    <div
      className="group relative"
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setMenuOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        onKeyDown={closeOnEscape}
        className="flex h-9 items-center gap-2 rounded-md bg-secondary px-2 transition-colors hover:bg-accent"
      >
        <span className="relative">
          <img src={avatarUrl(user, 48)} alt="" className="size-6 rounded-full" />
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-secondary bg-online" />
        </span>
        <span className="hidden flex-col text-left sm:flex">
          <span className="text-sm leading-tight font-semibold">
            {user.globalName ?? user.username}
          </span>
          {user.globalName && (
            <span className="text-xs leading-tight text-muted-foreground">@{user.username}</span>
          )}
        </span>
      </button>

      {/* pt-1 instead of a margin so the pointer never crosses a gap that ends the hover */}
      <div
        className={`absolute top-full right-0 z-50 w-48 pt-1 transition-opacity duration-150 ease-out group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 ${
          menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {/* Shown to the admin only; /admin checks the session on the server anyway. */}
        {user.id === import.meta.env.VITE_ADMIN_DISCORD_ID && (
          <Link
            to="/admin"
            onKeyDown={closeOnEscape}
            className="mb-1 flex w-full items-center gap-2 rounded-md border bg-popover px-3 py-2 text-left text-sm font-medium shadow-lg hover:bg-accent"
          >
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            {t('header.CTA.admin')}
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          onKeyDown={closeOnEscape}
          className="flex w-full items-center gap-2 rounded-md border bg-popover px-3 py-2 text-left text-sm font-medium text-destructive shadow-lg hover:bg-accent"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t('header.CTA.logout')}
        </button>
      </div>
    </div>
  );
};

export default DiscordLogin;
