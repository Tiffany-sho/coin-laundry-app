"use client";

import { createContext, useContext, useState } from "react";
import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";
import { initialLimit } from "@/functions/fundHistory";

const UploadPageContext = createContext();

export const UploadPageProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFundsArrayLoading, setIsFundsArrayLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [orderAmount, setOrderAmount] = useState("date");
  const [upOrder, setUpOrder] = useState(false);
  /**
   * 売上履歴で一度に出す量。日付順なら月数、売上順なら件数。
   *
   * ⚠️ **これは表示量であって取得範囲ではない。** 2026-08-03 まで
   *    「2 か月ずつ取りに行く」作りで、**並び替えが読み込んだ窓の中で閉じていた。**
   *    取得は常に全期間で、ここは切り詰めるだけにすること。
   */
  const [historyLimit, setHistoryLimit] = useState(initialLimit(true));
  const [startEpoch, setStartEpoch] = useState(changeEpocFromNowYearMonth(-6));
  const [endEpoch, setEndEpoch] = useState(null);
  const [data, setData] = useState(null);
  const [displayData, setDisplayData] = useState([]);
  const [storeNames, setStoreNames] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  /** 売上履歴の集金者絞り込み。null = 全員。⚠️ 表示だけの話で取得範囲は変えない */
  const [collecter, setCollecter] = useState(null);

  const PAGE_SIZE = 20;

  const value = {
    PAGE_SIZE,
    selectedItem,
    setSelectedItem,
    isFundsArrayLoading,
    setIsFundsArrayLoading,
    open,
    setOpen,
    orderAmount,
    setOrderAmount,
    upOrder,
    setUpOrder,
    historyLimit,
    setHistoryLimit,
    data,
    setData,
    displayData,
    setDisplayData,
    startEpoch,
    setStartEpoch,
    endEpoch,
    setEndEpoch,
    storeNames,
    setStoreNames,
    selectedStores,
    setSelectedStores,
    collecter,
    setCollecter,
  };

  return (
    <UploadPageContext.Provider value={value}>
      {children}
    </UploadPageContext.Provider>
  );
};

export const useUploadPage = () => {
  return useContext(UploadPageContext);
};
