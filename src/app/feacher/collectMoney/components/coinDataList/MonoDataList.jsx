"use client";
import useSWR from "swr";
import MoneyDataList from "./CoinDataList";
import { Spinner } from "@chakra-ui/react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorRes = await res.json();
    return {
      title: errorRes.msg,
      result: errorRes.result,
      status: res.status,
    };
  }
  return res.json();
};

const MonoDataList = ({ id, valiant }) => {
  const { data: coinData, isLoading } = useSWR(
    `/api/coinLaundry/${id}/collectMoney`,
    fetcher
  );
  if (isLoading) return <Spinner />;
  if (coinData.result === "failure")
    return <ErrorPage title={coinData.title} status={coinData.status} />;
  return <MoneyDataList valiant={valiant} coinData={coinData} />;
};

export default MonoDataList;
