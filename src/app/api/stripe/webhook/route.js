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
        plan_source: "stripe",
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
          plan_source: null,
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
          plan_source: "stripe",
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
        plan_source: null,
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

/*
  ⚠️ **プランを足したらここにも足す。** 落とすと、購入も更新も成功しているのに
     `free` として記録される（`return "free"` に落ちる）。決済は通っているので
     エラーもログも出ず、利用者からは「払ったのに使えない」という形で届く。
  ⚠️ 環境変数が未設定だと `undefined === undefined` で**全部その行に当たる。**
     価格 ID が空のものは先に弾く。
*/
function getPlanFromPriceId(priceId) {
  if (!priceId) return "free";
  const byPrice = [
    [process.env.STRIPE_PRO_PRICE_ID, "pro"],
    [process.env.STRIPE_PROPLUS_PRICE_ID, "proplus"],
    [process.env.STRIPE_MAX_PRICE_ID, "max"],
  ];
  for (const [id, plan] of byPrice) {
    if (id && id === priceId) return plan;
  }
  return "free";
}
