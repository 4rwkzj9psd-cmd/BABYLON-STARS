import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Used inside Stripe route handlers: the client sends its own current access token, and we
// create a request-scoped client with it so every query still goes through RLS as that user --
// no service-role key needed here (only the webhook route, which isn't acting as any user, needs that).
export function supabaseForToken(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}

// Service-role client: bypasses RLS entirely. Only ever used by the Stripe webhook handler,
// which has no authenticated user to act as. SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_
// prefix -- it must never be imported from a "use client" component.
export function supabaseServiceRole() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
