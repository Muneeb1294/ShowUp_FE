# ShowUp Frontend — Deployment (Vercel)

Repo: **ShowUp_FE** — React + Vite app at repo root.

## Vercel setup

1. [vercel.com](https://vercel.com) → **Add New → Project** → import `Muneeb1294/ShowUp_FE`.
2. Framework: **Vite** (defaults).
   - Build: `npm run build`
   - Output: `dist`
3. No root subdirectory — project files are at repo root.

## How production connects to Railway

`.env.production` (committed) sets `VITE_API_URL=https://showupbe-production.up.railway.app`. Vite inlines it at build time, so the browser calls **Railway directly** (not `your-app.vercel.app/api/...`).

If you change the Railway domain, update `.env.production` and redeploy.

Railway must allow your Vercel origins in CORS (`FRONTEND_URL` plus `show-up-*.vercel.app` previews).

## Local development

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:4000
```

**Production URL (use this):** https://show-up-fe.vercel.app

### Preview URLs (`show-up-xxxxx-…vercel.app`)

Vercel **Deployment Protection** often blocks preview URLs with an “Authentication Required” HTML page — including `/api/*`. That is not a backend bug.

- **Option A:** Use https://show-up-fe.vercel.app for testing.
- **Option B:** Vercel → Project → **Settings** → **Deployment Protection** → disable for Preview, or allow your team to access previews without the auth wall.

Test the API proxy: open `https://show-up-fe.vercel.app/api/v1/categories` — you should see JSON, not HTML.

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
