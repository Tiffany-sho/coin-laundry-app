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
import { Spinner, Box, Text } from "@chakra-ui/react";

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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const total =
    payload.reduce((sum, entry) => sum + (entry.value || 0), 0) * 100;

  return (
    <Box
      bg="white"
      p={3}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      boxShadow="lg"
      minW="250px"
    >
      <Text fontWeight="bold" mb={2} fontSize="sm" color="gray.700">
        {label}
      </Text>

      {payload.map((entry, index) => {
        const monthTotal = entry.value * 100;
        return (
          <Box
            key={`item-${index}`}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py={1}
            borderBottom={index < payload.length - 1 ? "1px solid" : "none"}
            borderColor="gray.100"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box w="10px" h="10px" borderRadius="full" bg={entry.color} />
              <Text fontSize="xs" color="gray.600">
                {entry.name}:
              </Text>
            </Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.800">
              ¥{monthTotal.toLocaleString()}
            </Text>
          </Box>
        );
      })}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
        pt={2}
        borderTop="2px solid"
        borderColor="gray.300"
      >
        <Text fontSize="sm" fontWeight="bold" color="gray.700">
          合計:
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="blue.600">
          ¥{total.toLocaleString()}
        </Text>
      </Box>
    </Box>
  );
};

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
        obj[num.laundryName] = num.fundsArray.reduce(
          (accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.funds);
          },
          0
        );
        acc.push(obj);
      } else {
        if (existsObj[num.laundryName]) {
          existsObj[num.laundryName] =
            existsObj[num.laundryName] +
            num.fundsArray.reduce((accumulator, currentValue) => {
              return accumulator + parseInt(currentValue.funds);
            }, 0);
        } else {
          existsObj[num.laundryName] = num.fundsArray.reduce(
            (accumulator, currentValue) => {
              return accumulator + parseInt(currentValue.funds);
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
      const store = num.laundryName;
      const storeId = num.laundryId;
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
    const series = arraySeries.map((item) => {
      const obj = {
        name: item.name,
        color: item.color,
      };
      return obj;
    });
    setChartSeries(series);
  }, [data]);

  if (chartData.length === 0 || chartSeries.length === 0) {
    return <Spinner />;
  }

  return (
    <Chart.Root maxH="lg" chart={chart}>
      <LineChart data={chart.data}>
        <CartesianGrid stroke={chart.color("border")} vertical={false} />
        <XAxis
          height={25}
          axisLine={false}
          dataKey={chart.key("month")}
          tickFormatter={(value) => `${value.slice(5, 10)}月`}
          stroke={chart.color("border")}
        />
        <YAxis
          width={50}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          stroke={chart.color("border")}
          domain={["dataMin-100", "dataMax+100"]}
        />
        <Tooltip
          animationDuration={100}
          cursor={{ stroke: "#ccc", strokeWidth: 1, strokeDasharray: "5 5" }}
          content={<CustomTooltip />}
        />
        <Legend content={<Chart.Legend interaction="click" />} />
        {chart.series.map((item) => {
          return (
            <Line
              key={item.name}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              fill={chart.color(item.color)}
              stroke={chart.color(item.color)}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              opacity={chart.getSeriesOpacity(item.name)}
            />
          );
        })}
      </LineChart>
    </Chart.Root>
  );
};

export default ManyCoinDataChart;
