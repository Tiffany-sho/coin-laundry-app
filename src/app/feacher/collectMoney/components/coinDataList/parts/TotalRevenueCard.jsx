"use client";

import { Box, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import { createNowData } from "@/functions/makeDate/date";
import { averagePerCollect, pickStoreRevenue, revenueTotals } from "@/functions/storeRevenue";

/**
 * 総額収益カード。期間の切り替えに関係なく変わらない数字なので、タブの外に常時置く。
 *
 * ⚠️ **期間は `getStoreRevenueSummary()` の date から作る。** 月次サマリーは
 *    前年同月比のため過去 2 年に固定されていて、しかも月単位に畳んだあとなので
 *    日にちが分からない。全期間を見ている集計はこちらだけ。
 *
 * ⚠️ 収益レポート（組織全体）と店舗ページで同じカードを使う。どちらの画面かは
 *    ページの見出しで分かるので、カードの見出しに店舗名を混ぜない。
 */

const Stat = ({ label, value, divided }) => (
  <Box
    flex="1"
    minW={0}
    px={{ base: 2, md: 3 }}
    borderLeft={divided ? "1px solid" : "none"}
    borderColor="var(--divider)"
  >
    <Text fontSize="10px" color="var(--text-faint)" mb={0.5}>
      {label}
    </Text>
    <Text
      fontSize={{ base: "xs", md: "sm" }}
      fontWeight="bold"
      color="var(--text-main)"
      lineHeight="1.3"
    >
      {value}
    </Text>
  </Box>
);

const TotalRevenueCard = ({ stores, loading, storeId = null }) => {
  /**
   * 店舗ページでは自分の店舗だけに絞る。
   * ⚠️ 集金がまだ 1 件も無い店舗はこの集計に現れないので、pickStoreRevenue が
   *    0 件の形を返す。null チェックを別に書かないこと。
   */
  const totals = storeId
    ? (() => {
        const s = pickStoreRevenue(stores, storeId);
        return {
          total: s.total,
          count: s.count,
          firstDate: s.firstDate,
          lastDate: s.lastDate,
          storeCount: 1,
        };
      })()
    : revenueTotals(stores);

  const average = averagePerCollect(totals.total, totals.count);

  /**
   * ⚠️ 数値であることを確かめてから日付にする。`null` のまま createNowData に
   *    渡すと「1970/1/1」が出る（集金 0 件の店舗で必ず起きる）。
   */
  const hasPeriod =
    Number.isFinite(totals.firstDate) && Number.isFinite(totals.lastDate);

  const stats = [
    ...(storeId ? [] : [{ label: "店舗数", value: `${totals.storeCount}店舗` }]),
    { label: "集金回数", value: `${totals.count.toLocaleString()}回` },
    { label: "1回あたり", value: average === null ? "—" : `¥${average.toLocaleString()}` },
  ];

  return (
    <Box
      bg="var(--card-bg, #FFFFFF)"
      border="1px solid"
      borderColor="cyan.100"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      p={{ base: 4, md: 6 }}
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="center" gap={2}>
          <Text fontWeight="semibold" color="var(--teal-deeper)" fontSize="sm" flexShrink={0}>
            総額収益
          </Text>
          {/* 集金が 1 件も無いときは何も出さない。ラベルが無いので「—」だけだと読めない */}
          {!loading && hasPeriod && (
            <HStack gap={1.5} minW={0}>
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)">
                {createNowData(totals.firstDate)}
              </Text>
              <Text fontSize="11px" color="var(--text-faint)">
                〜
              </Text>
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)">
                {createNowData(totals.lastDate)}
              </Text>
            </HStack>
          )}
        </HStack>

        {loading ? (
          <Skeleton height="12" width="60%" borderRadius="lg" />
        ) : (
          <>
            <HStack align="baseline" gap={1}>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="semibold"
                color="var(--text-muted)"
              >
                ¥
              </Text>
              <Text
                fontSize={{ base: "4xl", md: "5xl" }}
                fontWeight="black"
                lineHeight="1"
                letterSpacing="tight"
                color="var(--teal-deeper)"
              >
                {totals.total.toLocaleString()}
              </Text>
            </HStack>

            <HStack
              pt={3}
              borderTop="1px solid"
              borderColor="var(--divider)"
              gap={0}
              align="stretch"
            >
              {stats.map((stat, i) => (
                <Stat key={stat.label} label={stat.label} value={stat.value} divided={i > 0} />
              ))}
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default TotalRevenueCard;
