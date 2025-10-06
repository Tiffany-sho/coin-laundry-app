"use client";

import CollectMoneyFormCard from "./CollectMoneyFormCard";
import useSWR from "swr";

const CollectMoneyForm = ({ id }) => {
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
    return <div>Loading...</div>;
  }

  return <CollectMoneyFormCard machines={data.machines} store={data.store} />;
};

export default CollectMoneyForm;
