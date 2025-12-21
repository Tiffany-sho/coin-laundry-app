"use client";

import { useEffect, useRef, useState } from "react";
import { Table, Text, Box, HStack, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { createNowData } from "@/functions/makeDate/date";
import { createClient } from "@/utils/supabase/client";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import TableLoading from "@/app/feacher/partials/TableLoading";
import TableError from "@/app/feacher/partials/TableError";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import TableEmpty from "@/app/feacher/partials/TableEmpty";

const CoinManyDataTable = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsedDates, setCollapsedDates] = useState(new Set());

  const {
    PAGE_SIZE,
    orderAmount,
    upOrder,
    selectedItemId,
    setSelectedItem,
    open,
    setOpen,
    displayData,
    setDisplayData,
    setDisplayBtn,
  } = useUploadPage();

  const supabase = createClient();
  const channelRef = useRef(null);

  const setupChannel = (user) => {
    const channelName = `collect_funds_changes_${user.id}`;
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
            setDisplayData((currentData) => [...currentData, payload.new]);
          }
          if (payload.eventType === "UPDATE") {
            setDisplayData((currentData) =>
              currentData.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setDisplayData((currentData) =>
              currentData.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  useEffect(() => {
    const fetchData = async () => {
      const { user } = await getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: initialData, error: initialError } = await supabase
        .from("collect_funds")
        .select("*")
        .eq("collecter", user.id)
        .order(orderAmount, { ascending: upOrder })
        .range(0, PAGE_SIZE - 1);

      if (initialError) {
        setError(initialError.message);
        setDisplayData(null);
      } else {
        if (initialData.length < PAGE_SIZE) {
          setDisplayBtn(false);
        } else {
          setDisplayBtn(true);
        }
        setDisplayData(initialData);
        setError(null);
      }
      setLoading(false);

      if (user) {
        setupChannel(user);
      }
    };

    fetchData();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase, orderAmount, upOrder]);

  useEffect(() => {
    if (!open) {
      setSelectedItem(null);
    }
  }, [open]);

  const toggleHander = (item) => {
    setOpen(true);
    setSelectedItem(item);
  };

  const toggleDateCollapse = (date) => {
    setCollapsedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const groupByDate = (data) => {
    if (!data) return {};

    const grouped = {};
    data.forEach((item) => {
      const dateKey = createNowData(item.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  };

  if (loading) return <TableLoading />;
  if (error) return <TableError message={error.message} />;

  if (!displayData || displayData.length === 0) {
    return <TableEmpty />;
  }

  const groupedData = groupByDate(displayData);
  const dates = Object.keys(groupedData);

  return (
    <VStack spacing={4} align="stretch">
      {dates.map((date) => {
        const items = groupedData[date];
        const totalForDate = items.reduce(
          (sum, item) => sum + (item.totalFunds || 0),
          0
        );
        const storeCount = items.length;
        const isCollapsed = collapsedDates.has(date);

        return (
          <Box
            key={date}
            bg="white"
            borderRadius="2xl"
            shadow="md"
            overflow="hidden"
          >
            <Box
              bg="gray.50"
              p={4}
              cursor="pointer"
              onClick={() => toggleDateCollapse(date)}
              transition="all 0.2s"
              _hover={{ bg: "blue.100" }}
            >
              <HStack justify="space-between">
                <HStack gap={3}>
                  <Box
                    bg="gray.500"
                    color="white"
                    borderRadius="lg"
                    p={2}
                    fontSize="xl"
                  >
                    <Icon.LuCalendar />
                  </Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      {date}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {storeCount}店舗
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={4}>
                  <VStack align="flex-end" gap={0}>
                    <Text fontSize="xs" color="gray.600">
                      合計
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      ¥{totalForDate.toLocaleString()}
                    </Text>
                  </VStack>
                  <Text fontSize="xl" color="gray.400">
                    {isCollapsed ? "▼" : "▲"}
                  </Text>
                </HStack>
              </HStack>
            </Box>

            {!isCollapsed && (
              <Table.Root size="lg" variant="plain">
                <Table.Body>
                  {items.map((item, index) => {
                    const total = item.totalFunds || 0;
                    const isSelected = selectedItemId === item.id;
                    const isHighValue = total > 200000;

                    return (
                      <Table.Row
                        key={item.id}
                        onClick={() => toggleHander(item)}
                        bg={isSelected ? "blue.50" : "white"}
                        cursor="pointer"
                        position="relative"
                        transition="all 0.2s ease"
                        _hover={{
                          bg: isSelected ? "blue.100" : "gray.50",
                          transform: "translateX(4px)",
                        }}
                        _active={{
                          transform: "translateX(2px)",
                        }}
                        borderBottom={
                          index === items.length - 1 ? "none" : "1px solid"
                        }
                        borderColor="gray.100"
                      >
                        {isSelected && (
                          <Box
                            position="absolute"
                            left="0"
                            top="0"
                            bottom="0"
                            width="4px"
                            bg="blue.500"
                            borderRadius="0 4px 4px 0"
                          />
                        )}

                        <Table.Cell py={4} px={{ base: 4, md: 6 }}>
                          <HStack
                            justify="space-between"
                            align="center"
                            gap={4}
                          >
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
                                color={isHighValue ? "green.600" : "gray.800"}
                                lineHeight="1.2"
                              >
                                ¥{total.toLocaleString()}
                              </Text>
                            </VStack>

                            <VStack align="flex-end" gap={1}>
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
                  })}
                </Table.Body>
              </Table.Root>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

export default CoinManyDataTable;
