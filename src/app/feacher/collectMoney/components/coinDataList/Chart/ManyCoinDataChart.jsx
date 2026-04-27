"use client";

import { useEffect, useMemo, useState } from "react";
import { Chart, useChart } from "@chakra-ui/charts";
import {
  CartesianGrid,
  Line,
  LineChart,
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
  const amount = payload[0]?.value ?? 0;
  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: "8px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
        {year}年{month}月
      </div>
      <div style={{ fontSize: 18, fontWeight: "bold", color: "#0f172a" }}>
        ¥{amount.toLocaleString()}
      </div>
    </div>
  );
};

const ManyCoinDataChart = () => {
  const { data, setData, startEpoch, endEpoch } = useUploadPage();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

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
    const newDataList = [...data].sort((a, b) => a.date - b.date);
    const dataList = newDataList.reduce((acc, num) => {
      const month = getYearMonth(num.date);
      const alreadryMonth = acc.find((item) => item.name === month);

      if (alreadryMonth) {
        alreadryMonth.uv += num.totalFunds;
      } else {
        const newObj = {
          name: getYearMonth(num.date),
          uv: num.totalFunds,
        };
        acc.push(newObj);
      }
      return acc;
    }, []);
    setChartData(dataList);
  }, [data]);

  const firstMonthsOfYear = useMemo(() => {
    const yearFirst = {};
    chartData.forEach(({ name }) => {
      const year = name.slice(0, 4);
      if (!yearFirst[year]) yearFirst[year] = name;
    });
    return new Set(Object.values(yearFirst));
  }, [chartData]);

  const chart = useChart({
    data: chartData,
    dataKey: "coinData",
  });

  if (loading) return <ChartLoading />;
  if (error) return <ChartError message={error.messaage} />;

  if (!data || data.length === 0) {
    return <ChartEmpty />;
  }
  if (chartData.length === 0) {
    return <ChartLoading />;
  }

  return (
    <Chart.Root minWidth="0" chart={chart}>
      <LineChart data={chart.data} margin={{ left: 16, right: 24, top: 24, bottom: 8 }}>
        <CartesianGrid
          stroke={chart.color("border")}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey={chart.key("name")}
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
          cursor={{ stroke: chart.color("border"), strokeDasharray: "4 2" }}
          content={<CustomTooltip />}
        />
        <Line
          isAnimationActive={false}
          dot={{ r: 3, fill: "var(--chakra-colors-teal-500)" }}
          activeDot={{ r: 6 }}
          dataKey={chart.key("uv")}
          fill={chart.color("teal.solid")}
          stroke={chart.color("teal.solid")}
          strokeWidth={2}
        />
      </LineChart>
    </Chart.Root>
  );
};

export default ManyCoinDataChart;
