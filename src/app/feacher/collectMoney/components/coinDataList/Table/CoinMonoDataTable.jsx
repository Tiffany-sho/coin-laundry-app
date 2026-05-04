"use client";

import { useEffect, useRef, useState } from "react";
import { Table, Badge, Text, Box, HStack, VStack } from "@chakra-ui/react";
import { createNowData } from "@/functions/makeDate/date";
import { createClient } from "@/utils/supabase/client";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import TableLoading from "@/app/feacher/partials/TableLoading";
import TableError from "@/app/feacher/partials/TableError";
import TableEmpty from "@/app/feacher/partials/TableEmpty";
import { getStoreFundsPaginated } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const CoinMonoDataTable = ({ id, myRole }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const channelRef = useRef(null);

  const {
    PAGE_SIZE,
    orderAmount,
    upOrder,
    selectedItem,
    setSelectedItem,
    open,
    setOpen,
    displayData,
    setDisplayData,
    setDisplayBtn,
  } = useUploadPage();

  const selectedItemId = selectedItem?.id;

  useEffect(() => {
    if (!open) {
      setSelectedItem(null);
    }
  }, [open, setSelectedItem]);

  const toggleHander = (item) => {
    setOpen(true);
    setSelectedItem(item);
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const { data: initialData, error: initialError } = await getStoreFundsPaginated(
        id,
        orderAmount,
        upOrder,
        0,
        PAGE_SIZE - 1
      );

      if (initialError) {
        setError(initialError);
        setDisplayData(null);
      } else {
        setDisplayBtn(initialData.length >= PAGE_SIZE);
        setDisplayData(initialData);
        setError(null);
      }
      setLoading(false);
    };

    fetchData();

    // 閲覧者はリアルタイム不要（集金操作不可）
    if (myRole === "viewer") return;

    const channelName = `collect_funds_store_${id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collect_funds",
          filter: `laundryId=eq.${id}`,
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

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [id, orderAmount, upOrder, myRole]);

  if (loading) return <TableLoading />;
  if (error) return <TableError message={error} />;

  if (!displayData || displayData.length === 0) {
    return <TableEmpty />;
  }

  return (
    <Box bg="white" borderRadius="2xl" shadow="md" overflow="hidden">
      <Table.Root size="lg" variant="plain">
        <Table.Body>
          {displayData.map((item, index) => {
            const total = item.totalFunds || 0;
            const isSelected = selectedItemId === item.id;
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
                _active={{
                  transform: "translateX(2px)",
                }}
                borderBottom={
                  index === displayData.length - 1 ? "none" : "1px solid"
                }
                borderColor="gray.100"
              >

                <Table.Cell py={4} px={{ base: 4, md: 6 }}>
                  <HStack justify="space-between" align="center" gap={4}>
                    <Text
                      fontSize={{ base: "2xl", md: "3xl" }}
                      fontWeight="bold"
                      color={isHighValue ? "var(--teal-deeper, #155E75)" : "var(--text-main, #1E3A5F)"}
                      lineHeight="1.2"
                    >
                      ¥{total.toLocaleString()}
                    </Text>

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
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default CoinMonoDataTable;
