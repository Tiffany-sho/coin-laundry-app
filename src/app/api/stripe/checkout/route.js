import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { createServiceClient } from "@/utils/supabase/service";

export async function POST(request) {
  const { user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planKey } = await request.json();
  if (!["pro", "max"].includes(planKey)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: planInfo, error } = await getOrgPlan();
  if (error || !planInfo) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const priceId =
    planKey === "pro"
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_MAX_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const serviceSupabase = createServiceClient();
  let customerId = planInfo.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { org_id: planInfo.orgId },
    });
    customerId = customer.id;
    await serviceSupabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", planInfo.orgId);
  }

  const sessionParams = {
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/plan`,
    metadata: { org_id: planInfo.orgId },
  };

  if (planKey === "pro" && process.env.STRIPE_PRO_TRIAL_DAYS) {
    sessionParams.subscription_data = {
      trial_period_days: parseInt(process.env.STRIPE_PRO_TRIAL_DAYS, 10),
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return NextResponse.json({ url: session.url });
}
