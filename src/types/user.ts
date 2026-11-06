export interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  banner: string | null;
  /** Server tag; null when the user has none. */
  badge: {
    tag: string | null;
    id: string | null;
    guildId: string | null;
  } | null;
}
