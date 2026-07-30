import { getRecentCollectFunds } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { createNowData } from "@/functions/makeDate/date";
import * as Icon from "@/app/feacher/Icon";

/**
 * ⚠️ getRecentCollectFunds は過去 1 か月を**全件**返す（表示件数は呼び出し側が決める）。
 *    ここで切らないと、集金の多い組織でホームが数百行になる。
 *    30 は従来この関数が返していた上限で、Web の見え方を変えないための値。
 */
const VISIBLE_LIMIT = 30;

const RecentCollectList = async () => {
  const { data: allData, error } = await getRecentCollectFunds();
  const data = allData?.slice(0, VISIBLE_LIMIT);

  return (
    <Box
      bg="var(--card-bg, #FFFFFF)"
      borderRadius="xl"
      border="1px solid"
      borderColor="cyan.100"
      boxShadow="var(--shadow-sm)"
      overflow="hidden"
    >
      <HStack
        px={4} py={3}
        borderBottom="1px solid"
        borderColor="var(--divider, #F1F5F9)"
        justify="space-between"
      >
        <HStack gap={2}>
          <Box color="var(--teal, #0891B2)">
            <Icon.LuHistory size={15} />
          </Box>
          <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper, #155E75)">
            過去1ヶ月の集金記録
          </Text>
        </HStack>
        <Link href="/collectMoney">
          <Text fontSize="xs" color="var(--teal, #0891B2)">すべて見る →</Text>
        </Link>
      </HStack>

      {error ? (
        <Box px={4} py={6} textAlign="center">
          <Text fontSize="sm" color="red.400">データ取得に失敗しました</Text>
        </Box>
      ) : !data || data.length === 0 ? (
        <Box px={4} py={6} textAlign="center">
          <Text fontSize="sm" color="var(--text-muted, #64748B)">過去1ヶ月の集金記録はありません</Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={0}>
          {data.map((item, i) => (
            <HStack
              key={item.id}
              px={4} py={3}
              justify="space-between"
              borderBottom={i < data.length - 1 ? "1px solid" : "none"}
              borderColor="var(--divider, #F1F5F9)"
            >
              <VStack align="start" gap={0.5}>
                <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                  {item.laundryName}
                </Text>
                <HStack gap={2}>
                  <Text fontSize="xs" color="var(--text-muted, #64748B)">
                    {createNowData(item.date)}
                  </Text>
                  {item.profiles?.username && (
                    <Text fontSize="xs" color="var(--text-faint, #94A3B8)">
                      {item.profiles.username}
                    </Text>
                  )}
                </HStack>
              </VStack>
              <Text
                fontFamily="'Space Mono', monospace"
                fontSize="sm"
                fontWeight="bold"
                color="var(--teal-deeper, #155E75)"
              >
                ¥{item.totalFunds.toLocaleString()}
              </Text>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default RecentCollectList;
