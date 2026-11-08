# Supabase setup

Apply SQL in the Supabase Dashboard → **SQL Editor**, one file at a time, in order.

## 1. Migrations (required)

| Order | File | Purpose |
| --- | --- | --- |
| 1 | `migrations/0001_init.sql` | Schema, helpers, RLS, triggers |
| 2 | `migrations/0002_security_hardening.sql` | Extra hardening |
| 3 | `migrations/0003_messaging_notifications_avatars.sql` | Messages, notifications, avatars Storage |
| 4 | `migrations/0004_create_or_get_dm.sql` | DM helper so supervisor ↔ intern chats open reliably |

Do not skip earlier files if they were never applied. Re-running is mostly idempotent (`IF NOT EXISTS` / `OR REPLACE` / `DROP POLICY IF EXISTS`).

## 2. Auth users (required for seed)

In **Authentication → Users → Add user**, create:

- `admin@inkdot.com`
- `jordan.peters@inkdot.com`
- `aisha.naidoo@inkdot.com`
- `nomsa.khumalo@inkdot.com`
- `thabo.molefe@inkdot.com`
- `lerato.dlamini@inkdot.com`
- `zanele.botha@inkdot.com`
- `ethan.jacobs@inkdot.com`

Use any passwords you control. New users get a `profiles` row via `handle_new_user` (always as `intern` until seed promotes roles).

## 3. Seed (optional demo data)

Run `seed.sql` after migrations + auth users. It:

- Promotes roles / fills profile fields
- Links supervisors, programmes, interns, tasks, logs, reviews
- Inserts sample notifications (needs `0003`)

## 4. Client env

In `client/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_or_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Service role is only for admin server actions (create/delete auth users). Never expose it in the browser.

## 5. Regenerating TypeScript types

Hand-maintained types live in `client/types/database.ts` (kept in sync with migrations).

If you use the Supabase CLI against your project:

```bash
cd client
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.ts
```

Then re-check that `createClient` generics still import `Database` from `@/types/database`.

## Smoke checklist

- [ ] Admin / supervisor / intern can sign in
- [ ] Tasks, logs, reviews load and mutate
- [ ] Messages drawer (intern ↔ supervisor)
- [ ] Notifications panel shows rows / marks read
- [ ] Avatar upload or stock avatar updates nav + account
