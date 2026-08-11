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

## Structure

- `app/` — public marketing pages (`/`, `/talent-discovery`, `/for-productions`, `/projects`), the talent
  application form (`/apply`), and the admin panel (`/admin`).
- `components/layout/` — shared nav, footer, star logo/menu.
- `components/application-form/` — multi-step talent application (writes to `talent` + `talent-photos` storage).
- `components/admin/` — admin talent list/detail and briefs/proposals management (Supabase Auth-gated).
- `components/projects/` — public "Open projects" browsing + apply flow (`proposal.origin = 'talent'`).
- `lib/supabase/client.ts` — Supabase client (anon key from `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- `lib/i18n/` — SL/EN dictionary + context (no external i18n library).

## Known limitations (carried over from the schema/tech-plan)

- Talent authentication doesn't exist yet. On `/apply`, a talent gets a **Talent ID** (UUID) after
  submitting, which they must save and paste on `/projects` to apply to open briefs or see proposal
  status. This avoids exposing the talent list publicly, but it is not real auth — see
  `babylon-stars-schema.sql` and `babylon-stars-tech-plan.md` (point 7) for the planned magic-link flow.
- Admin brief creation (`components/admin/NewBriefForm.tsx`) is new — it wasn't in the original prototypes,
  which only had a non-functional "New brief" button.
- E-signature (Yousign), SMS/WhatsApp, and full talent auth are Phase 2, per `babylon-stars-tech-plan.md`.
