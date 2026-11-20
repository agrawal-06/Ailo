# Ailo API — Phase 2

A local-development-only Express REST API backed by Neon PostgreSQL.

## Setup
1. Create a Neon database.
2. Run `sql/001_init.sql` in the Neon SQL editor.
3. In `backend/`, copy `.env.example` to `.env`, then set `DATABASE_URL` to your Neon connection string.
4. Run `npm install`, then `npm run dev`.
5. Visit http://127.0.0.1:4000/health to confirm database connectivity.

## Routes
- `GET /health`
- `GET /api/occasions`
- `POST /api/occasions` (JSON: name, kind, day, month, custom, first, second, secondEnabled)
- `DELETE /api/occasions/:id`

## Security / limitations
**Do not deploy this API publicly yet.** It deliberately binds to localhost and has no authentication, ownership model, or rate limiting. All rows share one development database. Never store production personal occasions here until user authentication and per-user authorization are implemented.

The mobile app currently uses AsyncStorage and is **not connected** to these endpoints. No calls or scheduled jobs are triggered by this API.
