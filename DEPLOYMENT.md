# ShowUp Frontend — Deployment (Vercel)

Repo: **ShowUp_FE** — React + Vite app at repo root.

## Vercel setup

1. [vercel.com](https://vercel.com) → **Add New → Project** → import `Muneeb1294/ShowUp_FE`.
2. Framework: **Vite** (defaults).
   - Build: `npm run build`
   - Output: `dist`
3. No root subdirectory — project files are at repo root.

## Environment

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | Railway API URL, e.g. `https://showup-api.up.railway.app` |

Redeploy after changing `VITE_API_URL` (inlined at build time).

`vercel.json` rewrites routes to `index.html` for React Router.

## Local dev

```bash
npm install
npm run dev
```

With the API on port 4000, Vite proxies `/api`. For a production-style build:

```bash
VITE_API_URL=http://localhost:4000 npm run build
npm run preview
```

## Publish from monorepo

If you develop in the combined `showup` folder:

```bash
./scripts/publish-repos.sh
git -C ../showup-front-end push origin main
```
