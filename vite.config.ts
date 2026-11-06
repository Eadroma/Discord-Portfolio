import { existsSync } from 'node:fs';
import type { IncomingMessage } from 'node:http';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const readBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
};

/**
 * Serves api/<path>.ts in `npm run dev` the way Vercel does in production: the file's export
 * named after the HTTP method gets a Web Request and returns a Response. Dev only.
 */
function apiRoutes(): Plugin {
  return {
    name: 'api-routes',
    apply: 'serve',
    configureServer(server) {
      if (process.env.VITEST) return;
      // Server-only variables (no VITE_ prefix) are not exposed by Vite; the functions read process.env.
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''));

      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
        // Letters, digits, - and / only: no "..", no "_lib" helpers.
        const file = path.join(import.meta.dirname, `${url.pathname}.ts`);
        if (!/^\/api(\/[a-z0-9-]+)+$/i.test(url.pathname) || !existsSync(file)) {
          next();
          return;
        }

        void (async () => {
          try {
            const module = (await server.ssrLoadModule(file)) as Record<string, unknown>;
            const handler = module[req.method ?? 'GET'];
            if (typeof handler !== 'function') {
              res.statusCode = 405;
              res.end();
              return;
            }
            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
              if (typeof value === 'string') headers.set(key, value);
              else value?.forEach((v) => headers.append(key, v));
            }
            const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
            const request = new Request(url, {
              method: req.method,
              headers,
              body: hasBody ? await readBody(req) : undefined,
            });
            const response = await (handler as (r: Request) => Promise<Response> | Response)(
              request,
            );

            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              if (key !== 'set-cookie') res.setHeader(key, value);
            });
            const cookies = response.headers.getSetCookie();
            if (cookies.length) res.setHeader('set-cookie', cookies);
            res.end(Buffer.from(await response.arrayBuffer()));
          } catch (error) {
            server.config.logger.error(`[api] ${url.pathname}: ${String(error)}`);
            res.statusCode = 500;
            res.end();
          }
        })();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiRoutes()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
