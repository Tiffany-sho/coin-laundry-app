"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card, Heading, Box } from "@chakra-ui/react";
import MoneyDataTable from "@/app/coinLaundry/[id]/moneyData/components/MoneyDataTable";
import MoneyDataCard from "@/app/coinLaundry/[id]/moneyData/components/MoneyDataCard";

const MoneyDataList = () => {
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
        <Card.Header>
          <Heading size="2xl">集金データ一覧</Heading>
        </Card.Header>
        <Card.Body color="fg.muted">
          <Box w="100%" mb="auto" key="dataTable">
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
            valiant="aStore"
            key={selectedItem._id}
          />
        )}
      </Box>
    </>
  );
};

export default MoneyDataList;
