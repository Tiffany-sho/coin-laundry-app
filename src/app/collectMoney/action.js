"use server";

import { createClient } from "@/utils/supabase/server";

export async function createData(formData) {
  const supabase = await createClient();

  const moneyAndFundsArray = formData.moneyArray.map((item) => {
    const newObj = {
      name: item.machine.name,
      funds: item.money,
    };
    return newObj;
  });
  const { data, error } = await supabase
    .from("collect_funds")
    .insert({
      laundryId: formData.storeId,
      laundryName: formData.store,
      date: formData.date,
      fundsArray: moneyAndFundsArray,
    })
    .select("laundryId,laundryName")
    .single();

  if (error) {
    return { error: error.message };
  }
  return { data: data };
}
