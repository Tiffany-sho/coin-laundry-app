"use client";
import { useState, useEffect } from "react";
import FormCard from "@/app/coinLaundry/components/FormCard";

const Form = ({ id }) => {
  const [coinLaundry, setCoinLaundry] = useState("");

  useEffect(() => {
    const fetchCoinLaundryStore = async () => {
      try {
        const response = await fetch(`/api/coinLaundry/${id}`);
        if (!response.ok) {
          throw new Error("ネットワークにエラーが起きました");
        }
        const result = await response.json();
        if (result.success) {
          const findCoinLaundry = result.data;
          if (!findCoinLaundry) {
            throw new Error("データの取得に失敗しました");
          }
          setCoinLaundry(findCoinLaundry);
        }
      } catch (error) {
        console.error("実行が中断されました", error);
      }
    };
    fetchCoinLaundryStore();
  }, []);

  return (
    <>
      {coinLaundry && (
        <FormCard coinLaundry={coinLaundry} method="PUT" id={id} />
      )}
    </>
  );
};

export default Form;
