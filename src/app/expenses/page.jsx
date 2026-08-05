export const dynamic = "force-dynamic";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import ExpensesPanel from "@/app/feacher/expenses/components/ExpensesPanel";
import RecurringPanel from "@/app/feacher/expenses/components/RecurringPanel";
import * as Icon from "@/app/feacher/Icon";

export const metadata = {
  title: "経費 | Collecie",
};

/**
 * 経費。**フッターナビの 1 枚目**（2026-08-05 に `/collectMoney/expenses` から昇格）。
 *
 * ⚠️ **毎日触る記録なのに、収益 → 経費 の 2 タップが要っていた。**
 *    アプリは 2026-08-03 に同じ理由でタブへ昇格させてある。同じ機能が
 *    Web とアプリで深さの違うところにあると、片方の説明がもう片方に通じない。
 *
 * ⚠️ **毎月の固定費もこのページに折り込んである**（アプリと同じ）。
 *    同じ「経費」なのに固定費だけ行き先が違うのをやめた。
 *    ⚠️ 上の一覧に出るのは**展開された結果**、下に並ぶのは**定義**。
 *       同じものが 2 か所に見えるので、見出しで区別が付くようにしてある。
 *
 * ⚠️ **`/collectMoney/expenses` は残してある**（リダイレクト）。
 *    収益ページと月別利益カードからのリンク、それにブックマークが生きている。
 *
 * ⚠️ **「足せる人」と「直せる人」が違う**（2026-08-03）。
 *    - 登録（単発）… admin + 集金担当者。現場で出た支出をその場で記録するため
 *    - **編集・削除、固定費のすべて … admin だけ**
 *    Server Action 側でも弾いているが、押せるボタンを出さないために両方を渡す
 *    （表示の出し分けだけ）。**1 つの `canEdit` にまとめないこと。**
 *
 * ⚠️ **一覧そのものは担当店舗（011）で絞られている**（`getExpenses`）。
 *    担当外の店舗の経費はそもそも返らない。
 */
export default async function ExpensesPage() {
  const [{ data: stores }, { data: org }] = await Promise.all([
    getStores(),
    getMyOrganization(),
  ]);

  const canAdd = org?.myRole === "admin" || org?.myRole === "collecter";
  const canManage = org?.myRole === "admin";

  return (
    <Box maxW="720px" mx="auto" p={{ base: 4, md: 8 }}>
      <Box mb={6}>
        <HStack gap={3} mb={1}>
          <Icon.LuWallet size={22} color="var(--teal)" />
          <Heading
            as="h1"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="var(--teal-deeper)"
          >
            経費
          </Heading>
        </HStack>
        <Text fontSize="sm" color="var(--text-muted)">
          仕入れ・修繕などの支出と、毎月の固定費
        </Text>
      </Box>

      {/*
        ⚠️ 設定で経費を切ったあとにこの URL を直接開けてしまう（入口は消えるが
           ページは残る）。空の一覧を出すと壊れたように見えるので明示する。
        ⚠️ **403 にはしない。** 表示の設定であって認可ではないため
           （戻せば以前の記録がそのまま出る）。
        ⚠️ **判定は `=== false`。** 未適用の環境などで `undefined` になり得る値を
           `Boolean()` で畳むと、経費を使う組織から経費が消える（012）。
      */}
      {org?.expensesEnabled === false ? (
        <Box
          p={6}
          bg="var(--card-bg, #FFFFFF)"
          border="1px solid"
          borderColor="cyan.100"
          borderRadius="xl"
        >
          <Text fontSize="sm" color="var(--text-muted)" lineHeight="1.8">
            この組織では経費を記録しない設定です。
            <br />
            設定 → 組織 から変更できます。
          </Text>
        </Box>
      ) : (
        <>
          <ExpensesPanel stores={stores ?? []} canAdd={canAdd} canManage={canManage} />

          {/* ⚠️ 固定費の管理は admin だけ（追加・編集・削除とも。理由はサーバの requireAdmin） */}
          <Box mt={10}>
            <HStack gap={2} mb={1}>
              <Icon.LuRefreshCw size={18} color="var(--teal)" />
              <Heading as="h2" fontSize="lg" fontWeight="bold" color="var(--teal-deeper)">
                毎月の固定費
              </Heading>
            </HStack>
            <Text fontSize="xs" color="var(--text-muted)" mb={4}>
              家賃・水道光熱費など、毎月かかる支出。ここで登録すると上の一覧に自動で計上されます。
            </Text>
            <RecurringPanel stores={stores ?? []} canEdit={canManage} />
          </Box>
        </>
      )}
    </Box>
  );
}
