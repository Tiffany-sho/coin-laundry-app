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
import { LuWrench } from "@/app/feacher/Icon";
import { getStoreMachineBreakdown } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";

/**
 * 機器別の売上。どの台が稼いでいるか、入れ替えの判断に使う。
 *
 * ⚠️ **店舗ページ専用。組織全体では出さない。** 店舗をまたぐと同じ名前（「洗濯機1」）の
 *    別の台が合算されて意味の無い数字になる（iOS 側と同じ判断）。
 *
 * ⚠️ 集計は `getStoreMachineBreakdown()`。**名前で畳んでいて id では畳めない。**
 *    店舗を保存するたびに機器の id が振り直されるため。詳しくはあちらのコメント。
 */

const MACHINE_COLORS = [
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

/** 機器に割り振れなかったぶん。0 のときは行ごと出さない */
const UnattributedRow = ({ label, value, note }) => {
  if (!value) return null;
  return (
    <HStack justify="space-between" gap={2} align="start">
      <Box minW={0}>
        <Text fontSize="xs" color="var(--text-muted)">
          {label}
        </Text>
        {note && (
          <Text fontSize="10px" color="var(--text-faint)">
            {note}
          </Text>
        )}
      </Box>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        color="var(--text-main)"
        flexShrink={0}
        fontFamily="'Space Mono', monospace"
      >
        ¥{value.toLocaleString()}
      </Text>
    </HStack>
  );
};

const MachineBreakdownCard = ({ storeId }) => {
  const { startEpoch, endEpoch } = useUploadPage();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    getStoreMachineBreakdown(storeId, startEpoch, endEpoch)
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(typeof error === "string" ? error : "取得に失敗しました");
        else setResult(data);
      })
      .catch(() => {
        if (alive) setError("機器別の売上を取得できませんでした");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [storeId, startEpoch, endEpoch]);

  const machines = result?.machines ?? [];
  const withSales = machines.filter((m) => m.total > 0);
  const chartHeight = Math.max(160, machines.length * 40 + 40);
  const maxNameLen = machines.length ? Math.max(...machines.map((m) => m.name.length)) : 6;
  // 日本語ラベルは 1 文字 ≈ 12px。モバイルで棒の領域を潰さないよう上限をかける
  const yAxisWidth = Math.min(140, Math.max(72, maxNameLen * 12 + 8));

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
              <LuWrench size={15} />
            </Box>
            <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
              機器別の売上
            </Text>
          </HStack>
          <Text fontSize="xs" color="var(--text-faint)">
            どの台が稼いでいるか、入れ替えの判断に使う
          </Text>
        </Box>

        {loading && <Skeleton height="40" borderRadius="lg" />}

        {!loading && error && (
          <Text color="var(--text-faint)" fontSize="sm">
            {error}
          </Text>
        )}

        {!loading && !error && withSales.length === 0 && (
          <Text color="var(--text-faint)" fontSize="sm">
            この期間に機器別の記録がありません
          </Text>
        )}

        {!loading && !error && withSales.length > 0 && (
          <>
            <Box h={`${chartHeight}px`} style={{ animation: "fadeSlideUp 0.45s ease both" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={machines}
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
                    maxBarSize={26}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {machines.map((_, i) => (
                      <Cell key={i} fill={MACHINE_COLORS[i % MACHINE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/*
              ⚠️ 残差を必ず出す。内訳の和が総額に届かないことがある
                 （合計入力モード・キャッシュレス・過去データのずれ）。
                 隠すと「機器別の合計が総額収益カードと違う」という形でしか気づけない。
            */}
            {result?.unattributed && (
              <VStack
                align="stretch"
                gap={2}
                pt={3}
                borderTop="1px solid"
                borderColor="var(--divider)"
              >
                <UnattributedRow
                  label="合計入力ぶん"
                  value={result.unattributed.totalMode}
                  note="機種別ではなく合計で登録された集金"
                />
                <UnattributedRow
                  label="キャッシュレス"
                  value={result.unattributed.cashless}
                  note="機器に紐づけずに登録されたぶん"
                />
                <UnattributedRow
                  label="内訳不明"
                  value={result.unattributed.other}
                  note="合計と明細が食い違う過去データ"
                />
              </VStack>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default MachineBreakdownCard;
