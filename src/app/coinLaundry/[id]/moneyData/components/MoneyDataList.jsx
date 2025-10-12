"use client";

import useSWR from "swr";
import { useState } from "react";
import { HStack, Card, Heading, Box } from "@chakra-ui/react";
import MoneyDataTable from "@/app/coinLaundry/[id]/moneyData/components/MoneyDataTable";
import MoneyDataCard from "@/app/coinLaundry/[id]/moneyData/components/MoneyDataCard";

const MoneyDataList = ({ id }) => {
  const [dataToggle, setDataToggle] = useState([]);

  const fetcher = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
      const error = new Error("エラーが発生しました");
      error.info = await res.json();
      error.status = res.status;
      throw error;
    } else {
      const array = await res.json();
      const dataAndToggle = array.map((item) => {
        return {
          money: item,
          toggle: false,
        };
      });
      setDataToggle(dataAndToggle);
      return dataAndToggle;
    }
  };

  const { data, error, isLoading } = useSWR(
    `/api/coinLaundry/${id}/collectMoney`,
    fetcher
  );

  if (!isLoading && dataToggle.length === 0) {
    return <div>登録店舗は見つかりませんでした</div>;
  }

  if (error) {
    return <div>failed to load{data.message}</div>;
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
          <Box w="100%" key="dataTable">
            <MoneyDataTable
              items={dataToggle}
              setDatas={setDataToggle}
              laundryId={id}
            />
          </Box>
          {dataToggle.map((item) => {
            if (item.toggle) {
              return (
                <Box w="1/3" key="dataCard">
                  <MoneyDataCard
                    item={item.money}
                    key={item.money._id}
                    laundryId={id}
                  />
                </Box>
              );
            }
          })}
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default MoneyDataList;
