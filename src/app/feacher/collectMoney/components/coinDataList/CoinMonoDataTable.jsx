"use client";

import { useEffect, useState } from "react";
import { Table, Badge, Text, Box, Spinner } from "@chakra-ui/react";
import { createNowData } from "@/date";
import { createClient } from "@/utils/supabase/client";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import TableLoading from "@/app/feacher/partials/TableLoading";

const CoinMonoDataTable = ({ id }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    orderAmount,
    upOrder,
    page,
    selectedItemId,
    setSelectedItem,
    open,
    setOpen,
  } = useUploadPage();
  const PAGE_SIZE = 20;
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      setLoading(true);
      const { data: initialData, error: initialError } = await supabase
        .from("collect_funds")
        .select("*")
        .eq("laundryId", id)
        .order(orderAmount, { ascending: upOrder })
        .range(from, to);

      if (initialError) {
        setError(initialError.message);
        setData(null);
      } else {
        setData(initialData);
        setError(null);
      }
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`collect_funds_changes_for_${id}`)
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase, page, orderAmount, upOrder]);

  useEffect(() => {
    if (!open) {
      setSelectedItem(null);
    }
  }, [open]);

  const toggleHander = (item) => {
    setOpen(true);
    setSelectedItem(item);
  };

  if (loading) return <TableLoading />;
  if (error) return <div>エラー</div>;

  if (!data || data.length === 0) {
    return <div>エラー</div>;
  }
  return (
    <Table.Body>
      {data.map((item, index) => {
        const total = item.totalFunds;

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
            borderBottom={index === data.length - 1 ? "none" : "1px solid"}
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
