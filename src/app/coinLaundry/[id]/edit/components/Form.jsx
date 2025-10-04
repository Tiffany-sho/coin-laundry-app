"use client";
import useSWR from "swr";
import FormCard from "@/app/coinLaundry/components/FormCard";

const Form = ({ id }) => {
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
  const { data, error } = useSWR(`/api/coinLaundry/${id}`, fetcher);

  if (error) {
    return (
      <div>
        failed to load {error.info.msg}:{error.status}
      </div>
    );
  }

  return <>{data && <FormCard coinLaundry={data} method="PUT" id={id} />}</>;
};

export default Form;
