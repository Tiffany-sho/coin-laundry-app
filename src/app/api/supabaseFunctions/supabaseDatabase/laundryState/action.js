"use server";

import { createClient } from "@/utils/supabase/server";

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
