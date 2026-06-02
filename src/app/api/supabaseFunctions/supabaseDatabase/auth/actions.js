"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function login(preState, formData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: "メールアドレスまたはパスワードが間違っています" };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(preState, formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!password || password.length < 8) {
    return { error: "パスワードは8文字以上で入力してください。" };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { error: "パスワードは英字と数字を両方含めてください。" };
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("already registered") || msg.includes("user already exists")) {
      return { error: "このメールアドレスはすでに登録されています。ログインページからログインしてください。" };
    }
    if (msg.includes("rate limit") || msg.includes("email rate")) {
      return { error: "しばらく時間をおいてから再度お試しください。" };
    }
    if (msg.includes("invalid email") || msg.includes("valid email")) {
      return { error: "有効なメールアドレスを入力してください。" };
    }
    if (msg.includes("password")) {
      return { error: "パスワードは英数字を含む8文字以上で入力してください。" };
    }
    return { error: "エラーが発生しました。もう一度お試しください。" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(preState, formData) {
  const headersList = await headers();
  const origin = headersList.get("origin");
  const supabase = await createClient();
  const email = formData.get("email");

  if (!email) {
    return { error: "メールアドレスを入力してください。" };
  }

  const redirectUrl = `${origin}/auth/callback?next=/auth/updatePassword`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error(error);
    return { error: "エラーが発生しました。もう一度お試しください。" };
  }

  return {
    message:
      "パスワードリセット用のメールを送信しました。受信トレイを確認してください。",
  };
}
export async function updatePassword(formData) {
  const supabase = await createClient();
  const password = formData.get("password");

  if (!password) {
    return { error: "パスワードを入力してください。" };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error(error);
    return {
      error: "パスワードの更新に失敗しました。もう一度お試しください。",
    };
  }

  revalidatePath("/");
  redirect("/auth/login");
}
