"use client";
import { useEffect, useState } from "react";
import { updateMachinesState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { toaster } from "@/components/ui/toaster";
import { showToast } from "@/functions/makeToast/toast";

export function useMachinesEdit(initialData) {
  const [data, setData] = useState(initialData);
  const [machines, setMachines] = useState(initialData.machines);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const toastInfo = sessionStorage.getItem("toast");
      if (toastInfo) toaster.create(JSON.parse(toastInfo));
      sessionStorage.removeItem("toast");
    }, 0);
  }, []);

  const breakMachine = data.machines.filter((m) => m.break);

  const changeMachineState = (e, machineId, action) => {
    setMachines((prev) =>
      prev.map((machine) => {
        if (action === "switch") {
          if (machine.id !== machineId) return machine;
          if (!e.checked && machine.comment) {
            return { ...machine, break: e.checked, comment: "" };
          }
          return { ...machine, break: e.checked };
        } else if (action === "input") {
          if (machine.id !== machineId) return machine;
          return { ...machine, comment: e.target.value };
        }
        return machine;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateMachinesState(initialData.laundryId, machines);
    if (error) {
      showToast("error", `${data.laundryName}店の設備状態の更新に失敗しました`);
    } else {
      setData((prev) => ({ ...prev, machines }));
      showToast("success", `${data.laundryName}店の設備状態を更新しました`);
    }
    setIsSaving(false);
  };

  const resetMachines = () => setMachines(data.machines);

  return { data, machines, isSaving, breakMachine, changeMachineState, handleSave, resetMachines };
}
