/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Discord application id; without it the login button is hidden. */
  readonly VITE_DISCORD_CLIENT_ID?: string;
  readonly VITE_DISCORD_REDIRECT_URI?: string;
  /** Discord id of the only admin. Public on purpose: the server re-checks it on every request. */
  readonly VITE_ADMIN_DISCORD_ID?: string;
}
