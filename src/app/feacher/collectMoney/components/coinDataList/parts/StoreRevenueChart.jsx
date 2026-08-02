"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
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
import { VscGraphLine } from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";

// ManyCoinDataChart と同じパレット
const STORE_COLORS = [
  "#93C5FD",
  "#6EE7B7",
  "#FCD34D",
  "#FCA5A5",
  "#C4B5FD",
  "#67E8F9",
  "#FDBA74",
  "#F9A8D4",
  "#BEF264",
  "#A5B4FC",
];

/**
 * 畳み済みの店舗別売上をグラフの形へ。
 *
 * ⚠️ 集計そのものはここでしない。`useStoreRevenue()` が
 *    `src/functions/storeRevenue.js` を通して畳んだものを受け取る。
 *    ここで畳み直すと BFF（アプリ）と数字がずれても気づけない。
 */
function toChartRows(stores) {
  return (stores ?? []).map((s) => ({
    name: `${s.laundryName}店`,
    rawName: s.laundryName,
    total: s.total,
  }));
}

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
      <Text
        fontSize="sm"
        color="var(--teal)"
        fontFamily="'Space Mono', monospace"
      >
        ¥{payload[0].value.toLocaleString()}
      </Text>
    </Box>
  );
}

/**
 * 店舗別の累計売上。
 *
 * ⚠️ **データは props で受け取る。自分では取りに行かない。** 総額収益カードと
 *    同じ `getStoreRevenueSummary()` を使うので、両方が呼ぶと全期間の
 *    ページングが 2 周する。取得は CoinDataList の `useStoreRevenue()` 1 か所。
 */
export default function StoreRevenueChart({ stores: rawStores, loading }) {
  const { storeNames } = useUploadPage();
  const stores = rawStores ? toChartRows(rawStores) : null;

  const chartHeight = stores
    ? Math.max(160, stores.length * 44 + 40)
    : 160;

  const totalAmount = stores
    ? stores.reduce((sum, s) => sum + s.total, 0)
    : 0;

  const maxNameLen = stores?.length
    ? Math.max(...stores.map((s) => s.name.length))
    : 6;
  const yAxisWidth = Math.min(160, Math.max(80, maxNameLen * 13 + 20));

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
        {/* ヘッダー */}
        <HStack gap={2}>
          <Box color="var(--teal)">
            <VscGraphLine size={15} />
          </Box>
          <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
            店舗別累計売上
          </Text>
        </HStack>

        {/*
          ⚠️ 全店舗累計の金額はここに出さない。真上の総額収益カードと同じ数字になり、
             画面に 2 回並ぶ（2026-08-02 のタブ化で総額はカード側へ移した）。
             totalAmount は下のシェア（%）の計算にだけ使う。
        */}

        {!loading && (!stores || stores.length === 0) && (
          <Text color="var(--text-faint)" fontSize="sm">
            データがありません
          </Text>
        )}

        {!loading && stores && stores.length > 0 && (
          <>
            <Box
              h={`${chartHeight}px`}
              style={{ animation: "fadeSlideUp 0.45s ease both" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stores}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#F1F5F9"
                  />
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
                    {stores.map((store, i) => {
                      const contextIdx = storeNames.indexOf(store.rawName);
                      const colorIdx = contextIdx >= 0 ? contextIdx : i;
                      return (
                        <Cell key={i} fill={STORE_COLORS[colorIdx % STORE_COLORS.length]} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* 店舗別シェア */}
            <VStack align="stretch" gap={1.5} pt={1}>
              {stores.map((store, i) => {
                const contextIdx = storeNames.indexOf(store.rawName);
                const colorIdx = contextIdx >= 0 ? contextIdx : i;
                const pct = totalAmount > 0
                  ? ((store.total / totalAmount) * 100).toFixed(1)
                  : "0.0";
                return (
                  <HStack key={i} justify="space-between" gap={2}>
                    <HStack gap={1.5} minW={0} flex="1">
                      <Box
                        w="8px"
                        h="8px"
                        borderRadius="2px"
                        flexShrink={0}
                        bg={STORE_COLORS[colorIdx % STORE_COLORS.length]}
                      />
                      <Text
                        fontSize="xs"
                        color="var(--text-muted)"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {store.name}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="semibold" color="var(--text-main)" flexShrink={0}>
                      {pct}%
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  );
}
