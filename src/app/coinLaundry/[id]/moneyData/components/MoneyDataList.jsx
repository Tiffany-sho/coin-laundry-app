"use client";

import useSWR from "swr";
import { useState } from "react";
import {
  Portal,
  Select,
  createListCollection,
  Card,
  Stack,
  Heading,
  Box,
  HStack,
} from "@chakra-ui/react";
import MoneyDataTable from "@/app/coinLaundry/[id]/moneyData/components/MoneyDataTable";
import MoneyDataCard from "@/app/coinLaundry/[id]/moneyData/components/MoneyDataCard";
const frameworks = createListCollection({
  items: [
    { label: "新しい順", value: "newer" },
    { label: "古い順", value: "older" },
    { label: "店舗別順", value: "store" },
    { label: "売上順", value: "income" },
  ],
});

const MoneyDataList = ({ id }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [order, setOrder] = useState("react");

  const fetcher = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
      const error = new Error("エラーが発生しました");
      error.info = await res.json();
      error.status = res.status;
      throw error;
    } else {
      const data = await res.json();
      return data;
    }
  };

  const {
    data: moneyData,
    error,
    isLoading,
  } = useSWR(`/api/coinLaundry/${id}/collectMoney`, fetcher);

  if (!isLoading && moneyData.length === 0) {
    return <div>登録店舗は見つかりませんでした</div>;
  }

  if (error) {
    return <div>failed to load{moneyData.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card.Root size="lg" w={selectedItem ? "2/3" : "100%"} mt="5%">
        <Card.Header>
          <HStack>
            <Heading size="2xl">集金データ一覧</Heading>
            <Select.Root
              collection={frameworks}
              size="sm"
              width="120px"
              ml="auto"
              defaultValue={["newer"]}
              onValueChange={(e) => setOrder(e.value)}
            >
              <Select.HiddenSelect />
              <Select.Label>Select plan</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="新しい順" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {frameworks.items.map((framework) => (
                      <Select.Item item={framework} key={framework.value}>
                        <Stack gap="0">
                          <Select.ItemText>{framework.label}</Select.ItemText>
                        </Stack>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </HStack>
        </Card.Header>
        <Card.Body color="fg.muted">
          <Box key="dataTable">
            <MoneyDataTable
              items={moneyData}
              selectedItemId={selectedItem?._id}
              onRowClick={setSelectedItem}
            />
          </Box>
        </Card.Body>
      </Card.Root>
      <Box w="1/3" key="dataCard">
        {selectedItem && (
          <MoneyDataCard
            item={selectedItem}
            onRowClick={setSelectedItem}
            valiant="manyStore"
            key={selectedItem._id}
          />
        )}
      </Box>
    </>
  );
};

export default MoneyDataList;
