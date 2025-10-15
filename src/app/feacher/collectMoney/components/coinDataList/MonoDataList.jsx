"use client";
import useSWR from "swr";
import MoneyDataList from "./CoinDataList";
import { Spinner, Text } from "@chakra-ui/react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const MonoDataList = ({ id, valiant }) => {
  const {
    data: coinData,
    error,
    isLoading,
  } = useSWR(`/api/coinLaundry/${id}/collectMoney`, fetcher);

  if (isLoading) return <Spinner />;
  if (error) return <Text>データの読み込みに失敗しました。</Text>;
  return <MoneyDataList valiant={valiant} coinData={coinData} />;
};

export default MonoDataList;
