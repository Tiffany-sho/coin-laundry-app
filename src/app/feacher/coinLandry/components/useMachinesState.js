"use client";
import { useEffect, useState } from "react";
import {
  getLaundryState,
  updateMachinesState,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { toaster } from "@/components/ui/toaster";
import { showToast } from "@/functions/makeToast/toast";

export function useMachinesState(id) {
  const [data, setData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [machines, setMachines] = useState([]);
  const [breakMachine, setBreakMachine] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const toastInfo = sessionStorage.getItem("toast");
      if (toastInfo) {
        toaster.create(JSON.parse(toastInfo));
      }
      sessionStorage.removeItem("toast");
    }, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: result, error } = await getLaundryState(id);
      if (!error && result) {
        setData(result);
        setMachines(result.machines ?? []);
        setBreakMachine(result.machines?.filter((m) => m.break) ?? []);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!data) return;
    setBreakMachine(data.machines.filter((machine) => machine.break));
  }, [data]);

  const changeMachineState = (e, machineId, action) => {
    setMachines((prev) =>
      prev.map((machine) => {
        if (action === "switch") {
          if (machine.id === machineId) {
            if (!e.checked && machine.comment) {
              return { ...machine, break: e.checked, comment: "" };
            }
            return { ...machine, break: e.checked };
          }
          return machine;
        } else if (action === "input") {
          if (machine.id === machineId) {
            return { ...machine, comment: e.target.value };
          }
          return machine;
        }
        return machine;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateMachinesState(id, machines);
    if (error) {
      showToast("error", `${data.laundryName}店の設備状態の更新に失敗しました`);
    } else {
      setData((prev) => ({ ...prev, machines }));
      showToast("success", `${data.laundryName}店の設備状態を更新しました`);
    }
    setIsSaving(false);
  };

  const resetMachines = () => setMachines(data.machines);

  return {
    data,
    isSaving,
    isLoading,
    machines,
    breakMachine,
    changeMachineState,
    handleSave,
    resetMachines,
  };
}
