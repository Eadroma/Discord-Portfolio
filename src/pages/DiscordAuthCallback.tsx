import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DISCORD_STATE_KEY, DISCORD_USER_KEY, parseDiscordCallback } from '@/lib/discord';
import type { DiscordUser } from '@/types/user';

/** The fields of Discord's GET /users/@me that the profile card uses. */
interface DiscordApiUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  banner?: string | null;
  clan?: { tag: string | null; badge: string | null; identity_guild_id: string | null } | null;
}

// One toast id: StrictMode runs the effect twice in dev, the second toast replaces the first.
const TOAST_ID = 'discord-login';

const DiscordAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const callback = parseDiscordCallback(
      window.location.hash,
      sessionStorage.getItem(DISCORD_STATE_KEY),
    );

    const fail = (reason: string) => {
      console.error('Discord login failed:', reason);
      toast.error(t('discord.error'), { id: TOAST_ID });
      // replace: keep the URL holding the token out of the browser history
      void navigate('/', { replace: true });
    };

    if (!callback.ok) {
      fail(callback.error);
      return;
    }

    void fetch('https://discord.com/api/users/@me', {
      headers: { authorization: `${callback.tokenType} ${callback.accessToken}` },
    })
      .then((result) => {
        if (!result.ok) throw new Error(`Discord API ${result.status}`);
        return result.json() as Promise<DiscordApiUser>;
      })
      .then(({ id, avatar, global_name, banner, clan, username }) => {
        const userData: DiscordUser = {
          id,
          avatar,
          globalName: global_name,
          username,
          banner: banner ?? null,
          badge: clan ? { tag: clan.tag, id: clan.badge, guildId: clan.identity_guild_id } : null,
        };

        localStorage.setItem(DISCORD_USER_KEY, JSON.stringify(userData));
        // Cleared only on success: StrictMode runs this effect twice in dev.
        sessionStorage.removeItem(DISCORD_STATE_KEY);

        // Synchronous: the navbar has read the new user before we navigate.
        window.dispatchEvent(new Event('discord-auth-change'));
        toast.success(t('discord.success'), { id: TOAST_ID });
        void navigate('/', { replace: true });
      })
      .catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
  }, [navigate, t]);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-4 size-16 rounded-full bg-secondary" />
          <div className="mb-3 h-4 w-3/4 rounded bg-secondary" />
          <div className="h-3 w-1/2 rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
};

export default DiscordAuthCallback;
