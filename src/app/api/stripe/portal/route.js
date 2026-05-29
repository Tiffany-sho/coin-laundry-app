import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export async function POST() {
  const { user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: planInfo, error } = await getOrgPlan();
  if (error || !planInfo) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
  if (planInfo.myRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!planInfo.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
  }

  let session;
  try {
    session = await stripe.billingPortal.sessions.create({
      customer: planInfo.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
