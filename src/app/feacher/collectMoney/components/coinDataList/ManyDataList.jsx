"use client";

import MoneyDataList from "./CoinDataList";
import { Spinner, Text } from "@chakra-ui/react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import PageLoading from "@/app/feacher/partials/Loading";

const ManyDataList = ({ valiant }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setLoading(true);
      const { data: initialData, error: initialError } = await supabase
        .from("collect_funds")
        .select("laundryId,totalFunds,date,laundryName")
        .eq("collecter", user.id);

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
      .channel(`collect_funds_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collect_funds",
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
  }, [supabase]);

  if (loading) return <PageLoading />;
  if (error) return <ErrorPage title={error} status={500} />;

  if (!data || data.length === 0) {
    return <ErrorPage title="集金データがありません" status={404} />;
  }
  return <MoneyDataList valiant={valiant} laundryData={data} />;
};

export default ManyDataList;
