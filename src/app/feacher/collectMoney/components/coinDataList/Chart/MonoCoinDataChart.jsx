import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, useChart } from "@chakra-ui/charts";
import { Box } from "@chakra-ui/react";
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
import { createClient } from "@/utils/supabase/client";
import ChartError from "@/app/feacher/partials/ChartError";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import ChartEmpty from "@/app/feacher/partials/ChartEmpty";

// "YYYY-MM" → Y軸用フォーマット（万円単位）
const formatYAxis = (value) => {
  if (value === 0) return "0";
  if (value >= 100000000) return `${(value / 100000000).toFixed(0)}億`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}万`;
  return `${value}`;
};

// X軸カスタムTick：各年で最初に登場する月に西暦を上段に表示
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

// カスタムTooltip
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

const MonoCoinDataChart = ({ id }) => {
  const { data, setData } = useUploadPage();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const { startEpoch, endEpoch } = useUploadPage();

  // useMemo で安定したインスタンスを保持し、useEffect の無限ループを防ぐ
  const supabase = useMemo(() => createClient(), []);

  const channelRef = useRef(null);

  const setupChannel = (user) => {
    const channelName = `collect_funds_MonoChart_${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collect_funds",
          filter: `collecter=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setData((currentData) => [...currentData, payload.new]);
          }
          if (payload.eventType === "UPDATE") {
            setData((currentData) =>
              currentData.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setData((currentData) =>
              currentData.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  useEffect(() => {
    const fetchData = async (id) => {
      const { user } = await getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      let query = supabase
        .from("collect_funds")
        .select("*")
        .eq("laundryId", id)
        .eq("collecter", user.id)
        .order("date", { ascending: true })
        .gt("date", startEpoch);

      if (endEpoch !== null) {
        query = query.lt("date", endEpoch);
      }

      const { data: initialData, error: initialError } = await query;

      if (initialError) {
        setError(initialError.message);
        setData(null);
      } else {
        setData(initialData);
        setError(null);
      }
      setLoading(false);

      if (user) {
        setupChannel(user);
      }
    };

    fetchData(id);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
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

  // 各年で最初に登場する月の "YYYY-MM" を収集
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
    <Box w="100%" h="300px" overflow="hidden">
    <Chart.Root h="100%" chart={chart}>
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
    </Box>
  );
};

export default MonoCoinDataChart;
