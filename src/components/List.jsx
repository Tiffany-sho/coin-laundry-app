"use client";
import ListSkeleton from "@/components/ListSkeleton";
import ListCard from "@/components/ListCard";
import useSWR from "swr";
import { useEffect } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";

const List = ({ valiant = "default" }) => {
  useEffect(() => {
    setTimeout(() => {
      const toastInfo = sessionStorage.getItem("toast");

      if (toastInfo) {
        const toastInfoStr = JSON.parse(toastInfo);
        toaster.create(toastInfoStr);
      }
      sessionStorage.removeItem("toast");
    }, 0);
  }, []);

  const fetcher = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
      const error = new Error("エラーが発生しました");
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return res.json();
  };

  const { data, error, isLoading } = useSWR("/api/coinLaundry", fetcher);

  if (!isLoading && data.length === 0) {
    return <div>登録店舗は見つかりませんでした</div>;
  }

  if (error) {
    return <div>failed to load{data.message}</div>;
  }

  if (isLoading) {
    return <ListSkeleton />;
  }

  return (
    <>
      {data.map((coinLaundry) => {
        return (
          <div key={coinLaundry._id}>
            <ListCard coinLaundry={coinLaundry} valiant={valiant} />
          </div>
        );
      })}
    </>
  );
};

export default List;
