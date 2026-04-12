"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";

export const getProfile = async () => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data, error, status } = await supabase
    .from("profiles")
    .select("full_name, username, role")
    .eq("id", user.id)
    .single();

  if (error && status !== 406) return { error };
  return { data };
};

export const updateProfile = async ({ fullname, username }) => {
  if (!fullname || !username) return { error: "空のフォームデータがあります" };

  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullname,
    username,
    updated_at: new Date().toISOString(),
  });

  return { error };
};

export const getCollectMethod = async () => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("collectMethod")
    .eq("id", user.id)
    .single();

  if (error) return { error };
  return { data };
};

export const updateCollectMethod = async (method) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const collectMethod = method === null ? null : method ? "machines" : "total";

  const { error } = await supabase
    .from("profiles")
    .update({ collectMethod })
    .eq("id", user.id);

  return { error };
};
