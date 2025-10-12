"use client";

import useSWR from "swr";
import { useState } from "react";
import { HStack, Card, Heading, Box } from "@chakra-ui/react";
import MoneyDataTable from "@/app/coinLaundry/[id]/moneyData/components/MoneyDataTable";
import MoneyDataCard from "@/app/coinLaundry/[id]/moneyData/components/MoneyDataCard";

const MoneyDataList = ({ id }) => {
  const [selectedItem, setSelectedItem] = useState(null);

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
    <Card.Root size="lg">
      <Card.Header>
        <Heading size="2xl">集金データ一覧</Heading>
      </Card.Header>
      <Card.Body color="fg.muted">
        <HStack width="100%" spacing={4}>
          <Box w="100%" mb="auto" key="dataTable">
            <MoneyDataTable
              items={moneyData}
              selectedItemId={selectedItem?._id}
              onRowClick={setSelectedItem}
            />
          </Box>
          <Box w="1/3" key="dataCard">
            {selectedItem && (
              <MoneyDataCard
                item={selectedItem}
                laundryId={id}
                key={selectedItem._id}
              />
            )}
          </Box>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default MoneyDataList;
