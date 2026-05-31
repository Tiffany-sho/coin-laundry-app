"use client";

import { useEffect, useState } from "react";
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
import { getStoreRevenueSummary } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const COLORS = [
  "#0891B2",
  "#06B6D4",
  "#0E7490",
  "#67E8F9",
  "#93C5FD",
  "#6EE7B7",
  "#FCD34D",
  "#FCA5A5",
  "#C4B5FD",
  "#FDBA74",
];

function groupByStore(records) {
  const map = new Map();
  records.forEach(({ totalFunds, laundryName, laundryId }) => {
    if (!map.has(laundryId)) {
      map.set(laundryId, { name: `${laundryName}店`, total: 0 });
    }
    map.get(laundryId).total += totalFunds;
  });
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
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

export default function StoreRevenueChart() {
  const [stores, setStores] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreRevenueSummary().then(({ data, error }) => {
      if (error || !data) {
        setLoading(false);
        return;
      }
      setStores(groupByStore(data));
      setLoading(false);
    });
  }, []);

  const chartHeight = stores
    ? Math.max(160, stores.length * 44 + 40)
    : 160;

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
            <VscGraphLine size={15} />
          </Box>
          <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
            店舗別累計売上
          </Text>
        </HStack>

        {!loading && (!stores || stores.length === 0) && (
          <Text color="var(--text-faint)" fontSize="sm">
            データがありません
          </Text>
        )}
        {!loading && stores && stores.length > 0 && (
          <Box
            h={`${chartHeight}px`}
            style={{ animation: "fadeSlideUp 0.45s ease both" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stores}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
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
                  width={Math.max(80, Math.max(...stores.map((s) => s.name.length)) * 13 + 16)}
                  tick={{ fontSize: 12, fill: "#1E3A5F" }}
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
                  {stores.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
