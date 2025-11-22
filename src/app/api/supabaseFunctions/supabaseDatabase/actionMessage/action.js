"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";

export async function getMessage() {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "ログインしてください", status: 401 },
    };
  }

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("action_message")
      .select("*")
      .eq("user", user.id);

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

export async function createMessage(message) {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "ログインしてください", status: 401 },
    };
  }
  const date = Date.now();

  const actionMessage = {
    message,
    date,
    user: user.id,
  };

  const supabase = await createClient();

  const { error } = await supabase.from("action_message").insert(actionMessage);

  return {
    error: error,
  };
}
