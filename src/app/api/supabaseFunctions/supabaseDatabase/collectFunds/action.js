"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";
import { changeEpocFromNowYearMonth, getEpochTimeInSeconds } from "@/functions/makeDate/date";
import { applyDateRange, END_INCLUSIVE } from "@/functions/dateRange";
import { getStores } from "../laundryStore/action";

async function getOrgStoreIds() {
  const { data: stores, error } = await getStores();
  if (error || !stores) return [];
  return stores.map((s) => s.id);
}

export async function hasStoreFunds(id) {
  const { user } = await getUser();
  if (!user) return { has: false };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { has: false };

  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from("collect_funds")
    .select("id", { count: "exact", head: true })
    .eq("laundryId", id);

  if (error) return { has: false };
  return { has: (count ?? 0) > 0 };
}

export const getFundsData = async (id) => {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { error: { msg: "アクセス権限がありません", status: 403 } };

  const supabase = createServiceClient();
  const { data: initialData, error: initialError } = await supabase
    .from("collect_funds")
    .select("*")
    .eq("laundryId", id);

  if (initialError) return { error: initialError };
  return { data: initialData };
};

// 店舗のチャート用全集金データ取得（期間フィルタ付き、RLS回避）
export async function getStoreFundsForChart(id, startEpoch, endEpoch) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  // startEpoch は月初、endEpoch は翌月初（期間スライダー由来）
  const query = applyDateRange(
    supabase
      .from("collect_funds")
      .select("date, totalFunds, laundryId")
      .eq("laundryId", id)
      .order("date", { ascending: true }),
    startEpoch,
    endEpoch
  );

  const { data, error } = await query;
  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 店舗の集金データ取得（全期間・ページネーション付き、RLS回避）
// 管理者・集金担当者・閲覧者全員が参照可能
export async function getStoreFundsPaginated(id, orderAmount, upOrder, from, to) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .select("id, laundryId, laundryName, date, totalFunds, collecter, profiles!collect_funds_collecter_fkey(username)")
    .eq("laundryId", id)
    .order(orderAmount, { ascending: upOrder })
    .range(from, to);

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 店舗の集金データ取得（期間指定・全件、RLS回避）
export async function getStoreFundsInPeriod(id, startEpoch, endEpoch, orderAmount, upOrder) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  const query = applyDateRange(
    supabase
      .from("collect_funds")
      .select("id, laundryId, laundryName, date, totalFunds, collecter, profiles!collect_funds_collecter_fkey(username)")
      .eq("laundryId", id)
      .order(orderAmount, { ascending: upOrder }),
    startEpoch,
    endEpoch
  );

  const { data, error } = await query;
  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org全体の集金データ取得（期間指定・全件、RLS回避）
export async function getOrgCollectFundsInPeriod(startEpoch, endEpoch, orderAmount, upOrder) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = createServiceClient();
  const query = applyDateRange(
    supabase
      .from("collect_funds")
      .select("id, laundryId, laundryName, date, totalFunds, collecter, profiles!collect_funds_collecter_fkey(username)")
      .in("laundryId", storeIds)
      .order(orderAmount, { ascending: upOrder }),
    startEpoch,
    endEpoch
  );

  const { data, error } = await query;
  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 単一集金レコードのfundsArrayをon-demand取得
export async function getFundItemById(id) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .select("fundsArray")
    .eq("id", id)
    .in("laundryId", storeIds)
    .single();

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

export async function createData(formData) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role === "viewer") {
    return { error: "集金データを登録する権限がありません" };
  }

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(formData.storeId)) {
    return { error: "指定された店舗へのアクセス権限がありません" };
  }

  const serviceSupabase = createServiceClient();

  const row = {
    laundryId: formData.storeId,
    laundryName: formData.store,
    date: formData.date,
    fundsArray: formData.fundsArray,
    totalFunds: formData.totalFunds,
    collecter: user.id,
  };

  // モバイルのみ冪等性キーを送ってくる。Web は未指定なので NULL のまま（部分ユニークの対象外）
  if (formData.clientRequestId) row.client_request_id = formData.clientRequestId;

  const { data, error } = await serviceSupabase
    .from("collect_funds")
    .insert(row)
    .select("id,laundryId,laundryName")
    .single();

  if (error) {
    // 23505 = 一意制約違反。オフライン再送で同じキーが 2 回届いた場合なので
    // エラーにせず、既に入っているレコードを返して成功扱いにする（二重計上の防止）
    if (error.code === "23505" && formData.clientRequestId) {
      const { data: existing } = await serviceSupabase
        .from("collect_funds")
        .select("id,laundryId,laundryName")
        .eq("client_request_id", formData.clientRequestId)
        .single();

      if (existing) return { data: existing, duplicated: true };
    }
    return { error: "集金データの登録に失敗しました" };
  }
  return { data };
}

export async function updateData(fundsArray, totalFunds, id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role === "viewer") {
    return { error: { msg: "集金データを編集する権限がありません", status: 403 } };
  }

  const storeIds = await getOrgStoreIds();
  const serviceSupabase = createServiceClient();

  const { data: target } = await serviceSupabase
    .from("collect_funds")
    .select("laundryId")
    .eq("id", id)
    .single();

  if (!target || !storeIds.includes(target.laundryId)) {
    return { error: { msg: "アクセス権限がありません", status: 403 } };
  }

  let query = serviceSupabase
    .from("collect_funds")
    .update({ fundsArray, totalFunds })
    .eq("id", id)
    .select("id");
  if (member.role !== "admin") {
    query = query.eq("collecter", user.id);
  }

  const { error } = await query;
  return { error };
}

export async function updateDate(date, id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role === "viewer") {
    return { error: { msg: "集金データを編集する権限がありません", status: 403 } };
  }

  const storeIds = await getOrgStoreIds();
  const serviceSupabase = createServiceClient();

  const { data: target } = await serviceSupabase
    .from("collect_funds")
    .select("laundryId")
    .eq("id", id)
    .single();

  if (!target || !storeIds.includes(target.laundryId)) {
    return { error: { msg: "アクセス権限がありません", status: 403 } };
  }

  let dateQuery = serviceSupabase
    .from("collect_funds")
    .update({ date })
    .eq("id", id);
  if (member.role !== "admin") {
    dateQuery = dateQuery.eq("collecter", user.id);
  }
  const { data, error } = await dateQuery.select("date").single();

  if (error) return { error };
  return { data };
}

export async function deleteData(id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role === "viewer") {
    return { error: { msg: "集金データを削除する権限がありません", status: 403 } };
  }

  const storeIds = await getOrgStoreIds();
  const serviceSupabase = createServiceClient();

  const { data: target } = await serviceSupabase
    .from("collect_funds")
    .select("laundryId")
    .eq("id", id)
    .single();

  if (!target || !storeIds.includes(target.laundryId)) {
    return { error: { msg: "アクセス権限がありません", status: 403 } };
  }

  let query = serviceSupabase.from("collect_funds").delete().eq("id", id);
  if (member.role !== "admin") {
    query = query.eq("collecter", user.id);
  }

  const { error } = await query;
  return { error };
}

export async function getAllMonthBenefits() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = await createClient();
  const epocYearBeforeMonth = changeEpocFromNowYearMonth(-1);
  const epocYearAfterMonth = changeEpocFromNowYearMonth(1);

  const { data, error } = await applyDateRange(
    supabase
      .from("collect_funds")
      .select("date,totalFunds,laundryId")
      .in("laundryId", storeIds),
    epocYearBeforeMonth,
    epocYearAfterMonth
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org 全体の集金データ一覧（RLS回避：サービスクライアント使用）
export async function getOrgCollectFunds(startEpoch, endEpoch) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = createServiceClient();
  // startEpoch は月初、endEpoch は翌月初（期間スライダー由来）
  const query = applyDateRange(
    supabase
      .from("collect_funds")
      .select("date, totalFunds, laundryId, laundryName")
      .in("laundryId", storeIds)
      .order("date", { ascending: true }),
    startEpoch,
    endEpoch
  );

  const { data, error } = await query;
  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// ホーム用：org全体の最新N件
export async function getRecentCollectFunds() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .select("id, laundryName, date, totalFunds, profiles!collect_funds_collecter_fkey(username)")
    .in("laundryId", storeIds)
    .gte("date", thirtyDaysAgo)
    .order("date", { ascending: false })
    .limit(30);

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org 全体の集金データ（過去2か月・ページネーション付き）
export async function getOrgCollectFundsPaginated(orderAmount, upOrder, from, to) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const startEpoch = changeEpocFromNowYearMonth(-2);

  const supabase = createServiceClient();
  const { data, error } = await applyDateRange(
    supabase
      .from("collect_funds")
      .select("id, laundryId, laundryName, date, totalFunds, collecter, profiles!collect_funds_collecter_fkey(username)")
      .in("laundryId", storeIds),
    startEpoch,
    null
  )
    .order(orderAmount, { ascending: upOrder })
    .range(from, to);

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// CSV エクスポート用：org 全体の集金データ全件（ページネーションなし）
// filterStoreIds: 指定した場合、org store IDs との積集合で絞り込む（セキュリティ保証）
export async function getCollectFundsForExport(startEpoch, endEpoch, filterStoreIds = null) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const orgStoreIds = await getOrgStoreIds();
  if (orgStoreIds.length === 0) return { data: [] };

  const effectiveStoreIds = filterStoreIds
    ? orgStoreIds.filter((id) => filterStoreIds.includes(id))
    : orgStoreIds;
  if (effectiveStoreIds.length === 0) return { data: [] };

  const supabase = createServiceClient();
  // エクスポート画面の startEpoch / endEpoch は「選択した開始日・終了日」そのもの。
  // 終了日当日のデータも出力に含める必要があるため endMode は inclusive。
  const query = applyDateRange(
    supabase
      .from("collect_funds")
      .select("date, totalFunds, laundryName, fundsArray, profiles!collect_funds_collecter_fkey(username)")
      .in("laundryId", effectiveStoreIds)
      .order("date", { ascending: true }),
    startEpoch,
    endEpoch,
    { endMode: END_INCLUSIVE }
  );

  const { data, error } = await query;
  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org 全体の当月集金合計（ホーム画面用）
export async function getMonthFunds() {
  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = await createClient();
  const epocYearMonth = changeEpocFromNowYearMonth(0);
  const epocYearNextMonth = changeEpocFromNowYearMonth(1);

  const { data, error } = await applyDateRange(
    supabase.from("collect_funds").select("totalFunds").in("laundryId", storeIds),
    epocYearMonth,
    epocYearNextMonth
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 月次サマリー用：過去2年分の date, totalFunds のみ取得（fundsArray 除外で軽量）
// storeId 指定時はその店舗のみ、null の場合は org 全体
export async function getCollectMonthlySummary(storeId = null) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const orgStoreIds = await getOrgStoreIds();
  if (orgStoreIds.length === 0) return { data: [] };

  let targetIds;
  if (storeId) {
    if (!orgStoreIds.includes(storeId)) return { error: "アクセス権限がありません" };
    targetIds = [storeId];
  } else {
    targetIds = orgStoreIds;
  }

  // 前年同月比のため過去2年分を取得。
  // レコードは深夜0時ちょうどなので、cutoff にも時刻を残すとその月の1日が欠ける。
  // 月初0時ちょうどに正規化してから範囲に含める。
  const now = new Date();
  const cutoffEpoch = getEpochTimeInSeconds(now.getFullYear() - 2, now.getMonth() + 1, 1);

  const supabase = createServiceClient();
  const { data, error } = await applyDateRange(
    supabase.from("collect_funds").select("date, totalFunds, laundryId").in("laundryId", targetIds),
    cutoffEpoch,
    null
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 全期間の店舗別売上合計用：totalFunds, laundryName, laundryId を全件取得（fundsArray 除外）
export async function getStoreRevenueSummary() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const orgStoreIds = await getOrgStoreIds();
  if (orgStoreIds.length === 0) return { data: [] };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .select("totalFunds, laundryName, laundryId")
    .in("laundryId", orgStoreIds);

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org 全体の指定月集金合計（ホーム画面グラフ用）
export async function getMonthFundsByOffset(monthOffset) {
  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = await createClient();
  const epocStart = changeEpocFromNowYearMonth(monthOffset);
  const epocEnd = changeEpocFromNowYearMonth(monthOffset + 1);

  const { data, error } = await applyDateRange(
    supabase.from("collect_funds").select("totalFunds").in("laundryId", storeIds),
    epocStart,
    epocEnd
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}
