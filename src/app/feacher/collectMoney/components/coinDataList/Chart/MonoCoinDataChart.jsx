import { useEffect, useRef, useState } from "react";
import { Chart, useChart } from "@chakra-ui/charts";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  changeEpocFromNowYearMonth,
  createNowData,
} from "@/functions/makeDate/date";
import ChartLoading from "@/app/feacher/partials/ChartLoading";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { createClient } from "@/utils/supabase/client";
import ChartError from "@/app/feacher/partials/ChartError";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import ChartEmpty from "@/app/feacher/partials/ChartEmpty";

const MonoCoinDataChart = ({ id }) => {
  const { data, setData } = useUploadPage();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const { period } = useUploadPage();

  const supabase = createClient();

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
      let orderPeriod;
      if (period === "３ヶ月") {
        orderPeriod = changeEpocFromNowYearMonth(-3);
      } else if (period === "１年間") {
        orderPeriod = changeEpocFromNowYearMonth(-12);
      } else {
        orderPeriod = 0;
      }
      const { user } = await getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: initialData, error: initialError } = await supabase
        .from("collect_funds")
        .select("*")
        .eq("laundryId", id)
        .eq("collecter", user.id)
        .gt("date", orderPeriod);

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
  }, [supabase, period]);

  useEffect(() => {
    if (!data) return;
    const newDataList = [...data].sort((a, b) => a.date - b.date);
    const dataList = newDataList.map((item) => {
      const total = item.totalFunds;
      const newObj = {
        name: createNowData(item.date),
        uv: total,
      };
      return newObj;
    });
    setChartData(dataList);
  }, [data]);

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
      <LineChart data={chart.data} margin={{ left: 40, right: 40, top: 40 }}>
        <CartesianGrid
          stroke={chart.color("border")}
          strokeDasharray="3 3"
          horizontal={false}
        />
        <XAxis
          dataKey={chart.key("name")}
          tickFormatter={(value) => value.slice(5, 10)}
          stroke={chart.color("border")}
        />
        <YAxis
          width={25}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          stroke={chart.color("border")}
        />
        <Tooltip
          animationDuration={100}
          cursor={{ stroke: chart.color("border") }}
          content={<Chart.Tooltip hideLabel />}
        />
        <Line
          isAnimationActive={false}
          dataKey={chart.key("uv")}
          fill={chart.color("teal.solid")}
          stroke={chart.color("teal.solid")}
          strokeWidth={2}
        ></Line>
      </LineChart>
    </Chart.Root>
  );
};

export default MonoCoinDataChart;
