export interface DiscordUser {
  id: string;
  avatar: string;
  banner: string;
  globalName: string;
  badge: {
    tag: string | null;
    id: string | null;
    guildId: string | null;
  };
  username: string;
}
