"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";

export async function getAllLaundryStates() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("*")
    .eq("stocker", user.id);

  if (error) return { error: "店舗状態の取得に失敗しました" };
  return { data };
}

export async function getLaundryState(laundryId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("*")
    .eq("laundryId", laundryId)
    .single();

  if (error) return { error: "店舗状態の取得に失敗しました" };
  return { data };
}

export async function getMachinesStates(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("machines,laundryId,laundryName")
    .eq("stocker", id);

  if (error) return { error: "設備状況の取得に失敗しました" };

  const breakMachines = data.filter((item) =>
    item.machines.some((machine) => machine.break)
  );

  return { data, breakMachines };
}

export async function updateMachinesState(laundryId, machines) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("laundry_state")
    .update({ machines })
    .eq("laundryId", laundryId);

  if (error) return { error };
  return {};
}

export async function updateStockState(laundryId, { detergent, softener }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("laundry_state")
    .update({ detergent, softener })
    .eq("laundryId", laundryId);

  if (error) return { error };
  return {};
}

export async function getStockStates(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("detergent,softener,laundryId,laundryName")
    .eq("stocker", id);

  if (error) return { error: error.message };

  const lowStockItems = data.filter(
    (item) => item.detergent < 2 || item.softener < 2
  );

  return { data, lowStockItems };
}
