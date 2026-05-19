# ShowUp Frontend — Deployment (Vercel)

Repo: **ShowUp_FE** — React + Vite app at repo root.

## Vercel setup

1. [vercel.com](https://vercel.com) → **Add New → Project** → import `Muneeb1294/ShowUp_FE`.
2. Framework: **Vite** (defaults).
   - Build: `npm run build`
   - Output: `dist`
3. No root subdirectory — project files are at repo root.

## Environment (required on Vercel)

Vite inlines `VITE_*` variables **at build time**. If `VITE_API_URL` is missing, the deployed app cannot load data.

1. Vercel → your project → **Settings** → **Environment Variables**
2. Add:

| Name | Value | Environments |
|------|--------|----------------|
| `VITE_API_URL` | `https://showupbe-production.up.railway.app` | Production, Preview, Development |

3. **Deployments** → latest deployment → **⋯** → **Redeploy** (must rebuild after adding the variable)

Deployed app: https://show-up-fe.vercel.app

To verify a build embedded the URL, search the built JS for `showupbe-production` (it should appear; if you only see `VITE_API_URL is required`, the variable was not set during build).

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
