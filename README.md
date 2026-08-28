# Babylon Stars

Next.js (App Router) app for Babylon Stars — talent discovery & casting agency.
Backend: Supabase (`gsatusmewafhkkhbtawi`, eu-central-1).

## Getting started

```bash
cp .env.example .env.local   # fill in Supabase URL, anon key, and NEXT_PUBLIC_AGENCY_ID
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase Dashboard setup needed for magic-link login (`/portal`)

1. **Authentication → URL Configuration → Redirect URLs**: add `http://localhost:3000/portal` for local dev,
   and your production URL (e.g. `https://babylonstars.si/portal`) once deployed. Without this, the magic
   link email will redirect but Supabase will reject it.
2. **Authentication → Providers → Email**: confirm "Email OTP" / magic link is enabled (on by default).

### Required: add admin/staff accounts to their agency

The platform is multi-tenant (see "Multi-tenant platform" below): every "staff full access" RLS policy
checks both `role = "staff"` **and** `agency_id` on the user's **app metadata** (not user metadata — that's
user-editable), not just "is logged in" — a talent's `/portal` session is authenticated too, and without
this check they'd be able to read/write every other talent's (and every other agency's) data.

App metadata is **not** set by hand anymore — create the user (Authentication → Users → Add user), then add
them to their agency, and a DB trigger stamps `role`/`agency_id` onto their account automatically:

```sql
insert into agency_member (agency_id, user_id, role)
values (
  (select id from agency where slug = 'babylon-stars'),
  (select id from auth.users where email = 'admin@example.com'),
  'owner'  -- or 'admin' / 'member'
);
```

Do this for every admin account before they log into `/admin` — without it, `/admin` will look logged-in
but every query will come back empty (RLS silently filters everything out, which is the safe failure mode).
If their session was already open when you add them, they need to log out and back in (or the app needs to
call `supabase.auth.refreshSession()`) to pick up the new token claims.

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
such a brief shows the open slots; picking one claims it via the `claim_open_slot(p_slot_id, p_talent_id)`
SECURITY DEFINER RPC (not a plain client-side `UPDATE`), which does a guarded `UPDATE ... WHERE talent_id IS
NULL` inside the function — so two people can't book the same slot, and the caller doesn't need read access
to the slot's row after claiming it (a plain client-side update+select ran into an RLS/RETURNING gotcha
here; see the git history if curious). Whoever's claim lands first wins; the other gets `false` back and
picks again.

## Multi-tenant platform (Phase 0)

The schema now supports more than one agency, each fully isolated by RLS:

- `agency` / `agency_member` — the tenant and its staff. Staff RLS checks `agency_id = staff_agency_id()`,
  which reads the JWT's `app_metadata.agency_id` (stamped automatically when a row is added to
  `agency_member` — see above).
- `talent` is a **global profile** shared across every agency a person has applied to or been scouted by —
  it holds only identity/contact/portfolio fields. Per-agency CRM data (status, source, internal notes,
  whether the talent is marked shareable) lives in `agency_talent`, one row per (agency, talent) pair.
  Applying via `/apply` goes through the `apply_as_talent(...)` RPC, which looks up an existing global
  profile by email before creating a new one, so the same person applying to a second agency later reuses
  their profile instead of duplicating it.
- **Talent sharing / commission tracking**: an agency can mark its relationship with a talent
  `shareable_with_network = true`, making that talent visible to other agencies' staff (read-only) so they
  can propose them to their own briefs. `proposal.owning_agency_id` records which agency actually represents
  the talent (vs. `proposal.agency_id`, the brief's own agency) whenever those differ — that's the data a
  future billing/commission feature needs; Phase 0 only records it, it doesn't calculate or invoice anything.
- The public site and talent-facing flows (`/`, `/apply`, `/projects`, `/talent-discovery`,
  `/for-productions`) are still single-tenant — they're explicitly scoped to one agency via the
  `NEXT_PUBLIC_AGENCY_ID` (web) / `EXPO_PUBLIC_AGENCY_ID` (mobile) env var. Per-agency public pages are a
  follow-up phase, not built yet.

## Self-serve signup & billing (Phase 1)

New agencies register themselves at `/signup` (name + email + password → `create_agency_and_become_owner()`
RPC → 14-day free trial, no card required). `AdminPanel` checks the caller's own `agency` row on every
load: if the trial has expired or the subscription isn't `active`, it shows a billing gate instead of the
normal tabs (same check in the mobile admin layout). If someone is authenticated but isn't staff of any
agency yet (e.g. they had to confirm their email before a session existed), `AdminPanel` shows a short
"finish setting up your agency" form instead of an empty admin panel.

**Required setup before the Stripe part actually works** — none of this is needed for signup/trial/RLS,
only for taking payment:

1. Create a Stripe account (free) and grab a **test** `Secret key` from Developers → API keys.
2. Add three **server-only** env vars in Vercel (Project → Settings → Environment Variables) — never commit
   them, and they don't need the `NEXT_PUBLIC_` prefix since the Stripe routes run server-side
   (`app/api/stripe/*`):
   - `STRIPE_SECRET_KEY` — from step 1.
   - `STRIPE_MONTHLY_PRICE_EUR_CENTS` — the actual price to charge, e.g. `4900` for €49/month (defaults to
     that placeholder if unset — change it before going live).
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard → Settings → API. Used only by the webhook route
     (`app/api/stripe/webhook/route.ts`), which isn't acting as any logged-in user so it needs to bypass RLS
     to write the payment result back onto `agency`.
3. After deploying, add a webhook endpoint in the Stripe Dashboard pointing at
   `https://<your-domain>/api/stripe/webhook`, subscribed to `checkout.session.completed`,
   `customer.subscription.updated`, and `customer.subscription.deleted`. Copy the signing secret it gives you
   into `STRIPE_WEBHOOK_SECRET` (also server-only, in Vercel).
4. Test with Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.

This sandbox has no network access to `api.stripe.com` (same restriction as Supabase/Vercel), so the
checkout/webhook code is verified by review + types only, not run end-to-end — please test the actual
payment flow yourself once the keys above are in place.

## Known limitations (carried over from the schema/tech-plan)

- Document *content* (actual contract PDFs, e-signature) isn't built yet — `/portal` reads real
  `document` rows already, but nothing populates that table until the Yousign integration
  (`babylon-stars-tech-plan.md`, point 7) exists. Until then the "My documents" section is correctly empty.
- Admin brief creation (`components/admin/NewBriefForm.tsx`) is new — it wasn't in the original prototypes,
  which only had a non-functional "New brief" button.
- The "Pošlji casting brief" CTA on `/for-productions` is a `mailto:` link — there's no public brief-submission
  form anywhere in the original source material, so this wasn't ported, only kept as an honest placeholder.
- SMS/WhatsApp notifications and full e-signature are still Phase 2, per `babylon-stars-tech-plan.md`.
