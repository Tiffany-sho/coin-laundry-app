"use client";

import { useEffect, useRef, useState } from "react";
import { Table, Badge, Text } from "@chakra-ui/react";
import { createNowData } from "@/date";
import { createClient } from "@/utils/supabase/client";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import TableLoading from "@/app/feacher/partials/TableLoading";
import TableError from "@/app/feacher/partials/TableError";

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
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
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
    return <TableError message="データがありません" />;
  }
  return (
    <Table.Body>
      {displayData.map((item, index) => {
        const total = item.totalFunds || 0;

        return (
          <Table.Row
            key={item.id}
            onClick={() => toggleHander(item)}
            bgColor={selectedItemId === item.id ? "blue.50" : "transparent"}
            cursor="pointer"
            _hover={{
              bgColor: selectedItemId === item.id ? "blue.100" : "gray.50",
              transform: "scale(1.01)",
            }}
            transition="all 0.2s"
            borderBottom={
              index === displayData.length - 1 ? "none" : "1px solid"
            }
            borderColor="gray.100"
          >
            <Table.Cell py={4}>
              <Text fontWeight="semibold" color="gray.800">
                {item.laundryName}店
              </Text>
            </Table.Cell>
            <Table.Cell textAlign="right">
              <Badge
                color={total > 200000 ? "green.600" : "gray.600"}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="bold"
              >
                ¥{total.toLocaleString()}
              </Badge>
            </Table.Cell>
            <Table.Cell textAlign="right">
              <Text fontSize="sm" color="gray.600">
                {createNowData(item.date)}
              </Text>
            </Table.Cell>
          </Table.Row>
        );
      })}
    </Table.Body>
  );
};

export default CoinMonoDataTable;
