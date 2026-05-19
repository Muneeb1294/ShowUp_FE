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
| `VITE_API_URL` | `https://showupbe-production.up.railway.app` |

Deployed app: https://show-up-fe.vercel.app

Redeploy after changing `VITE_API_URL` (inlined at build time).

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
