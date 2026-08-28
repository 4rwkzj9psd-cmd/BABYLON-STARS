import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseForToken } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!accessToken) return NextResponse.json({ error: "Missing access token" }, { status: 401 });

  const supabase = supabaseForToken(accessToken);
  const { data: agency, error } = await supabase.from("agency").select("id,stripe_customer_id").single();
  if (error || !agency?.stripe_customer_id) {
    return NextResponse.json({ error: "No active subscription for this agency" }, { status: 403 });
  }

  const origin = req.headers.get("origin") ?? req.nextUrl.origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: agency.stripe_customer_id,
    return_url: `${origin}/admin`,
  });

  return NextResponse.json({ url: session.url });
}
