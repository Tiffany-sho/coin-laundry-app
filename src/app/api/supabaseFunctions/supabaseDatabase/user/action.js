"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

// cache() でリクエスト内の重複呼び出しを1回に集約する
export const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user: user };
});
