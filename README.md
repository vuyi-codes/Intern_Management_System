# Intern Management System

Monorepo for the InkDot internship platform.

## Structure

- `client/` — Next.js frontend (Supabase Auth + Postgres)
- `supabase/` — SQL migrations, seed, and setup notes

## Quick start

### Database

Follow [supabase/SUPABASE_SETUP.md](supabase/SUPABASE_SETUP.md): run migrations `0001` → `0002` → `0003` → `0004`, create auth users, then optionally `seed.sql`.

### Frontend

```bash
cd client
npm install
# add .env.local (see SUPABASE_SETUP.md)
npm run dev
```
