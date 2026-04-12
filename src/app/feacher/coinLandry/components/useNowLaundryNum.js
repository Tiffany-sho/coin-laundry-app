"use client";
import { useEffect, useState } from "react";
import {
  getLaundryState,
  updateStockState,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { showToast } from "@/functions/makeToast/toast";

export function useNowLaundryNum(id) {
  const [data, setData] = useState(null);
  const [detergent, setDetergent] = useState(0);
  const [softener, setSoftener] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: result, error } = await getLaundryState(id);
      if (!error && result) {
        setData(result);
        setDetergent(result.detergent ?? 0);
        setSoftener(result.softener ?? 0);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateStockState(id, { detergent, softener });
    if (error) {
      showToast("error", `${data.laundryName}店の在庫の更新に失敗しました`);
    } else {
      setData((prev) => ({ ...prev, detergent, softener }));
      showToast("success", `${data.laundryName}店の在庫を更新しました`);
    }
    setIsSaving(false);
  };

  const resetStock = () => {
    setDetergent(data.detergent);
    setSoftener(data.softener);
  };

  return { data, detergent, softener, setDetergent, setSoftener, isSaving, isLoading, handleSave, resetStock };
}
