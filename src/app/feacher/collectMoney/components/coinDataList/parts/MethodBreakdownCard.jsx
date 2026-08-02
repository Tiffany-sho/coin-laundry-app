"use client";

import { useEffect, useState } from "react";
import { Box, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LuCreditCard } from "@/app/feacher/Icon";
import {
  getOrgCollectFunds,
  getStoreFundsForChart,
} from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { CASH_KEY, methodTotals } from "@/functions/fundsByMethod";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";

/**
 * 支払方法別の集金。現金とキャッシュレスの内訳を出す。
 *
 * ⚠️ **現金は payment_methods に行が無い。** 総額からキャッシュレスを引いて出している
 *    ので、内訳の和は必ず総額と一致する（`fundsByMethod.js` の不変条件）。
 *
 * ⚠️ **店舗別の内訳とは両立しない。** 「この店舗の PayPay」はデータとして存在しない
 *    （集計は名前で畳んでいて、店舗ごとの分解を持たない）。組織全体では
 *    店舗をまたいで 1 本にまとまる。
 *
 * ⚠️ **集金回数は出さない。** 回数は「その集金レコードの数」で支払方法ごとには
 *    分かれていない。出すと「PayPay で 8 回」と読めてしまう。
 */

/** 現金を先頭色（ティール）に固定し、キャッシュレスは順に色を振る */
const CASH_COLOR = "#0891B2";
const METHOD_COLORS = [
  "#67E8F9",
  "#93C5FD",
  "#6EE7B7",
  "#FCD34D",
  "#C4B5FD",
  "#FCA5A5",
  "#FDBA74",
  "#F9A8D4",
  "#BEF264",
  "#A5B4FC",
];

const colorOf = (key, index) =>
  key === CASH_KEY ? CASH_COLOR : METHOD_COLORS[index % METHOD_COLORS.length];

const formatAxis = (value) => {
  if (value >= 100000000) return `${(value / 100000000).toFixed(0)}億`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}万`;
  return `${value}`;
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="cyan.100"
      borderRadius="lg"
      px={3}
      py={2}
      boxShadow="sm"
    >
      <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">
        {label}
      </Text>
      <Text fontSize="sm" color="var(--teal)" fontFamily="'Space Mono', monospace">
        ¥{payload[0].value.toLocaleString()}
      </Text>
    </Box>
  );
}

const MethodBreakdownCard = ({ storeId = null }) => {
  const { startEpoch, endEpoch } = useUploadPage();
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    // ⚠️ どちらの Server Action も cashless 列を含めて返す（含めないと現金しか出ない）
    const request = storeId
      ? getStoreFundsForChart(storeId, startEpoch, endEpoch)
      : getOrgCollectFunds(startEpoch, endEpoch);

    request
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(typeof error === "string" ? error : "取得に失敗しました");
        else setRows(data ?? []);
      })
      .catch(() => {
        if (alive) setError("支払方法別の集金を取得できませんでした");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [storeId, startEpoch, endEpoch]);

  const { items, total } = methodTotals(rows);
  const chartHeight = Math.max(140, items.length * 44 + 40);
  const maxNameLen = items.length ? Math.max(...items.map((i) => i.name.length)) : 4;
  // 日本語ラベルは 1 文字 ≈ 12px。モバイルで棒の領域を潰さないよう上限をかける
  const yAxisWidth = Math.min(140, Math.max(64, maxNameLen * 12 + 8));

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
        <Box>
          <HStack gap={2} mb={1}>
            <Box color="var(--teal)">
              <LuCreditCard size={15} />
            </Box>
            <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
              支払方法別の集金
            </Text>
          </HStack>
          <Text fontSize="xs" color="var(--text-faint)">
            現金とキャッシュレスの内訳（選択中の期間）
          </Text>
        </Box>

        {loading && <Skeleton height="40" borderRadius="lg" />}

        {!loading && error && (
          <Text color="var(--text-faint)" fontSize="sm">
            {error}
          </Text>
        )}

        {!loading && !error && items.length === 0 && (
          <Text color="var(--text-faint)" fontSize="sm">
            この期間の集金がありません
          </Text>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <Box h={`${chartHeight}px`} style={{ animation: "fadeSlideUp 0.45s ease both" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={items}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis
                    type="number"
                    tickFormatter={formatAxis}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={yAxisWidth}
                    tick={{ fontSize: 11, fill: "#1E3A5F" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F0F9FF" }} />
                  <Bar
                    dataKey="total"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {items.map((item, i) => (
                      <Cell key={item.key} fill={colorOf(item.key, i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* シェア。内訳の和は必ず総額と一致するので 100% になる */}
            <VStack
              align="stretch"
              gap={1.5}
              pt={3}
              borderTop="1px solid"
              borderColor="var(--divider)"
            >
              {items.map((item, i) => {
                const pct = total > 0 ? ((item.total / total) * 100).toFixed(1) : "0.0";
                return (
                  <HStack key={item.key} justify="space-between" gap={2}>
                    <HStack gap={1.5} minW={0} flex="1">
                      <Box
                        w="8px"
                        h="8px"
                        borderRadius="2px"
                        flexShrink={0}
                        bg={colorOf(item.key, i)}
                      />
                      <Text
                        fontSize="xs"
                        color="var(--text-muted)"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {item.name}
                      </Text>
                    </HStack>
                    <HStack gap={3} flexShrink={0}>
                      <Text
                        fontSize="xs"
                        color="var(--text-main)"
                        fontFamily="'Space Mono', monospace"
                      >
                        ¥{item.total.toLocaleString()}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" color="var(--text-main)" minW="42px" textAlign="right">
                        {pct}%
                      </Text>
                    </HStack>
                  </HStack>
                );
              })}
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default MethodBreakdownCard;
