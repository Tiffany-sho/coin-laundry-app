"use client";
import useSWR from "swr";
import MonoSkeleton from "@/app/coinLaundry/[id]/components/MonoSkeleton";
import MonoCard from "@/app/coinLaundry/[id]/components/components/MonoCard";
import DataList from "@/app/collectMoney/components/DataList/DataList";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

const Mono = ({ id }) => {
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
  const { data, error, isLoading } = useSWR(`/api/coinLaundry/${id}`, fetcher);

  if (error) {
    return (
      <div>
        failed to load {error.info.msg}:{error.status}
      </div>
    );
  }

  if (isLoading) {
    return <MonoSkeleton />;
  }

  return (
    <>
      <MonoCard coinLaundry={data} />
      <DataList filterItem={data._id} />
    </>
  );
};

export default Mono;
