import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";
import { createServiceClient } from "@/utils/supabase/service";

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }

  const serviceSupabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orgId = session.metadata?.org_id;
    if (!orgId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    );
    const planKey = getPlanFromPriceId(
      subscription.items.data[0].price.id
    );
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;

    await serviceSupabase
      .from("organizations")
      .update({
        plan: planKey,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEnd,
      })
      .eq("id", orgId);
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const orgId = await getOrgIdFromCustomer(
      serviceSupabase,
      subscription.customer
    );
    if (!orgId) return NextResponse.json({ received: true });

    if (["past_due", "canceled", "unpaid"].includes(subscription.status)) {
      await serviceSupabase
        .from("organizations")
        .update({
          plan: "free",
          stripe_subscription_id: null,
          trial_ends_at: null,
        })
        .eq("id", orgId);
    } else {
      const planKey = getPlanFromPriceId(
        subscription.items.data[0].price.id
      );
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;

      await serviceSupabase
        .from("organizations")
        .update({
          plan: planKey,
          stripe_subscription_id: subscription.id,
          trial_ends_at: trialEnd,
        })
        .eq("id", orgId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const orgId = await getOrgIdFromCustomer(
      serviceSupabase,
      subscription.customer
    );
    if (!orgId) return NextResponse.json({ received: true });

    await serviceSupabase
      .from("organizations")
      .update({
        plan: "free",
        stripe_subscription_id: null,
        trial_ends_at: null,
      })
      .eq("id", orgId);
  }

  return NextResponse.json({ received: true });
}

async function getOrgIdFromCustomer(supabase, customerId) {
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.id ?? null;
}

function getPlanFromPriceId(priceId) {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_MAX_PRICE_ID) return "max";
  return "free";
}
