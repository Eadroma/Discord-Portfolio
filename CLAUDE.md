# Discord Portfolio

Personal portfolio styled like a Discord profile. Static React SPA on Vercel plus serverless functions in `api/`.
Production domain will be `eadroma.dev` (not bought yet).
v2 rebuild in progress on branch `v2`: design + kanban at https://claude.ai/artifact/SxJdqAMNRqqMVoQ3H3y2tV
Admin area: spec https://claude.ai/artifact/TZqZRThvQEUmbDN1s9TCj7 (written for a token approach; the build uses the cookie approach below), mockups https://claude.ai/artifact/69roQdXzh9ZXPLXoEdzbTf
v3 proposals (theming audit, features, order): https://claude.ai/artifact/Lu8xNokeny3e4iuZaXrPpk, mockups at https://claude.ai/artifact/SW81mqAuq9gh9TrSEMLggR

## Commands

- `npm run dev` — Vite dev server; also serves `api/**/*.ts` through the `apiRoutes` plugin in `vite.config.ts` (loads all of `.env` into `process.env`)
- `npm run build` — `tsc -b && vite build`, the only type check
- `npm run lint` — ESLint, type-checked (`strictTypeChecked`, react, jsx-a11y), `--max-warnings 0`
- `npm run format` / `npm run format:check` — Prettier (`.prettierrc`); run `format` before committing
- `npm test` — Vitest; tests sit next to the code as `*.test.ts`
- CI (`.github/workflows/ci.yml`) runs format:check, lint, test, build on every push and PR

## Stack

React 19, TypeScript 5.7, Vite 6, Tailwind 4 (`@tailwindcss/vite`, no tailwind.config), shadcn-style
components in `src/components/ui/`, react-router-dom 7, i18next (en/fr), sonner toasts, lucide icons, Figtree font.
Path alias `@/` → `src/` (browser code only: `api/` and anything it imports use relative paths).

## Layout

- `api/contact.ts` — posts the contact form to the Discord webhook
- `api/auth/{login,callback,logout}.ts` — admin sign-in: Discord code grant on the server, then a signed session cookie
- `api/admin/profile.ts` — GET/PUT `profile.json` on GitHub (Contents API, sha as lock), admin session required
- `api/_lib/` — server helpers, not routes (Vercel skips `_`): `session.ts` (HMAC cookie, `requireAdmin`, `sameOrigin`), `github.ts`
- Every function is a named export per HTTP method taking a Web `Request` and returning a `Response`
- `src/lib/` — pure logic shared by UI and `api/` (`contact.ts`, `profileSchema.ts` validation, `discord.ts` visitor login, `dates.ts`)
- `src/App.tsx` — routes: `/`, `/contact`, `/admin` (lazy), `/auth/discord/callback`, `*` (404)
- `src/pages/` — one file per route; `src/components/admin/` — the admin form
- `src/components/` — feature components, re-exported from `src/components/index.ts`; import from `@/components`
- `src/content/types.ts` — `Profile` and friends (no JSON import, so `api/` can use them)
- `src/content/profile.json` — profile data; import it through `src/content/profile.ts` (typed `profile` + `localize()`), never directly
- `src/content/profile.example.json` — template for forks, type-checked against `Profile`
- `src/locales/{en,fr}.json` — translations, bundled at build time; keep both files' keys in sync
- `vercel.json` — SPA rewrite of every path except `/api/` to `index.html`

## Conventions

- Function components typed `React.FC`, default export per file
- Colors come from the tokens in `src/index.css` (Discord palette behind shadcn names): `bg-background`, `bg-card`,
  `bg-secondary`, `bg-popover`, `bg-primary`/`hover:bg-primary-hover`, `text-muted-foreground`, `bg-online`, `text-link`,
  `from-profile-primary`/`to-profile-accent` (set from `profile.json` `theme`). Lint rejects hex and `gray-*` in `className`;
  data colors (GitHub language dots, admin color preview) go in `style`
- Theme: `.dark`/`.light` class on `<html>`, set before first paint by the inline script in `index.html`, then by
  `ThemeProvider` (localStorage key `portfolio-theme`; read it with `useTheme` from `theme-context.ts`)
- Running text is `text-body` (15px); `text-xs` only for uppercase labels and badges. Icons: lucide with `aria-hidden="true"`, no emoji
- Bilingual content fields are `{ en, fr }` (`Localized`, including `Experience.position`); render with `localize(field, i18n.resolvedLanguage)`
- UI strings go through `t()` from `react-i18next`; add keys to both locale files. `npm run lint` fails on
  hardcoded text in JSX, in `alt`/`title`/`placeholder`/`aria-label`, and in `toast()` (use `alt=""` for decorative images)
- API errors are short codes (`{ error: 'conflict' }`) that the UI translates

## Env (`.env`, see `.env.example` and README "Admin area")

Public (`VITE_`, in the bundle): `VITE_DISCORD_CLIENT_ID`, `VITE_DISCORD_REDIRECT_URI`, `VITE_ADMIN_DISCORD_ID` (also read by the server).
Server-only: `DISCORD_WEBHOOK_URL`, `DISCORD_CLIENT_SECRET`, `SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`.
Never put a secret in a `VITE_` var. Any missing admin variable makes `/admin` fail closed (`notConfigured`).

## Gotchas

- `api/` imports from `src/` with a `.js` extension (`../src/lib/contact.js`) so Node ESM resolves it on Vercel
- Two Discord logins: visitors use the implicit grant in the browser (prefills Contact; `state` in sessionStorage
  `discordOAuthState`, user cached in localStorage `discordUser`, `discord-auth-change` event); the admin uses the
  server code grant (`/api/auth/*`, cookies `__Host-admin_session` and `__Host-admin_oauth_state`). Never trust
  `discordUser` for authorization: only `requireAdmin()` does that
- Discord redirects must be registered exactly: `/auth/discord/callback` (visitor) and `/api/auth/callback` (admin), per origin
- Read the stored Discord user with `readDiscordUser()` (it validates and clears bad data), never `JSON.parse(localStorage...)`; `badge`, `avatar`, `globalName` can be `null`
- `profile.json` must stay byte-identical to `JSON.stringify(validateProfile(it).profile, null, 2) + "\n"` (key order
  matters; a test checks it), or the first admin save rewrites the whole file
- Admin commits land on `GITHUB_BRANCH` on GitHub, not locally: pull before editing `profile.json` by hand
- Profile dates are `YYYY-MM-DD` (parsed as UTC): use `src/lib/dates.ts`, never local `getFullYear()`/`getMonth()`
- Plurals use i18next suffixes (`years_one`/`years_other`) with `t(key, { count })`
- GitHub repos are fetched from the browser (60 req/hour per visitor IP)
