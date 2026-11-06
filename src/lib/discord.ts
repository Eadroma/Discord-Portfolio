import type { DiscordUser } from '@/types/user';

export const DISCORD_STATE_KEY = 'discordOAuthState';
export const DISCORD_USER_KEY = 'discordUser';

// localStorage is user-editable: anything unreadable counts as logged out and is cleared.
export function readDiscordUser(raw = localStorage.getItem(DISCORD_USER_KEY)): DiscordUser | null {
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as Partial<DiscordUser> | null;
    if (/^\d+$/.test(String(user?.id)) && typeof user?.username === 'string') {
      return user as DiscordUser;
    }
  } catch {
    // fall through
  }
  localStorage.removeItem(DISCORD_USER_KEY);
  return null;
}

// Users without a custom avatar get one of Discord's default ones, picked from their id.
export function avatarUrl(user: Pick<DiscordUser, 'id' | 'avatar'>, size = 64): string {
  if (user.avatar)
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`;
}

export type DiscordCallback =
  | { ok: true; tokenType: string; accessToken: string }
  | { ok: false; error: string };

// Reads the implicit-grant redirect hash and checks it answers the login this tab started.
export function parseDiscordCallback(hash: string, expectedState: string | null): DiscordCallback {
  const fragment = new URLSearchParams(hash.replace(/^#/, ''));
  const error = fragment.get('error');
  if (error) return { ok: false, error };
  if (!expectedState || fragment.get('state') !== expectedState) {
    return { ok: false, error: 'state_mismatch' };
  }
  const accessToken = fragment.get('access_token');
  const tokenType = fragment.get('token_type');
  if (!accessToken || !tokenType) return { ok: false, error: 'no_token' };
  return { ok: true, accessToken, tokenType };
}
