"use client"; // UIコンポーネントなので、クライアントコンポーネントにする

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  // ブラウザ（クライアント）用のSupabaseクライアントを作成
  const supabase = createClientComponentClient();

  return (
    <div style={{ width: "300px", margin: "50px auto" }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }} // 見た目をSupabase風にする
        providers={["google", "github"]} // SNSログインのプロバイダー
        redirectTo="http://localhost:3000/auth/callback" // 認証後にリダイレクトするURL
      />
    </div>
  );
}
