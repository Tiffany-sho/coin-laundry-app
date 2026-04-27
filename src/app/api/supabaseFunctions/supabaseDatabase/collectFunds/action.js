"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";
import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";
import { getStores } from "../laundryStore/action";

async function getOrgStoreIds() {
  const { data: stores, error } = await getStores();
  if (error || !stores) return [];
  return stores.map((s) => s.id);
}

export const getFundsData = async (id) => {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { data: initialData, error: initialError } = await supabase
    .from("collect_funds")
    .select("*")
    .eq("laundryId", id);

  if (initialError) return { error: initialError };
  return { data: initialData };
};

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

  const { data, error } = await supabase
    .from("collect_funds")
    .insert({
      laundryId: formData.storeId,
      laundryName: formData.store,
      date: formData.date,
      fundsArray: formData.fundsArray,
      totalFunds: formData.totalFunds,
      collecter: user.id,
    })
    .select("laundryId,laundryName")
    .single();

  if (error) return { error: "集金データの登録に失敗しました" };
  return { data };
}

export async function updateData(fundsArray, totalFunds, id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { error } = await supabase
    .from("collect_funds")
    .update({ fundsArray, totalFunds })
    .eq("id", id)
    .eq("collecter", user.id);

  return { error };
}

export async function updateDate(date, id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .update({ date })
    .eq("id", id)
    .eq("collecter", user.id)
    .select("date")
    .single();

  if (error) return { error };
  return { data };
}

export async function deleteData(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("collect_funds").delete().eq("id", id);
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

  const { data, error } = await supabase
    .from("collect_funds")
    .select("date,totalFunds,laundryId")
    .in("laundryId", storeIds)
    .gt("date", epocYearBeforeMonth)
    .lt("date", epocYearAfterMonth);

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

  const { data, error } = await supabase
    .from("collect_funds")
    .select("totalFunds")
    .in("laundryId", storeIds)
    .gt("date", epocYearMonth)
    .lt("date", epocYearNextMonth);

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

  const { data, error } = await supabase
    .from("collect_funds")
    .select("totalFunds")
    .in("laundryId", storeIds)
    .gt("date", epocStart)
    .lt("date", epocEnd);

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}
