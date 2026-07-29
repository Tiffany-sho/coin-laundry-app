"use server";

import { after } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";
import { getStores } from "../laundryStore/action";
import { pushToOrg } from "@/utils/push/send";

async function getMyRole(supabase, userId) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data.role;
}

/** 通知の宛先を決めるのに要る。role だけでは組織が分からない */
async function getMyOrgId(supabase, userId) {
  const { data } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", userId)
    .single();
  return data?.org_id ?? null;
}

/** 稼働中 → 故障 に変わった機器だけを返す。既に故障中のものは通知しない */
function newlyBrokenMachines(before, next) {
  const wasBroken = new Map((before ?? []).map((m) => [m.id, Boolean(m.break)]));
  return (next ?? []).filter((m) => Boolean(m.break) && !wasBroken.get(m.id));
}

/**
 * 警告ラインを下回っている在庫の名前。
 * ⚠️ 判定式は getStockStates() の lowStockItems と同じにしてある。
 *    片方だけ変えると、一覧では警告なのに通知が飛ばない（またはその逆）になる。
 */
function lowStockNames(state) {
  const t = state?.stock_thresholds ?? {};
  const names = [];
  if (Number(state?.detergent) <= (t.detergent ?? 1)) names.push("洗剤");
  if (Number(state?.softener) <= (t.softener ?? 1)) names.push("柔軟剤");
  for (const s of state?.extra_stocks ?? []) {
    if (Number(s?.count) <= (s?.threshold ?? 1)) names.push(s?.name ?? "在庫");
  }
  return names;
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

  // 通知の判定に要るので更新前の状態を控える
  const { data: before } = await supabase
    .from("laundry_state")
    .select("machines, laundryName")
    .eq("laundryId", laundryId)
    .single();

  const { error } = await supabase
    .from("laundry_state")
    .update({ machines })
    .eq("laundryId", laundryId);

  if (error) return { error };

  const broken = newlyBrokenMachines(before?.machines, machines);
  if (broken.length > 0) {
    const orgId = await getMyOrgId(supabase, user.id);
    if (orgId) {
      const storeName = before?.laundryName ?? "店舗";
      const label =
        broken.length === 1 ? broken[0].name : `${broken[0].name} ほか ${broken.length - 1} 件`;
      // ⚠️ after() で応答後に送る。await すると保存の待ち時間に Expo の往復が乗る
      after(() =>
        pushToOrg({
          orgId,
          prefKey: "machineBreak",
          title: `${storeName}の機器が故障として登録されました`,
          body: label,
          url: `/manage/${laundryId}`,
          exceptUserId: user.id,
        })
      );
    }
  }

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

  const { data: before } = await supabase
    .from("laundry_state")
    .select("detergent, softener, extra_stocks, stock_thresholds, laundryName")
    .eq("laundryId", laundryId)
    .single();

  const next = {
    detergent,
    softener,
    extra_stocks: extra_stocks ?? [],
    stock_thresholds: stock_thresholds ?? { detergent: 1, softener: 1 },
  };

  const { error } = await supabase
    .from("laundry_state")
    .update(next)
    .eq("laundryId", laundryId);

  if (error) return { error };

  // 「今回はじめて警告ラインを下回ったもの」だけ通知する。
  // 下回ったままの在庫を毎回知らせると通知が切られる
  const wasLow = new Set(lowStockNames(before));
  const nowLow = lowStockNames(next).filter((name) => !wasLow.has(name));

  if (nowLow.length > 0) {
    const orgId = await getMyOrgId(supabase, user.id);
    if (orgId) {
      const storeName = before?.laundryName ?? "店舗";
      after(() =>
        pushToOrg({
          orgId,
          prefKey: "lowStock",
          title: `${storeName}の在庫が少なくなっています`,
          body: `${nowLow.join("・")}が残りわずかです`,
          url: `/manage/${laundryId}`,
          exceptUserId: user.id,
        })
      );
    }
  }

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
