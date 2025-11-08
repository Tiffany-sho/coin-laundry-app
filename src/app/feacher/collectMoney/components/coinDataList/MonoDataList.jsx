"use client";

import MoneyDataList from "./CoinDataList";
import { Spinner } from "@chakra-ui/react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const getData = async (id) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .select("*")
    .eq("laundryId", id);
  if (error) {
    console.log(error);
    return {
      error: error.message,
    };
  }
  return { data: data };
};

const MonoDataList = ({ id, valiant }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
    }
    const fetchData = async () => {
      const result = await getData(id);
      console.log(result);
      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
        setError(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);
  if (loading) return <Spinner />;
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return <MoneyDataList valiant={valiant} coinData={data} />;
};

export default MonoDataList;
