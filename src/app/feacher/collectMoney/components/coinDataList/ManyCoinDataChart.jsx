import { Chart, useChart } from "@chakra-ui/charts";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getYearMonth } from "@/date";
import { useEffect, useState } from "react";

const lineColor = [
  "red.solid",
  "purple.solid",
  "blue.solid",
  "green.solid",
  "yellow.solid",
  "orange.solid",
  "pink.solid",
  "teal.solid",
  "cyan.solid",
  "gray.solid",
  "indigo.solid",
  "lime.solid",
  "emerald.solid",
  "sky.solid",
  "violet.solid",
  "fuchsia.solid",
  "rose.solid",
  "brown.solid",
];

const ManyCoinDataChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const chart = useChart({
    data: chartData,
    series: chartSeries,
  });

  useEffect(() => {
    if (!data) return;

    const newDataList = [...data].sort((a, b) => a.date - b.date);
    const arrayDate = newDataList.reduce((acc, num) => {
      const month = getYearMonth(num.date);
      const existsObj = acc.find((item) => item.month === month);

      if (!existsObj) {
        const obj = {
          month,
        };
        obj[num.store] = num.moneyArray.reduce((accumulator, currentValue) => {
          return accumulator + parseInt(currentValue.money);
        }, 0);
        acc.push(obj);
      } else {
        if (existsObj[num.store]) {
          existsObj[num.store] =
            existsObj[num.store] +
            num.moneyArray.reduce((accumulator, currentValue) => {
              return accumulator + parseInt(currentValue.money);
            }, 0);
        } else {
          existsObj[num.store] = num.moneyArray.reduce(
            (accumulator, currentValue) => {
              return accumulator + parseInt(currentValue.money);
            },
            0
          );
        }
      }
      return acc;
    }, []);
    setChartData(arrayDate);

    let i = 0;

    const arraySeries = newDataList.reduce((acc, num) => {
      const store = num.store;
      const storeId = num.storeId;
      const alreadyObj = acc.some((item) => item.nameId === storeId);
      if (!alreadyObj) {
        const obj = {
          name: store,
          nameId: storeId,
          color: lineColor[i],
        };
        acc.push(obj);
        i = i + 1;
      }
      return acc;
    }, []);

    setChartSeries(arraySeries);
  }, [data]);

  return (
    <Chart.Root maxH="sm" chart={chart}>
      <LineChart data={chart.data}>
        <CartesianGrid stroke={chart.color("border")} vertical={false} />
        <XAxis
          axisLine={false}
          dataKey={chart.key("month")}
          tickFormatter={(value) => `${value.slice(5, 10)}月`}
          stroke={chart.color("border")}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          stroke={chart.color("border")}
        />
        <Tooltip
          animationDuration={100}
          cursor={false}
          content={<Chart.Tooltip />}
        />
        <Legend content={<Chart.Legend />} />
        {chart.series.map((item) => (
          <Line
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            fill={chart.color(item.color)}
            stroke={chart.color(item.color)}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </Chart.Root>
  );
};

export default ManyCoinDataChart;
