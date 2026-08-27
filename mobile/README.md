# Babylon Stars — Mobile App

Native mobile app (Expo / React Native) for Babylon Stars, synced with the same Supabase backend as the web app in the repo root. Covers both the talent portal and the full admin panel.

## Stack

- Expo SDK 57 + Expo Router (file-based routing, typed routes)
- React Native 0.86 / React 19
- Supabase JS client (`@supabase/supabase-js`) with `AsyncStorage` session persistence and PKCE auth
- `expo-image-picker` + `expo-av` for self-tape video capture/playback
- `lucide-react-native` for icons

## Setup

```bash
cd mobile
npm install
cp .env.example .env   # fill in the Supabase URL + anon key (same project as the web app)
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to run on a device, or press `i` / `a` for a simulator/emulator, or `w` for a quick web preview (web is for development convenience only — the shipped target is iOS/Android).

## Required Supabase configuration

The app uses talent magic-link auth via a custom URL scheme (`babylonstars://`), same mechanism as the web `/portal` but with a deep link instead of an HTTP redirect.

In the Supabase Dashboard → **Authentication → URL Configuration → Redirect URLs**, add:

```
babylonstars://
```

Without this, `supabase.auth.signInWithOtp` will send a magic-link email, but tapping it will not return the user to the app.

Admin/staff accounts use email + password and must have `app_metadata.role = "staff"` set (same requirement as the web app — see the root `README.md` for how to set this via the Supabase Dashboard or SQL). `user_metadata` does **not** work since it's user-editable and RLS policies gate on `app_metadata` only.

## App structure

- `app/login.tsx` — Talent (magic-link) / Ekipa (staff, password) tabs
- `app/(talent)/` — profile, projects (browse + apply + selfcast + slot booking), appointments, messages
- `app/(admin)/` — talents (list/search/filter + detail), briefs (create + proposals), calendar (appointments + open slot generation), messages
- `lib/supabase.ts` — Supabase client (AsyncStorage-backed session)
- `lib/auth-context.tsx` — session/role/talent-id state via React Context
- `lib/theme.ts` — shared color tokens and status label maps mirroring the web app's design system
- `components/ui/Primitives.tsx` — shared styled components (Card, Badge, GoldButton, Input, etc.)

## Known limitations

- This app was built and typechecked (`npx tsc --noEmit`) and verified in Expo's web preview mode in a sandboxed environment without access to a real iOS/Android device, simulator, or the live Supabase project (network egress is restricted there). It has **not** been run end-to-end against production data or tested on a physical device/simulator — please verify the full flows (magic-link deep link, image/video picker permissions, push-free notification-less messaging) yourself before shipping.
- No push notifications yet — messages and appointment updates require opening the app to see.
- No offline support — every screen fetches live from Supabase on focus.
