"use client";

import useSWR from "swr";
import { useState } from "react";
import {
  Card,
  Heading,
  HStack,
  Box,
  Portal,
  Select,
  createListCollection,
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

const MoneyDataList = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [value, setValue] = useState("older");

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
  } = useSWR(`/api/collectMoney`, fetcher);

  console.log(moneyData);

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
      <Card.Root size="lg" w={selectedItem ? "2/3" : "100%"}>
        <HStack>
          <Heading size="2xl">集金データ一覧</Heading>
          <Select.Root
            collection={frameworks}
            width="120px"
            ml="auto"
            deefaultvalue={["older"]}
            onValueChange={(e) => setValue(e.value)}
          >
            <Select.HiddenSelect />
            <Select.Label>並び替え</Select.Label>
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
                      {framework.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </HStack>
        <Card.Body color="fg.muted">
          <Box w="100%" mb="auto" key="dataTable">
            <MoneyDataTable
              items={moneyData}
              selectedItemId={selectedItem?._id}
              onRowClick={setSelectedItem}
              order={value}
            />
          </Box>
        </Card.Body>
      </Card.Root>
      <Box w="1/3" key="dataCard">
        {selectedItem && (
          <MoneyDataCard
            item={selectedItem}
            onRowClick={setSelectedItem}
            valiant="aStore"
            key={selectedItem._id}
          />
        )}
      </Box>
    </>
  );
};

export default MoneyDataList;
