# Discord-Inspired Portfolio

A personal portfolio styled like a Discord profile: profile card, skills, public GitHub repos, a
work timeline, and a contact form that lands in a Discord channel. English and French, dark mode
by default.

Built with React 19, TypeScript, Vite and Tailwind CSS 4. Hosted on Vercel as a static site plus
one serverless function for the contact form.

## Getting started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/yourusername/discord-portfolio.git
cd discord-portfolio
npm install
cp .env.example .env   # then fill it in, see below
npm run dev
```

`npm run dev` also serves the functions in `api/` (contact form, admin), the same way Vercel does:
`api/auth/login.ts` answers `/api/auth/login`. Server-only variables are read from `.env`.

| Command                | What it does                                             |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Dev server with hot reload                               |
| `npm test`             | Unit tests (Vitest)                                      |
| `npm run lint`         | ESLint with type checking, React and accessibility rules |
| `npm run format`       | Format every file with Prettier                          |
| `npm run format:check` | Check formatting without changing files (what CI runs)   |
| `npm run build`        | Type check and production build                          |

CI runs `format:check`, `lint`, `test` and `build` on every push. Lint fails on any warning, on
text that skips translations, and on hardcoded colors: use the theme tokens in `src/index.css`.

## Configuration

### Environment variables

| Variable                    | Where it is used                                             | Public? |
| --------------------------- | ------------------------------------------------------------ | ------- |
| `DISCORD_WEBHOOK_URL`       | `api/contact.ts`, posts contact messages                     | No      |
| `VITE_DISCORD_CLIENT_ID`    | "Login with Discord" button                                  | Yes     |
| `VITE_DISCORD_REDIRECT_URI` | OAuth redirect, e.g. `https://you.dev/auth/discord/callback` | Yes     |
| `VITE_ADMIN_DISCORD_ID`     | Discord user id of the admin; empty turns `/admin` off       | Yes     |
| `DISCORD_CLIENT_SECRET`     | Admin login (code exchange with Discord)                     | No      |
| `SESSION_SECRET`            | Signs the admin session cookie                               | No      |
| `GITHUB_TOKEN`              | Admin publishing: commits `profile.json`                     | No      |
| `GITHUB_REPO`               | Repository the admin commits to, `owner/name`                | No      |
| `GITHUB_BRANCH`             | Branch the admin commits to; must exist on GitHub            | No      |

Anything starting with `VITE_` is copied into the public JavaScript bundle. Never put a secret
in a `VITE_` variable. In production, set the same variables in your host's environment settings.

### Discord login

The "Login with Discord" button sends the visitor to Discord, which sends them back to
`VITE_DISCORD_REDIRECT_URI` with a token. Discord only redirects to URIs listed in the application's
settings, and the match must be exact (protocol, host, port and path).

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create an
   application (its name cannot contain "discord"; visitors see it on the authorization screen).
2. Copy its **Client ID** (OAuth2 page) into `VITE_DISCORD_CLIENT_ID`. No client secret is needed.
3. Under **OAuth2 → Redirects**, add one URI per place the site runs, then save:
   - local: `http://localhost:5173/auth/discord/callback`
   - production: `https://<your-domain>/auth/discord/callback`
4. In each environment, set `VITE_DISCORD_REDIRECT_URI` to that environment's URI. It is read at
   build time, so rebuild after changing it.

Without `VITE_DISCORD_CLIENT_ID` the login button is hidden; the rest of the site works.

### Admin area

`/admin` lets the owner edit the profile (texts in both languages, availability status, contact
details, banner colors, skills, experience) from the browser. Publishing commits
`src/content/profile.json` to `GITHUB_BRANCH`, and Vercel rebuilds that branch.

How access works: the admin signs in with Discord's code grant, handled by the server
(`api/auth/`). The server checks that the Discord account is `VITE_ADMIN_DISCORD_ID`, then sets a
signed `__Host-` cookie (HttpOnly, Secure, SameSite=Strict, 8 hours). The Discord token never
reaches the browser, and every `/api/admin/*` request checks the cookie again. Someone who edits
their browser storage only gets the sign-in screen.

Setup:

1. `VITE_ADMIN_DISCORD_ID`: your Discord user id (Discord settings → Advanced → Developer mode,
   then right-click your name → Copy User ID).
2. `DISCORD_CLIENT_SECRET`: Developer Portal → your application → OAuth2 → Client Secret
   (Reset Secret shows it once). Under **OAuth2 → Redirects**, also add the admin callback for each
   place the site runs: `http://localhost:5173/api/auth/callback` and
   `https://<your-domain>/api/auth/callback`.
3. `SESSION_SECRET`: any long random string, different per environment:
   `node -e "console.log(crypto.randomBytes(32).toString('base64url'))"`. Changing it signs
   everyone out.
4. `GITHUB_TOKEN`: GitHub → Settings → Developer settings → Fine-grained tokens. Repository access:
   this repository only. Permissions: **Contents: Read and write**, nothing else.
5. `GITHUB_REPO` (`owner/name`) and `GITHUB_BRANCH`. The branch must already exist on GitHub. To
   review changes before they go live, point it at a working branch and merge it into the
   production branch yourself.

Edits made in `/admin` land on GitHub, not in your local copy: `git pull` before editing
`profile.json` by hand. If two tabs publish from the same starting point, the second one is
refused and asked to reload instead of overwriting the first.

### Your profile

Edit `src/content/profile.json`, including `socials.github` (your GitHub username, used for the repos panel). `src/content/profile.example.json` shows every field. Text that
changes with the language is written as `{ "en": "...", "fr": "..." }`. The build fails if a
field is missing or has the wrong type, so mistakes show up before deploy.

### Translations

Interface text lives in `src/locales/en.json` and `src/locales/fr.json`. A test checks that both
files have the same keys.

## Project structure

```
api/contact.ts        Vercel function: validates the form, posts to the Discord webhook
api/auth/             Admin sign-in with Discord: login, callback, logout
api/admin/profile.ts  Reads and commits profile.json (admin session required)
api/_lib/             Server helpers: session cookie, GitHub client (not routes)
src/
  components/         UI components (shadcn-style primitives in components/ui/, admin/ for /admin)
  content/            profile.json and its type
  lib/                Pure logic shared by UI and api/: validation, Discord login, dates
  locales/            en.json, fr.json
  pages/              One file per route: Home, Contact, Admin, DiscordAuthCallback, NotFound
  types/              Shared TypeScript types
vercel.json           Sends every non-API path to index.html
```

## License

MIT. See [LICENSE](LICENSE).
