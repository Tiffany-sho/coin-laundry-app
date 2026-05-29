"use client";

import { createContext, useContext, useState } from "react";
import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";

const UploadPageContext = createContext();

export const UploadPageProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFundsArrayLoading, setIsFundsArrayLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [displayBtn, setDisplayBtn] = useState(true);
  const [orderAmount, setOrderAmount] = useState("date");
  const [upOrder, setUpOrder] = useState(false);
  const [page, setPage] = useState(1);
  const [startEpoch, setStartEpoch] = useState(changeEpocFromNowYearMonth(-6));
  const [endEpoch, setEndEpoch] = useState(null);
  const [data, setData] = useState(null);

  const [displayData, setDisplayData] = useState([]);

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
    page,
    setPage,
    data,
    setData,
    displayData,
    setDisplayData,
    startEpoch,
    setStartEpoch,
    endEpoch,
    setEndEpoch,
    displayBtn,
    setDisplayBtn,
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
