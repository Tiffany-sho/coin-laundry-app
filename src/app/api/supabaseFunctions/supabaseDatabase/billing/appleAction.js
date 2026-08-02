"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";
import { PLAN_BY_PRODUCT_ID, isAppleSubscriptionActive } from "@/functions/applePlans";

/**
 * 検証済みの App Store トランザクションを organizations に反映する。
 *
 * ここに来る transaction は**必ず `utils/apple/verify.js` を通したもの**。
 * 生のリクエストボディを渡さないこと。
 */

/**
 * この取引が**無料トライアル中**か。
 *
 * ⚠️ **`offerType` だけで判断しない。** 導入オファーには「初回だけ割引」
 *    （PAY_AS_YOU_GO / PAY_UP_FRONT）もあり、課金が発生しているのに
 *    「無料期間」と表示することになる。`offerDiscountType` があればそちらが正。
 *
 * ⚠️ **`offerDiscountType` は古い payload に無い。** App Store Server API の
 *    後から足されたフィールドなので、無いときは `offerType === 1`（導入オファー）に
 *    倒す。今のところ導入オファーは無料トライアルしか設定していないので実害は無いが、
 *    **有料の導入オファーを作るなら、ここが誤判定になる。**
 */
function isFreeTrial(transaction) {
  if (transaction.offerDiscountType) {
    return transaction.offerDiscountType === "FREE_TRIAL";
  }
  return transaction.offerType === 1;
}

/** 検証済みトランザクションから、DB に書く形へ落とす */
function toPlanPatch(transaction) {
  const plan = PLAN_BY_PRODUCT_ID[transaction.productId];
  if (!plan) return null;

  // 返金・家族共有の解除などで失効している場合は revocationDate が入る
  const revoked = Boolean(transaction.revocationDate);
  const active = !revoked && isAppleSubscriptionActive(transaction.expiresDate);

  const expiresAt = transaction.expiresDate
    ? new Date(transaction.expiresDate).toISOString()
    : null;

  return {
    plan: active ? plan : "free",
    plan_source: active ? "apple" : null,
    apple_original_transaction_id: transaction.originalTransactionId,
    apple_product_id: transaction.productId,
    apple_expires_at: expiresAt,
    apple_environment: transaction.environment ?? null,
    /*
      無料トライアルの終わり = この取引の失効日。

      ⚠️ **トライアルでないときは必ず null に戻す。** 残したままにすると、
         有料へ切り替わったあとも設定画面が「無料期間 ◯◯まで」を出し続ける
         （更新のたびに新しい取引が来るので、上書きしないと古い日付が残る）。
      ⚠️ 失効時（active=false）も null。**プランは free に落ちているのに
         無料期間だけ表示される**のを防ぐ。
    */
    trial_ends_at: active && isFreeTrial(transaction) ? expiresAt : null,
    active,
  };
}

/**
 * アプリからの購入 / 復元を反映する。
 *
 * ⚠️ Apple のサブスクは Apple ID に紐づくが、Collecie のプランは**組織単位**。
 *    誰の購入がどの組織に効くのかを決めるのはこの関数だけなので、
 *    admin 以外が呼んでも通らないようにしてある。
 */
export async function applyAppleTransaction(transaction) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (memberError || !member) return { error: "組織に所属していません" };
  if (member.role !== "admin") {
    return { error: "プランを変更できるのは管理者だけです", status: 403 };
  }

  const patch = toPlanPatch(transaction);
  if (!patch) {
    // App Store Connect の商品 ID と applePlans.js がずれているとここに来る
    console.error("[apple] unknown productId", transaction.productId);
    return { error: "未知の商品です", status: 400 };
  }

  const serviceSupabase = createServiceClient();

  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .select("id, plan, plan_source, stripe_subscription_id, apple_original_transaction_id")
    .eq("id", member.org_id)
    .single();

  if (orgError || !org) return { error: "組織情報の取得に失敗しました" };

  // ⚠️ Stripe と Apple の二重契約を作らない。どちらか一方だけが生きている状態を保つ。
  //    ここを通すと利用者が両方から引き落とされ、返金対応が必要になる。
  if (org.stripe_subscription_id && patch.active) {
    return {
      error: "この組織にはすでに有効なプランがあります",
      status: 409,
    };
  }

  // 1 つの購読を組織間で使い回されるのを防ぐ
  const { data: bound } = await serviceSupabase
    .from("organizations")
    .select("id")
    .eq("apple_original_transaction_id", patch.apple_original_transaction_id)
    .maybeSingle();

  if (bound && bound.id !== org.id) {
    return {
      error: "この購読はすでに別の組織で使われています",
      status: 409,
    };
  }

  const { active, ...columns } = patch;
  const { error: updateError } = await serviceSupabase
    .from("organizations")
    .update(columns)
    .eq("id", org.id);

  if (updateError) {
    console.error("[apple] org update failed", updateError);
    return { error: "プランの反映に失敗しました", status: 500 };
  }

  return {
    data: {
      plan: columns.plan,
      planSource: columns.plan_source,
      productId: columns.apple_product_id,
      expiresAt: columns.apple_expires_at,
      active,
    },
  };
}

/**
 * App Store Server Notifications V2 からの反映。
 *
 * 通知にはユーザーの文脈が無いので、original_transaction_id から組織を引く。
 * 紐付いていない購読の通知は**握って 200 を返す**（Apple に再送させても
 * 状況は変わらないため）。
 */
export async function applyAppleNotification({ transaction, notification }) {
  const patch = toPlanPatch(transaction);
  if (!patch) {
    console.error("[apple] notification: unknown productId", transaction.productId);
    return { data: { handled: false, reason: "unknown_product" } };
  }

  const { active, ...columns } = patch;
  const serviceSupabase = createServiceClient();

  let { data: org } = await serviceSupabase
    .from("organizations")
    .select("id, stripe_subscription_id")
    .eq("apple_original_transaction_id", columns.apple_original_transaction_id)
    .maybeSingle();

  // 初回購入の通知は verify より先に届くことがある。その時点ではまだ
  // apple_original_transaction_id が入っていないので引けない。
  // アプリが購入時に appAccountToken へ組織 ID を載せているので、そちらで引く。
  if (!org && transaction.appAccountToken) {
    const { data: byToken } = await serviceSupabase
      .from("organizations")
      .select("id, stripe_subscription_id")
      .eq("id", transaction.appAccountToken)
      .maybeSingle();
    org = byToken ?? null;
  }

  if (!org) {
    return { data: { handled: false, reason: "org_not_linked" } };
  }

  // ⚠️ Stripe 契約が生きている組織に Apple の課金を被せない。
  //    appAccountToken 経由で引いたときにここを通る可能性がある。
  if (org.stripe_subscription_id && active) {
    console.error("[apple] refusing to overwrite stripe plan", org.id);
    return { data: { handled: false, reason: "stripe_active" } };
  }

  // 失効したときも apple_* は残す（履歴として追える）。plan だけ free に落とす
  const { error: updateError } = await serviceSupabase
    .from("organizations")
    .update(columns)
    .eq("id", org.id);

  if (updateError) {
    console.error("[apple] notification update failed", updateError);
    // ここで 500 を返すと Apple が再送してくれる
    return { error: "プランの反映に失敗しました", status: 500 };
  }

  await serviceSupabase
    .from("apple_notifications")
    .update({
      org_id: org.id,
      original_transaction_id: columns.apple_original_transaction_id,
    })
    .eq("notification_uuid", notification.notificationUUID);

  return { data: { handled: true, orgId: org.id, plan: columns.plan, active } };
}

/**
 * 通知の受信記録。同じ notificationUUID を 2 回処理しないための入口。
 *
 * ⚠️ Apple は 2xx を受け取れないと同じ通知を再送する（最大 5 回・3 時間）。
 *    記録が無いと、返金 → 再購入 のような順序が入れ替わったときに
 *    古い状態で上書きされる。
 *
 * @returns {{ isNew: boolean }} 既に処理済みなら isNew: false
 */
export async function recordAppleNotification(notification) {
  const serviceSupabase = createServiceClient();

  // original_transaction_id は署名済みの取引を開くまで分からない。
  // ここでは NULL で入れ、applyAppleNotification が後から埋める
  const { error } = await serviceSupabase.from("apple_notifications").insert({
    notification_uuid: notification.notificationUUID,
    notification_type: notification.notificationType ?? null,
    subtype: notification.subtype ?? null,
    payload: {
      notificationType: notification.notificationType ?? null,
      subtype: notification.subtype ?? null,
      version: notification.version ?? null,
      signedDate: notification.signedDate ?? null,
    },
  });

  // 主キー重複 = 再送。処理済みなので握る
  if (error?.code === "23505") return { isNew: false };
  if (error) {
    console.error("[apple] notification record failed", error);
    // 記録できないなら処理も進めない（再送に任せる）
    return { isNew: false, error: "通知の記録に失敗しました" };
  }

  return { isNew: true };
}
