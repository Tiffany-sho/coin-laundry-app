"use server";

import { createClient } from "@/utils/supabase/server";

export async function createData(formData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collect_funds")
    .insert({
      laundryId: formData.storeId,
      laundryName: formData.store,
      date: formData.date,
      fundsArray: formData.fundsArray,
      totalFunds: formData.totalFunds,
    })
    .select("laundryId,laundryName")
    .single();

  if (error) {
    return { error: error.message };
  }
  return { data: data };
}

export async function updateData(fundsArray, totalFunds, id) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collect_funds")
    .update({
      fundsArray,
      totalFunds,
    })
    .eq("id", id);

  return { error: error };
}

export async function updateDate(date, id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collect_funds")
    .update({
      date,
    })
    .eq("id", id)
    .select("date")
    .single();

  if (error) {
    return { error: error };
  }
  return { data: data };
}

export async function deleteData(id) {
  const supabase = await createClient();

  const { error } = await supabase.from("collect_funds").delete().eq("id", id);

  return { error: error };
}
