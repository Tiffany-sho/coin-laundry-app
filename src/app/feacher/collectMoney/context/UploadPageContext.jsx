"use client";

import { createContext, useContext, useState } from "react";

const UploadPageContext = createContext();

export const UploadPageProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);

  const [orderAmount, setOrderAmount] = useState("date");
  const [upOrder, setUpOrder] = useState(false);
  const [page, setPage] = useState(0);

  const value = {
    selectedItem,
    setSelectedItem,
    open,
    setOpen,
    orderAmount,
    setOrderAmount,
    upOrder,
    setUpOrder,
    page,
    setPage,
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
