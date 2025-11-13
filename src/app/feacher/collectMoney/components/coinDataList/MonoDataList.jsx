"use client";

import MoneyDataList from "./CoinDataList";
import { Spinner } from "@chakra-ui/react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const MonoDataList = ({ id, valiant }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [orderAmount, setOrderAmount] = useState("date");
  const [upOrder, setupOrder] = useState(true);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 20;
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      setLoading(true);
      const { data: initialData, error: initialError } = await supabase
        .from("collect_funds")
        .select("*")
        .eq("laundryId", id)
        .order(orderAmount, { ascending: upOrder })
        .range(from, to);

      if (initialError) {
        setError(initialError.message);
        setData(null);
      } else {
        setData(initialData);
        setError(null);
      }
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`collect_funds_changes_for_${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collect_funds",
          filter: `laundryId=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setData((currentData) => [...currentData, payload.new]);
          }
          if (payload.eventType === "UPDATE") {
            setData((currentData) =>
              currentData.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setData((currentData) =>
              currentData.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  if (loading) return <Spinner />;
  if (error) return <ErrorPage title={error} status={500} />;

  if (!data || data.length === 0) {
    return <ErrorPage title="集金データがありません" status={404} />;
  }

  return <MoneyDataList valiant={valiant} coinData={data} />;
};

export default MonoDataList;
