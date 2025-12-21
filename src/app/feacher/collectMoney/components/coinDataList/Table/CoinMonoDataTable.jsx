"use client";

import { useEffect, useRef, useState } from "react";
import { Table, Badge, Text, Box, HStack, VStack } from "@chakra-ui/react";
import { createNowData } from "@/functions/makeDate/date";
import { createClient } from "@/utils/supabase/client";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import TableLoading from "@/app/feacher/partials/TableLoading";
import TableError from "@/app/feacher/partials/TableError";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import TableEmpty from "@/app/feacher/partials/TableEmpty";

const CoinMonoDataTable = ({ id }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const channelRef = useRef(null);

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

    const setupChannel = (id, user) => {
      const channelName = `collect_funds_changes_for_${id}_user_${user.id}`;
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

    const fetchData = async (id) => {
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

      if (id && user) {
        setupChannel(id, user);
      }
    };

    fetchData(id);
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [id, orderAmount, upOrder, setSelectedItem]);

  if (loading) return <TableLoading />;
  if (error) return <TableError message={error.message} />;

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
                  index === displayData.length - 1 ? "none" : "1px solid"
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
                  <HStack justify="space-between" align="center" gap={4}>
                    <Text
                      fontSize={{ base: "2xl", md: "3xl" }}
                      fontWeight="bold"
                      color={isHighValue ? "green.600" : "gray.800"}
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
