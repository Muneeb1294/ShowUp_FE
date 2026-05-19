# ShowUp Frontend — Deployment (Vercel)

Repo: **ShowUp_FE** — React + Vite app at repo root.

## Vercel setup

1. [vercel.com](https://vercel.com) → **Add New → Project** → import `Muneeb1294/ShowUp_FE`.
2. Framework: **Vite** (defaults).
   - Build: `npm run build`
   - Output: `dist`
3. No root subdirectory — project files are at repo root.

## How production connects to Railway

`vercel.json` proxies browser requests from `https://show-up-fe.vercel.app/api/*` to `https://showupbe-production.up.railway.app/api/*`. The app uses same-origin `/api/...` URLs, so **no CORS issues** and **no `VITE_API_URL` required on Vercel**.

If you change the Railway domain, update the `destination` in `vercel.json` and redeploy.

## Local development

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:4000
```

Deployed app: https://show-up-fe.vercel.app

## Optional: direct API URL on Vercel

Instead of the proxy, you can set `VITE_API_URL=https://showupbe-production.up.railway.app` in Vercel env vars and redeploy. Ensure Railway has `FRONTEND_URL=https://show-up-fe.vercel.app` for CORS.

`vercel.json` rewrites routes to `index.html` for React Router.

## Local dev

Set `VITE_API_URL` in `.env` (see `.env.example`), then:

```bash
npm install
npm run dev
```

For a production-style build:

```bash
npm run build
npm run preview
```

## Publish from monorepo

If you develop in the combined `showup` folder:

```bash
./scripts/publish-repos.sh
git -C ../showup-front-end push origin main
```
