import { NextRequest, NextResponse } from "next/server";
import { stripe, MONTHLY_PRICE_EUR_CENTS } from "@/lib/stripe";
import { supabaseForToken } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!accessToken) return NextResponse.json({ error: "Missing access token" }, { status: 401 });

  const supabase = supabaseForToken(accessToken);
  const { data: agency, error } = await supabase.from("agency").select("id,name,stripe_customer_id").single();
  if (error || !agency) return NextResponse.json({ error: "No agency found for this account" }, { status: 403 });

  const origin = req.headers.get("origin") ?? req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: agency.id,
    customer: agency.stripe_customer_id ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "eur",
          recurring: { interval: "month" },
          unit_amount: MONTHLY_PRICE_EUR_CENTS,
          product_data: { name: `Babylon Stars platforma — ${agency.name}` },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/admin?checkout=success`,
    cancel_url: `${origin}/admin?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
