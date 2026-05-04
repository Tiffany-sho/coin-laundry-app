"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";

export async function getMessage(id) {
  if (!id) {
    return;
  }

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("action_message")
      .select("*")
      .eq("user", id)
      .order("date", { ascending: false });

    if (error) {
      return {
        error: error,
      };
    }
    return { data: data };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

export async function getOrgMessages(orgId) {
  if (!orgId) {
    return { error: { msg: "組織IDが必要です", status: 400 } };
  }

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("action_message")
      .select("*, profiles(username, full_name)")
      .eq("org_id", orgId)
      .order("date", { ascending: false });

    if (error) {
      return { error };
    }
    return { data };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

export async function createMessage(message) {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "ログインしてください", status: 401 },
    };
  }

  const supabase = await createClient();

  const { data: memberData } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  const date = Date.now();

  const { error } = await supabase.from("action_message").insert({
    message,
    date,
    user: user.id,
    org_id: memberData?.org_id ?? null,
  });

  return { error };
}
