"use client";
import { useState, useEffect } from "react";
import MonoSkeleton from "@/partials/MonoSkeleton";
import MonoCard from "@/partials/MonoCard";

const Mono = ({ id }) => {
  const [coinLaundry, setCoinLaundry] = useState();
  const [status, setStatus] = useState("pending");

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
        setStatus("succeeded");
      } catch (error) {
        console.error("実行が中断されました", error);
        setStatus("failed");
      }
    };
    fetchCoinLaundryStore();
  }, []);

  return (
    <>
      {status === "pending" && <MonoSkeleton />}
      {status === "failed" && <div>読み込み失敗</div>}
      {status === "succeeded" && coinLaundry !== undefined && (
        <MonoCard coinLaundry={coinLaundry} />
      )}
    </>
  );
};

export default Mono;
