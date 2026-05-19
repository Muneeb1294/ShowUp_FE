# ShowUp Client

React + Vite frontend for the ShowUp API.

## Setup

```bash
cd client
npm install
```

Copy `.env.example` to `.env` and set `VITE_API_URL` to your API base URL (no trailing slash).

## Development

```bash
npm run dev
```

Opens at http://localhost:5173. API requests go to `VITE_API_URL` from `.env`.

## Routes

| Path | Description |
|------|-------------|
| `/` | Public project board (featured, pinned, all approved) |
| `/submit` | Submit a GitHub repo for review |
| `/admin` | Admin review queue (approve, reject, feature) |

Auth uses JWT in `localStorage` (`Authorization: Bearer`). Users sign in with GitHub at `/login`. Admins sign in with email/password at `/admin/login` (no signup). Configure GitHub OAuth in `server/config/config.env`; set admin passwords via `server/scripts/set-admin-password.js`.
