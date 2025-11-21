"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";

export const getFundsData = async (id) => {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "Unauthorized", status: 401 },
    };
  }
  const supabase = await createClient();
  const { data: initialData, error: initialError } = await supabase
    .from("collect_funds")
    .select("*")
    .eq("laundryId", id)
    .eq("collecter", user.id);

  if (initialError) {
    return { error: initialError };
  } else {
    return { data: initialData };
  }
};

export async function createData(formData) {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "Unauthorized", status: 401 },
    };
  }
  const supabase = await createClient();

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

  if (error) {
    return { error: error.message };
  }
  return { data: data };
}

export async function updateData(fundsArray, totalFunds, id) {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "Unauthorized", status: 401 },
    };
  }
  const supabase = await createClient();

  const { error } = await supabase
    .from("collect_funds")
    .update({
      fundsArray,
      totalFunds,
    })
    .eq("id", id)
    .eq("collecter", user.id);

  return { error: error };
}

export async function updateDate(date, id) {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "Unauthorized", status: 401 },
    };
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collect_funds")
    .update({
      date,
    })
    .eq("id", id)
    .eq("collecter", user.id)
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
