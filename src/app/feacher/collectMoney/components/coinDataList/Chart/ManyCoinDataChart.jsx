"use client";

import { useEffect, useMemo, useState } from "react";
import { Chart, useChart } from "@chakra-ui/charts";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getYearMonth } from "@/functions/makeDate/date";
import ChartLoading from "@/app/feacher/partials/ChartLoading";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import ChartError from "@/app/feacher/partials/ChartError";
import ChartEmpty from "@/app/feacher/partials/ChartEmpty";
import { getOrgCollectFunds } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const STORE_COLORS = [
  "#0891B2",
  "#06B6D4",
  "#0E7490",
  "#22D3EE",
  "#7C3AED",
  "#059669",
  "#F59E0B",
  "#DC2626",
];

const formatYAxis = (value) => {
  if (value === 0) return "0";
  if (value >= 100000000) return `${(value / 100000000).toFixed(0)}億`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}万`;
  return `${value}`;
};

const CustomXTick = ({ x, y, payload, firstMonthsOfYear }) => {
  if (!payload?.value) return null;
  const month = parseInt(payload.value.slice(5, 7), 10);
  const year = payload.value.slice(0, 4);
  const showYear = firstMonthsOfYear?.has(payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      {showYear && (
        <text x={0} y={4} textAnchor="middle" fontSize={10} fill="#94a3b8">
          {year}年
        </text>
      )}
      <text x={0} y={showYear ? 18 : 14} textAnchor="middle" fontSize={11} fill="#64748b">
        {month}月
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const month = parseInt(label.slice(5, 7), 10);
  const year = label.slice(0, 4);
  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0);

  return (
    <div style={{
      background: "var(--card-bg, white)",
      border: "1px solid var(--divider, #e2e8f0)",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      minWidth: 160,
    }}>
      <div style={{ fontSize: 12, color: "var(--text-faint, #94a3b8)", marginBottom: 8 }}>
        {year}年{month}月
      </div>
      {[...payload].reverse().map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill, flexShrink: 0 }} />
            <span style={{ color: "var(--text-muted, #64748b)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.name}
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: "bold", color: "var(--text-main, #0f172a)", whiteSpace: "nowrap" }}>
            ¥{(p.value ?? 0).toLocaleString()}
          </span>
        </div>
      ))}
      {payload.length > 1 && (
        <div style={{ borderTop: "1px solid var(--divider, #e2e8f0)", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>合計</span>
          <span style={{ fontSize: 14, fontWeight: "bold", color: "var(--text-main)" }}>
            ¥{total.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

const ManyCoinDataChart = () => {
  const { data, setData, startEpoch, endEpoch } = useUploadPage();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [storeNames, setStoreNames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: initialData, error: initialError } = await getOrgCollectFunds(startEpoch, endEpoch);
      if (initialError) {
        setError(initialError);
        setData(null);
      } else {
        setData(initialData);
        setError(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [startEpoch, endEpoch]);

  useEffect(() => {
    if (!data) return;

    const sorted = [...data].sort((a, b) => a.date - b.date);

    const seen = new Set();
    const names = [];
    sorted.forEach((d) => {
      const name = d.laundryName || "不明";
      if (!seen.has(name)) { seen.add(name); names.push(name); }
    });
    setStoreNames(names);

    const byMonth = {};
    sorted.forEach((record) => {
      const month = getYearMonth(record.date);
      const storeName = record.laundryName || "不明";
      if (!byMonth[month]) byMonth[month] = { name: month };
      byMonth[month][storeName] = (byMonth[month][storeName] ?? 0) + record.totalFunds;
    });

    setChartData(Object.values(byMonth));
  }, [data]);

  const firstMonthsOfYear = useMemo(() => {
    const yearFirst = {};
    chartData.forEach(({ name }) => {
      const year = name.slice(0, 4);
      if (!yearFirst[year]) yearFirst[year] = name;
    });
    return new Set(Object.values(yearFirst));
  }, [chartData]);

  const chart = useChart({ data: chartData, dataKey: "stores" });

  if (loading) return <ChartLoading />;
  if (error) return <ChartError message={error.message} />;
  if (!data || data.length === 0) return <ChartEmpty />;
  if (chartData.length === 0) return <ChartLoading />;

  return (
    <Box>
      <Chart.Root h="260px" chart={chart}>
        <BarChart data={chartData} margin={{ left: -16, right: 24, top: 16, bottom: 8 }}>
          <CartesianGrid stroke={chart.color("border")} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke={chart.color("border")}
            tick={<CustomXTick firstMonthsOfYear={firstMonthsOfYear} />}
            tickLine={false}
            height={40}
          />
          <YAxis
            width={56}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            tickFormatter={formatYAxis}
            stroke={chart.color("border")}
          />
          <Tooltip
            animationDuration={100}
            cursor={{ fill: "rgba(8,145,178,0.06)" }}
            content={<CustomTooltip />}
          />
          {storeNames.map((name, i) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="stack"
              fill={STORE_COLORS[i % STORE_COLORS.length]}
              isAnimationActive={false}
              radius={i === storeNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </Chart.Root>

      {storeNames.length > 0 && (
        <Flex gap={3} mt={3} flexWrap="wrap" justify="center">
          {storeNames.map((name, i) => (
            <HStack key={name} gap={1.5}>
              <Box
                w="10px" h="10px"
                borderRadius="2px"
                bg={STORE_COLORS[i % STORE_COLORS.length]}
                flexShrink={0}
              />
              <Text fontSize="xs" color="var(--text-muted)" maxW="80px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {name}
              </Text>
            </HStack>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default ManyCoinDataChart;
