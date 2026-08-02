export const dynamic = "force-dynamic";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import RecurringPanel from "@/app/feacher/expenses/components/RecurringPanel";
import * as Icon from "@/app/feacher/Icon";

export const metadata = {
  title: "毎月の固定費 | Collecie",
};

/**
 * 毎月の固定費の定義。
 *
 * ⚠️ ここで作るのは**定義だけ**で、経費の実体は作らない。一覧を開くたびに
 *    定義から展開して計算している（`expandRecurring`）。金額を変えると
 *    過去の月まで遡って変わる。
 */
export default async function RecurringExpensesPage() {
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
            <Icon.LuRefreshCw size={22} color="var(--teal)" />
            <Heading
              as="h1"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              color="var(--teal-deeper)"
            >
              毎月の固定費
            </Heading>
          </HStack>
          <Text fontSize="sm" color="var(--text-muted)">
            家賃・水道光熱費など、毎月かかる支出
          </Text>
        </Box>

        <Link href="/collectMoney/expenses">
          <HStack
            gap={1}
            color="var(--text-muted)"
            fontSize="sm"
            cursor="pointer"
            flexShrink={0}
            _hover={{ color: "var(--text-main)" }}
          >
            <Icon.LuChevronLeft size={16} />
            <Text>経費へ</Text>
          </HStack>
        </Link>
      </HStack>

      <RecurringPanel stores={stores ?? []} canEdit={canEdit} />
    </Box>
  );
}
