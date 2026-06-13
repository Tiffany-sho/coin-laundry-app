"use client";

import { useEffect, useState } from "react";
import { Table, Text, Box, HStack, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { createNowData, getYearMonth } from "@/functions/makeDate/date";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import TableLoading from "@/app/feacher/partials/TableLoading";
import TableError from "@/app/feacher/partials/TableError";
import TableEmpty from "@/app/feacher/partials/TableEmpty";
import { getOrgCollectFundsInPeriod, getFundItemById } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";

const CoinManyDataTable = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsedMonths, setCollapsedMonths] = useState(new Set());

  const {
    orderAmount,
    upOrder,
    selectedItem,
    setSelectedItem,
    setIsFundsArrayLoading,
    open,
    setOpen,
    displayData,
    setDisplayData,
    setDisplayBtn,
    setTableMonthsBack,
  } = useUploadPage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startEpoch = changeEpocFromNowYearMonth(-2);
      const { data: initialData, error: initialError } = await getOrgCollectFundsInPeriod(
        startEpoch,
        null,
        orderAmount,
        upOrder
      );

      if (initialError) {
        setError(initialError);
        setDisplayData(null);
      } else {
        setDisplayBtn(initialData.length > 0);
        setDisplayData(initialData);
        setTableMonthsBack(2);
        setError(null);
      }
      setLoading(false);
    };

    fetchData();
  }, [orderAmount, upOrder]);

  useEffect(() => {
    if (!open) {
      setSelectedItem(null);
    }
  }, [open]);

  const toggleHander = async (item) => {
    setOpen(true);
    setSelectedItem(item);
    setIsFundsArrayLoading(true);
    const { data } = await getFundItemById(item.id);
    if (data) {
      setSelectedItem({ ...item, fundsArray: data.fundsArray });
    }
    setIsFundsArrayLoading(false);
  };

  const toggleMonthCollapse = (month) => {
    setCollapsedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(month)) {
        newSet.delete(month);
      } else {
        newSet.add(month);
      }
      return newSet;
    });
  };

  const formatMonth = (yearMonthStr) => {
    const [year, month] = yearMonthStr.split("-");
    return `${year}年${parseInt(month)}月`;
  };

  const groupByMonth = (data) => {
    if (!data) return {};
    const grouped = {};
    data.forEach((item) => {
      const monthKey = getYearMonth(item.date);
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(item);
    });
    return grouped;
  };

  const renderRow = (item, index, items) => {
    const total = item.totalFunds || 0;
    const isSelected = selectedItem?.id === item.id;
    const isHighValue = total > 200000;

    return (
      <Table.Row
        key={item.id}
        onClick={() => toggleHander(item)}
        bg={isSelected ? "cyan.50" : "white"}
        cursor="pointer"
        transition="all 0.2s ease"
        borderLeft="4px solid"
        borderLeftColor={isSelected ? "var(--teal, #0891B2)" : "transparent"}
        _hover={{
          bg: isSelected ? "cyan.100" : "cyan.50",
          transform: "translateX(4px)",
        }}
        _active={{ transform: "translateX(2px)" }}
        borderBottom={index === items.length - 1 ? "none" : "1px solid"}
        borderColor="gray.100"
      >
        <Table.Cell py={4} px={{ base: 4, md: 6 }}>
          <HStack justify="space-between" align="center" gap={4}>
            <VStack align="flex-start" gap={1} flex="1">
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="semibold"
                color="gray.700"
              >
                {item.laundryName}店
              </Text>
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                color={isHighValue ? "var(--teal-deeper, #155E75)" : "var(--text-main, #1E3A5F)"}
                lineHeight="1.2"
              >
                ¥{total.toLocaleString()}
              </Text>
            </VStack>
            <VStack align="flex-end" gap={1}>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                color="gray.600"
                fontWeight="medium"
              >
                {createNowData(item.date)}
              </Text>
              <Text
                fontSize="xs"
                color="gray.400"
                display={{ base: "none", sm: "block" }}
              >
                タップして詳細
              </Text>
            </VStack>
          </HStack>
        </Table.Cell>
      </Table.Row>
    );
  };

  if (loading) return <TableLoading />;
  if (error) return <TableError message={error.message} />;

  if (!displayData || displayData.length === 0) {
    return <TableEmpty />;
  }

  // 日付順以外はグループなしのフラットリスト
  if (orderAmount !== "date") {
    return (
      <Box bg="var(--card-bg, #FFFFFF)" borderRadius="2xl" shadow="md" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="lg" variant="plain">
            <Table.Body>
              {displayData.map((item, index) => renderRow(item, index, displayData))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    );
  }

  // 日付順のときは月ごとにグループ化
  const groupedData = groupByMonth(displayData);
  const months = Object.keys(groupedData);

  return (
    <VStack spacing={4} align="stretch">
      {months.map((month) => {
        const items = groupedData[month];
        const totalForMonth = items.reduce(
          (sum, item) => sum + (item.totalFunds || 0),
          0
        );
        const isCollapsed = collapsedMonths.has(month);

        return (
          <Box
            key={month}
            bg="var(--card-bg, #FFFFFF)"
            borderRadius="2xl"
            shadow="md"
            overflow="hidden"
          >
            <Box
              bg="cyan.50"
              p={4}
              cursor="pointer"
              onClick={() => toggleMonthCollapse(month)}
              transition="all 0.2s"
              _hover={{ bg: "cyan.100" }}
            >
              <HStack justify="space-between">
                <HStack gap={3}>
                  <Box
                    bg="var(--teal, #0891B2)"
                    color="white"
                    borderRadius="lg"
                    p={2}
                    fontSize="xl"
                  >
                    <Icon.LuCalendar />
                  </Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      {formatMonth(month)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {items.length}件
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={4}>
                  <VStack align="flex-end" gap={0}>
                    <Text fontSize="xs" color="gray.600">
                      合計
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="var(--teal, #0891B2)">
                      ¥{totalForMonth.toLocaleString()}
                    </Text>
                  </VStack>
                  <Box color="gray.400" fontSize="xl">
                    {isCollapsed ? <Icon.LuChevronDown /> : <Icon.LuChevronUp />}
                  </Box>
                </HStack>
              </HStack>
            </Box>

            {!isCollapsed && (
              <Box overflowX="auto">
                <Table.Root size="lg" variant="plain">
                  <Table.Body>
                    {items.map((item, index) => renderRow(item, index, items))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

export default CoinManyDataTable;
