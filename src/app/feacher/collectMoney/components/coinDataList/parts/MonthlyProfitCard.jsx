"use client";

import { useEffect, useState } from "react";
import { Box, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import { getCollectMonthlySummary } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { getExpenses } from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { groupByMonth } from "@/functions/monthlySummary";
import {
  buildProfitPoints,
  currentMonthKey,
  monthRange,
  profitOf,
  recentMonthKeys,
  sumProfitPoints,
} from "@/functions/expenseSummary";

/**
 * 月別利益（売上 − 経費）。2026-08-03 に「月次サマリー」と差し替えた。
 *
 * ⚠️ **棒は 0 の線をまたぐ。** 赤字の月は下へ伸びる。`Math.max(値, 0)` で
 *    潰すと**赤字が黒字に見える。**
 *
 * ⚠️ **経費を使わない組織には出さない**（`organizations.expenses_enabled`）。
 *    経費が常に 0 で、利益＝売上の棒が月別売上と同じ形で 2 枚並ぶだけになる。
 *    出し分けは呼び出し側（CoinDataList のタブ）。
 *
 * ⚠️ **店舗ページでは「その店舗に紐づけた経費」だけを引く。** `laundry_id` が
 *    NULL の組織全体の経費は**入らない**（按分の規則が無いので勝手に割らない）。
 *    カードに必ず明記すること。
 */

/** 直近 12 か月。⚠️ 月次サマリーと同じ窓にしてある（並べて比べられるように） */
const MONTHS = 12;

const formatAxis = (value) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 100000000) return `${sign}${(abs / 100000000).toFixed(0)}億`;
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(0)}万`;
  return `${sign}${abs}`;
};

const PROFIT_COLOR = "#0891B2";
const LOSS_COLOR = "#E02424";

function ProfitTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <Box
      bg="var(--card-bg, #FFFFFF)"
      border="1px solid"
      borderColor="cyan.100"
      borderRadius="lg"
      boxShadow="var(--shadow-sm)"
      px={3}
      py={2}
    >
      <Text fontSize="xs" color="var(--text-muted)">
        {point.label}
      </Text>
      <Text fontSize="sm" fontWeight="bold" color={point.profit < 0 ? LOSS_COLOR : "var(--teal-deeper)"}>
        利益 {point.profit < 0 ? "−" : ""}¥{Math.abs(point.profit).toLocaleString()}
      </Text>
      <Text fontSize="xs" color="var(--text-muted)" mt={1}>
        売上 ¥{point.revenue.toLocaleString()}
      </Text>
      <Text fontSize="xs" color="var(--text-muted)">
        経費 ¥{point.expense.toLocaleString()}
      </Text>
    </Box>
  );
}

export default function MonthlyProfitCard({ storeId = null }) {
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const months = recentMonthKeys(MONTHS);
    /*
      ⚠️ **`getExpenses` の `end` は「含む」（lte）。** `monthRange` が月末を
         返すのでそのまま渡す。翌月 1 日を渡すと**翌月 1 日の経費が 1 件混ざる。**
    */
    const start = monthRange(months[0]).start;
    const end = monthRange(currentMonthKey()).end;

    Promise.all([getCollectMonthlySummary(storeId), getExpenses(start, end, storeId)]).then(
      ([revenueRes, expenseRes]) => {
        if (cancelled) return;
        const revenueMonths = groupByMonth(revenueRes?.data ?? []);
        setPoints(buildProfitPoints(revenueMonths, expenseRes?.data ?? [], months));
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const totals = sumProfitPoints(points ?? []);
  const { margin } = profitOf(totals.revenue, totals.expense);
  const negative = totals.profit < 0;
  /* ⚠️ 経費が 1 円も無いと「利益＝売上」の棒になる。入口をその場に出す */
  const noExpenses = points !== null && totals.expense === 0;

  return (
    <Box
      bg="var(--card-bg, #FFFFFF)"
      border="1px solid"
      borderColor="cyan.100"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      p={{ base: 4, md: 6 }}
    >
      <VStack align="stretch" gap={4}>
        <HStack gap={2}>
          <Box color="var(--teal)">
            <Icon.LuTrendingUp size={15} />
          </Box>
          <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
            月別利益
          </Text>
          <Text fontSize="xs" color="var(--text-muted)">
            売上 − 経費
          </Text>
        </HStack>

        {loading ? (
          <Skeleton height="260px" borderRadius="lg" />
        ) : (
          <>
            <VStack align="stretch" gap={1}>
              <Text fontSize="xs" color="var(--text-muted)">
                直近{MONTHS}か月の利益
              </Text>
              <HStack align="baseline" gap={3}>
                <Text
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="black"
                  lineHeight="1"
                  color={negative ? LOSS_COLOR : "var(--teal-deeper)"}
                >
                  {negative ? "−" : ""}¥{Math.abs(totals.profit).toLocaleString()}
                </Text>
                {/* ⚠️ 売上 0 の期間では出さない（0 除算で Infinity になる） */}
                {margin !== null && (
                  <Text fontSize="sm" color="var(--text-muted)">
                    利益率 {margin}%
                  </Text>
                )}
              </HStack>
              <HStack gap={4} mt={1}>
                <Text fontSize="xs" color="var(--text-muted)">
                  売上 ¥{totals.revenue.toLocaleString()}
                </Text>
                <Text fontSize="xs" color="var(--text-muted)">
                  経費 ¥{totals.expense.toLocaleString()}
                </Text>
              </HStack>
            </VStack>

            <Box h={{ base: "220px", md: "260px" }} minW={0}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--divider, #F1F5F9)" vertical={false} />
                  <XAxis
                    dataKey="key"
                    tickFormatter={(key) => Number(String(key).slice(5))}
                    tick={{ fontSize: 11, fill: "var(--text-faint)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatAxis}
                    tick={{ fontSize: 11, fill: "var(--text-faint)" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<ProfitTooltip />} cursor={{ fill: "rgba(8,145,178,0.06)" }} />
                  {/* ⚠️ 0 の基準線は必ず引く。無いと下に伸びた棒の意味が読めない */}
                  <ReferenceLine y={0} stroke="var(--text-faint)" />
                  <Bar dataKey="profit" radius={[3, 3, 0, 0]}>
                    {(points ?? []).map((point) => (
                      <Cell
                        key={point.key}
                        fill={point.profit < 0 ? LOSS_COLOR : PROFIT_COLOR}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Text fontSize="xs" color="var(--text-muted)" lineHeight="1.7">
              {storeId
                ? "この店舗に紐づけた経費だけを引いています。組織全体の経費は含まれません。"
                : "毎月の固定費も計上されます。"}
              {noExpenses && !storeId && (
                <>
                  {" "}
                  <Link href="/collectMoney/expenses" style={{ color: "var(--teal)", fontWeight: 600 }}>
                    経費を登録する
                  </Link>
                </>
              )}
            </Text>
          </>
        )}
      </VStack>
    </Box>
  );
}
