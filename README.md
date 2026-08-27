# Babylon Stars

Next.js (App Router) app for Babylon Stars — talent discovery & casting agency.
Backend: Supabase (`gsatusmewafhkkhbtawi`, eu-central-1).

## Getting started

```bash
cp .env.example .env.local   # fill in Supabase URL + anon key
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase Dashboard setup needed for magic-link login (`/portal`)

1. **Authentication → URL Configuration → Redirect URLs**: add `http://localhost:3000/portal` for local dev,
   and your production URL (e.g. `https://babylonstars.si/portal`) once deployed. Without this, the magic
   link email will redirect but Supabase will reject it.
2. **Authentication → Providers → Email**: confirm "Email OTP" / magic link is enabled (on by default).

### Required: mark admin/staff accounts

Every admin user (created via Authentication → Users → Add user) **must** have `{"role": "staff"}` set on
their **app metadata** (not user metadata — that's user-editable). All "staff full access" RLS policies
check this (`is_staff()` in the DB), not just "is logged in" — a talent's `/portal` session is authenticated
too, and without this check they'd be able to read/write every other talent's data. Set it via:

```sql
update auth.users set raw_app_meta_data =
  raw_app_meta_data || '{"role":"staff"}'::jsonb
where email = 'admin@example.com';
```

or in the dashboard: Authentication → Users → (user) → edit raw app metadata. Do this for every admin
account before they log into `/admin` — without it, `/admin` will look logged-in but every query will
come back empty (RLS silently filters everything out, which is the safe failure mode).

## Structure

- `app/` — public marketing pages (`/`, `/talent-discovery`, `/for-productions`, `/projects`), the talent
  application form (`/apply`), the talent portal (`/portal`), and the admin panel (`/admin`).
- `components/layout/` — shared nav, footer, star logo/menu.
- `components/application-form/` — multi-step talent application (writes to `talent` + `talent-photos` storage).
- `components/admin/` — admin talent list/detail and briefs/proposals management (Supabase Auth-gated).
- `components/projects/` — public "Open projects" browsing + apply flow (`proposal.origin = 'talent'`).
- `components/portal/` — talent-facing portal: magic-link sign-in, own profile/applications/documents.
- `lib/supabase/client.ts` — Supabase client (anon key from `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- `lib/i18n/` — SL/EN dictionary + context (no external i18n library).

## Talent identity: two paths, on purpose

- **Talent ID** (shown once after submitting `/apply`) — a fast, no-signup way to apply to open projects
  and check status on `/projects`. Good enough for a bearer-token-style "apply" action, not meant to gate
  anything sensitive.
- **`/portal` magic-link login** — real Supabase Auth identity (email OTP). First login auto-claims the
  `talent` row matching the verified email (`talent.user_id`). This is what gates anything that shouldn't
  be reachable by a guessed/leaked ID: the talent's own proposals across *all* briefs (not just public
  ones) and their documents/contracts (`document` table, RLS-scoped to `user_id = auth.uid()`).

## Casting mode & audition slots

Each brief has a `casting_mode`: `selfcast` (default), `audition`, or `both`. Admin sets it in
`NewBriefForm`. For briefs needing an audition, admin generates open slots (`AppointmentsView` → "Generate
open slots" — a start time + duration + count, all with `talent_id = null`). On `/projects`, applying to
such a brief shows the open slots; picking one claims it via a guarded `UPDATE ... WHERE talent_id IS NULL`
(RLS enforces the guard too), so two people can't book the same slot — whoever's update lands first wins,
the other sees "that slot was just taken" and picks again.

## Known limitations (carried over from the schema/tech-plan)

- Document *content* (actual contract PDFs, e-signature) isn't built yet — `/portal` reads real
  `document` rows already, but nothing populates that table until the Yousign integration
  (`babylon-stars-tech-plan.md`, point 7) exists. Until then the "My documents" section is correctly empty.
- Admin brief creation (`components/admin/NewBriefForm.tsx`) is new — it wasn't in the original prototypes,
  which only had a non-functional "New brief" button.
- The "Pošlji casting brief" CTA on `/for-productions` is a `mailto:` link — there's no public brief-submission
  form anywhere in the original source material, so this wasn't ported, only kept as an honest placeholder.
- SMS/WhatsApp notifications and full e-signature are still Phase 2, per `babylon-stars-tech-plan.md`.
