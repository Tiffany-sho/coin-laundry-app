export const dynamic = "force-dynamic";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import ExpensesPanel from "@/app/feacher/expenses/components/ExpensesPanel";
import * as Icon from "@/app/feacher/Icon";

export const metadata = {
  title: "経費 | Collecie",
};

/**
 * 経費の一覧。単発の経費と、展開された毎月の固定費が混ざって出る。
 *
 * ⚠️ **閲覧者（viewer）は登録・編集できない。** Server Action 側でも弾いているが、
 *    押せるボタンを出さないために myRole を渡している（表示の出し分けだけ）。
 */
export default async function ExpensesPage() {
  const [{ data: stores }, { data: org }] = await Promise.all([
    getStores(),
    getMyOrganization(),
  ]);

  const canEdit = org?.myRole === "admin" || org?.myRole === "collecter";

  return (
    <Box maxW="720px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" align="start" mb={6} gap={4}>
        <Box>
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

        <Link href="/collectMoney">
          <HStack
            gap={1}
            color="var(--text-muted)"
            fontSize="sm"
            cursor="pointer"
            flexShrink={0}
            _hover={{ color: "var(--text-main)" }}
          >
            <Icon.LuChevronLeft size={16} />
            <Text>収益へ</Text>
          </HStack>
        </Link>
      </HStack>

      {/*
        ⚠️ 設定で経費を切ったあとにこの URL を直接開けてしまう（入口は消えるが
           ページは残る）。空の一覧を出すと壊れたように見えるので明示する。
        ⚠️ **403 にはしない。** 表示の設定であって認可ではないため
           （戻せば以前の記録がそのまま出る）。
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
        <ExpensesPanel stores={stores ?? []} canEdit={canEdit} />
      )}
    </Box>
  );
}
