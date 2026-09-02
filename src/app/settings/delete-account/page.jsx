import { redirect } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getAccountDeletionSummary } from "@/app/api/supabaseFunctions/supabaseDatabase/account/action";
import DeleteAccountClient from "./DeleteAccountClient";

export const dynamic = "force-dynamic";

export default async function DeleteAccountPage() {
  const [{ user }, { data: summary, error }] = await Promise.all([
    getUser(),
    getAccountDeletionSummary(),
  ]);

  if (!user || error) {
    redirect("/settings");
  }

  /*
    どうやってサインインしたか。**本人確認の方法をこれで分ける。**

    ⚠️ **`app_metadata.provider` ではなく `identities` を見る。** メールで登録した
       あとに Google を紐づけた人がいるので、「主たる provider」1 つでは判定を誤る
       （iOS 版と同じ理由。coinlaundy_app_iOS/app/settings/delete-account.tsx）。
    ⚠️ **パスワードを持っていない人にパスワード欄を出さない。** Google / GitHub だけで
       登録した人は永久に削除へ進めなくなる（iOS で 2026-08-05 まで実際にそうなっていた）。
       Web では OAuth の再認証がページ遷移を挟んで入力内容を失うため、Apple 再認証の
       代わりに「自分のメールアドレスを打ち直す」で本人確認する。
    ⚠️ identities が取れないときも email 入力に倒す。パスワード欄に倒すと
       OAuth ユーザーが締め出される可能性がある。
  */
  const identities = user.identities ?? [];
  const verifyBy = identities.some((i) => i.provider === "email") ? "password" : "email";

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <DeleteAccountClient
        summary={summary}
        email={user.email ?? ""}
        verifyBy={verifyBy}
      />
    </Box>
  );
}
