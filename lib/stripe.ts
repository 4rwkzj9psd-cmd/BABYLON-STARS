import Stripe from "stripe";

// Server-only: never import this file from a "use client" component. STRIPE_SECRET_KEY has no
// NEXT_PUBLIC_ prefix, so it's unavailable in the browser bundle by design.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Placeholder price -- adjust in Vercel env vars before going live. Not a secret.
export const MONTHLY_PRICE_EUR_CENTS = Number(process.env.STRIPE_MONTHLY_PRICE_EUR_CENTS ?? "4900");
