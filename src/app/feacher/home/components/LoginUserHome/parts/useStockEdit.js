"use client";
import { useState } from "react";
import { updateStockState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { showToast } from "@/functions/makeToast/toast";

export function useStockEdit(initialData) {
  const [currentData, setCurrentData] = useState(initialData);
  const [detergent, setDetergent] = useState(initialData.detergent);
  const [softener, setSoftener] = useState(initialData.softener);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateStockState(initialData.laundryId, { detergent, softener });
    if (error) {
      showToast("error", `${currentData.laundryName}店の在庫の更新に失敗しました`);
    } else {
      setCurrentData((prev) => ({ ...prev, detergent, softener }));
      showToast("success", `${currentData.laundryName}店の在庫を更新しました`);
    }
    setIsSaving(false);
  };

  const resetStock = () => {
    setDetergent(currentData.detergent);
    setSoftener(currentData.softener);
  };

  return { currentData, detergent, softener, setDetergent, setSoftener, isSaving, handleSave, resetStock };
}
