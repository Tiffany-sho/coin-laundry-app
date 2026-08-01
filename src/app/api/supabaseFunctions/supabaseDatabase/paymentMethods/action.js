"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";

/**
 * 組織ごとの支払方法（PayPay・クレジットカードなど）。
 *
 * ⚠️ **現金はこのテーブルに入れない。** 常に存在する暗黙の方法として扱い、
 *    現金額は `collect_funds.totalFunds − sum(cashless[].amount)` で出す。
 *    行として持つと「現金を無効化できてしまう」「二重に数える」の両方が起きる。
 *
 * ⚠️ **書き込みは必ず service client で行う。** 007 は payment_methods に
 *    SELECT のポリシーしか作っていない。利用者のクライアントで insert すると
 *    42501 で静かに失敗する（0 行更新の 200 ではなくエラーになるが、
 *    「権限がありません」としか出ないので原因を見失いやすい）。
 */

/** 名前の長さの上限。⚠️ 集金画面の入力欄に並ぶので長すぎると折り返す */
const MAX_NAME_LENGTH = 20;

/** 1 組織あたりの上限。⚠️ 集金画面に縦に並ぶので、増えるほど入力が重くなる */
const MAX_METHODS = 10;

async function getMyMembership() {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { data: member, error } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !member) return { error: { msg: "組織に所属していません", status: 403 } };
  return { user, member };
}

/**
 * 一覧。**無効にしたものも含めて返す**（設定画面で戻せるように）。
 * 集金画面は `is_active` で絞ること。
 */
export async function getPaymentMethods() {
  const { error, member } = await getMyMembership();
  if (error) return { error };

  const supabase = createServiceClient();
  const { data, error: queryError } = await supabase
    .from("payment_methods")
    .select("id, name, sort_order, is_active")
    .eq("org_id", member.org_id)
    // ⚠️ 並び順に一意な列を足す。sort_order は重複し得るので、それだけだと
    //    取得のたびに順番が変わって画面がちらつく
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (queryError) return { error: "支払方法の取得に失敗しました" };
  return { data: data ?? [] };
}

export async function createPaymentMethod(name) {
  const { error, member } = await getMyMembership();
  if (error) return { error };
  if (member.role !== "admin") {
    return { error: { msg: "支払方法を変更できるのは管理者だけです", status: 403 } };
  }

  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return { error: { msg: "支払方法の名前を入力してください", status: 400 } };
  if (trimmed.length > MAX_NAME_LENGTH) {
    return { error: { msg: `名前は ${MAX_NAME_LENGTH} 文字以内にしてください`, status: 400 } };
  }
  /*
    ⚠️ 「現金」という名前を作らせない。現金は暗黙の方法として別枠で数えているので、
       同名の行を作ると集金画面に「現金」が 2 つ並び、片方は総額に二重計上される。
  */
  if (trimmed === "現金") {
    return { error: { msg: "「現金」は既定で記録されるため追加できません", status: 400 } };
  }

  const supabase = createServiceClient();

  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("org_id", member.org_id);

  if ((count ?? 0) >= MAX_METHODS) {
    return { error: { msg: `支払方法は ${MAX_METHODS} 件までです`, status: 400 } };
  }

  const { data, error: insertError } = await supabase
    .from("payment_methods")
    .insert({ org_id: member.org_id, name: trimmed, sort_order: count ?? 0 })
    .select("id, name, sort_order, is_active")
    .single();

  // 23505 = UNIQUE(org_id, name)。無効にしたものと同じ名前を作ろうとした場合も含む
  if (insertError?.code === "23505") {
    return { error: { msg: "同じ名前の支払方法がすでにあります", status: 400 } };
  }
  if (insertError) return { error: "支払方法の追加に失敗しました" };
  return { data };
}

/**
 * 名前の変更と有効・無効の切り替え。
 *
 * ⚠️ **名前を変えても過去の集金の表示は変わらない。** `cashless` に
 *    その時点の名前を焼き込んであるため（`fundsArray` と同じ）。これは意図した挙動で、
 *    「あとから名前を変えたら過去の履歴の意味が変わる」のを防いでいる。
 */
export async function updatePaymentMethod(id, { name, isActive }) {
  const { error, member } = await getMyMembership();
  if (error) return { error };
  if (member.role !== "admin") {
    return { error: { msg: "支払方法を変更できるのは管理者だけです", status: 403 } };
  }

  const patch = {};

  if (name !== undefined) {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) return { error: { msg: "支払方法の名前を入力してください", status: 400 } };
    if (trimmed.length > MAX_NAME_LENGTH) {
      return { error: { msg: `名前は ${MAX_NAME_LENGTH} 文字以内にしてください`, status: 400 } };
    }
    if (trimmed === "現金") {
      return { error: { msg: "「現金」は既定で記録されるため使えません", status: 400 } };
    }
    patch.name = trimmed;
  }

  if (isActive !== undefined) patch.is_active = Boolean(isActive);

  if (Object.keys(patch).length === 0) {
    return { error: { msg: "変更する項目がありません", status: 400 } };
  }

  const supabase = createServiceClient();
  const { data, error: updateError } = await supabase
    .from("payment_methods")
    .update(patch)
    // ⚠️ org_id を必ず条件に入れる。id だけだと他組織の行を書き換えられる
    .eq("id", id)
    .eq("org_id", member.org_id)
    .select("id, name, sort_order, is_active");

  if (updateError?.code === "23505") {
    return { error: { msg: "同じ名前の支払方法がすでにあります", status: 400 } };
  }
  if (updateError) return { error: "支払方法の更新に失敗しました" };
  if (!data || data.length === 0) {
    return { error: { msg: "支払方法が見つかりません", status: 404 } };
  }
  return { data: data[0] };
}

/**
 * 「削除」。⚠️ **物理削除しない。**
 *
 * 過去の `collect_funds.cashless` が `methodId` で参照している。行を消しても
 * 名前は焼き込んであるので表示は壊れないが、**支払方法別の絞り込みで
 * 「どの方法か分からない金額」になる。** 無効化して一覧から外すだけにする。
 */
export async function deactivatePaymentMethod(id) {
  return await updatePaymentMethod(id, { isActive: false });
}
