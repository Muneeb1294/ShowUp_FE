# ShowUp Client

React + Vite frontend for the ShowUp API.

## Setup

```bash
cd client
npm install
```

Ensure the API is running on port 4000 (see `server/`).

## Development

```bash
npm run dev
```

Opens at http://localhost:5173. API requests to `/api/*` are proxied to `http://localhost:4000`.

## Routes

| Path | Description |
|------|-------------|
| `/` | Public project board (featured, pinned, all approved) |
| `/submit` | Submit a GitHub repo for review |
| `/admin` | Admin review queue (approve, reject, feature) |

Auth uses JWT in `localStorage` (`Authorization: Bearer`). Users sign in with GitHub at `/login`. Admins sign in with email/password at `/admin/login` (no signup). Configure GitHub OAuth in `server/config/config.env`; set admin passwords via `server/scripts/set-admin-password.js`.
