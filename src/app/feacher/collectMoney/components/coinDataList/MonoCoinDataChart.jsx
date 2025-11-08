import { useEffect, useState } from "react";
import { Chart, useChart } from "@chakra-ui/charts";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  Tooltip,
  XAxis,
} from "recharts";
import { createNowData } from "@/date";

const MonoCoinDataChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const newDataList = [...data].sort((a, b) => a.date - b.date);
    const dataList = newDataList.map((item) => {
      const total = item.fundsArray.reduce((accumulator, currentValue) => {
        return accumulator + parseInt(currentValue.funds);
      }, 0);
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
  });

  return (
    <Chart.Root maxH="md" chart={chart}>
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
        >
          <LabelList
            dataKey={chart.key("uv")}
            position="right"
            offset={10}
            style={{
              fontWeight: "600",
              fill: chart.color("fg"),
            }}
          />
        </Line>
      </LineChart>
    </Chart.Root>
  );
};

export default MonoCoinDataChart;
