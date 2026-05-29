"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";
import { getStores } from "../laundryStore/action";

async function getMyRole(supabase, userId) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data.role;
}

async function getOrgStoreIds() {
  const { data: stores, error } = await getStores();
  if (error || !stores) return [];
  return stores.map((s) => s.id);
}

export async function getAllLaundryStates() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("*")
    .in("laundryId", storeIds);

  if (error) return { error: "店舗状態の取得に失敗しました" };
  return { data };
}

export async function getLaundryState(laundryId) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("*")
    .eq("laundryId", laundryId)
    .single();

  if (error) return { error: "店舗状態の取得に失敗しました" };
  return { data };
}

export async function getMachinesStates() {
  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [], breakMachines: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("machines,laundryId,laundryName")
    .in("laundryId", storeIds);

  if (error) return { error: "設備状況の取得に失敗しました" };

  const breakMachines = data.filter((item) =>
    item.machines.some((machine) => machine.break)
  );
  return { data, breakMachines };
}

export async function updateMachinesState(laundryId, machines) {
  const { user } = await getUser();
  if (!user) return { error: "ユーザーが認証されていません。" };

  const supabase = await createClient();
  const role = await getMyRole(supabase, user.id);
  if (!role || role === "viewer") return { error: "設備状態を編集する権限がありません。" };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(laundryId)) return { error: "アクセス権限がありません。" };

  const { error } = await supabase
    .from("laundry_state")
    .update({ machines })
    .eq("laundryId", laundryId);

  if (error) return { error };
  return {};
}

export async function updateStockState(laundryId, { detergent, softener, extra_stocks, stock_thresholds }) {
  const { user } = await getUser();
  if (!user) return { error: "ユーザーが認証されていません。" };

  const supabase = await createClient();
  const role = await getMyRole(supabase, user.id);
  if (!role || role === "viewer") return { error: "在庫状態を編集する権限がありません。" };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(laundryId)) return { error: "アクセス権限がありません。" };

  const { error } = await supabase
    .from("laundry_state")
    .update({
      detergent,
      softener,
      extra_stocks: extra_stocks ?? [],
      stock_thresholds: stock_thresholds ?? { detergent: 1, softener: 1 },
    })
    .eq("laundryId", laundryId);

  if (error) return { error };
  return {};
}

export async function getStockStates() {
  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [], lowStockItems: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("detergent,softener,extra_stocks,stock_thresholds,laundryId,laundryName")
    .in("laundryId", storeIds);

  if (error) return { error: error.message };

  const lowStockItems = data.filter((item) => {
    const t = item.stock_thresholds ?? {};
    const detThr = t.detergent ?? 1;
    const sofThr = t.softener ?? 1;
    return (
      item.detergent <= detThr ||
      item.softener <= sofThr ||
      (item.extra_stocks ?? []).some((s) => s.count <= (s.threshold ?? 1))
    );
  });
  return { data, lowStockItems };
}
