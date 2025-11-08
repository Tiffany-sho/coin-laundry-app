"use server";

import { createClient } from "@/utils/supabase/server";

export async function createData(formData) {
  const supabase = await createClient();

  const fundsAndFundsArray = formData.fundsArray.map((item) => {
    if (!item.funds) {
      item.funds = 0;
    }
    const newObj = {
      id: item.machine.id,
      name: item.machine.name,
      funds: item.funds,
    };
    return newObj;
  });
  const { data, error } = await supabase
    .from("collect_funds")
    .insert({
      laundryId: formData.storeId,
      laundryName: formData.store,
      date: formData.date,
      fundsArray: fundsAndFundsArray,
    })
    .select("laundryId,laundryName")
    .single();

  if (error) {
    return { error: error.message };
  }
  return { data: data };
}

export async function updateData(formData, id) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collect_funds")
    .update({
      fundsArray: formData,
    })
    .eq("id", id);

  return { error: error };
}

export async function deleteData(id) {
  const supabase = await createClient();

  const { error } = await supabase.from("collect_funds").delete().eq("id", id);

  return { error: error };
}
