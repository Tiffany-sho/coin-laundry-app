"use client";

import { Box, Alert } from "@chakra-ui/react";
import { createNowData } from "@/functions/makeDate/date";
import { useEffect, useState } from "react";
import AlertDialog from "@/app/feacher/dialog/AlertDialog";
import {
  deleteData,
  updateDate,
} from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import EpochTimeSelector from "../../selectDate/SelectDate";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { showToast } from "@/functions/makeToast/toast";
import MachineAndFundsList from "./MachineAndFundsList";
import TotalFundsList from "./TotalFundsList";

const MoneyDataCard = () => {
  const { selectedItem, setSelectedItem, setOpen } = useUploadPage();
  const [totalFunds, setTotalFunds] = useState(selectedItem.totalFunds || 0);
  const [date, setDate] = useState(selectedItem.date);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!selectedItem) return;
    setTotalFunds(selectedItem.totalFunds || 0);
    setDate(selectedItem.date);
  }, [selectedItem]);

  const moveCursorToEnd = (e) => {
    const input = e.target;
    const length = input.value.length;
    setTimeout(() => {
      input.setSelectionRange(length, length);
    }, 0);
  };

  const validateNumberInput = (input) => {
    const regex = /\D/;
    if (regex.test(input)) {
      setMsg("数字以外の文字が含まれています");
      return false;
    }
    setMsg("");
    return true;
  };

  const submitDate = async (date) => {
    try {
      const result = await updateDate(date, selectedItem.id);

      if (result.error) {
        throw new Error("編集に失敗しました");
      }
      showToast(
        "success",
        `${selectedItem.laundryName}店(${createNowData(
          result.data.date
        )})に日付を更新しました`
      );
      setMsg("");
    } catch (error) {
      setMsg(error.message);
      showToast(
        "error",
        `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})に日付の更新に失敗しました`
      );
    }
  };

  const deleteAction = async () => {
    try {
      const result = await deleteData(selectedItem.id);

      if (result.error) {
        throw new Error(result.error.message || "削除に失敗しました");
      }
    } catch (error) {
      showToast(
        "warning",
        `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データを削除に失敗しました`
      );
    }

    setSelectedItem(null);
    setOpen(false);
    showToast(
      "warning",
      `${selectedItem.laundryName}店(${createNowData(
        selectedItem.date
      )})の集金データを削除しました`
    );
  };

  return (
    <Box>
      {msg && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Description>{msg}</Alert.Description>
        </Alert.Root>
      )}
      <EpochTimeSelector
        epoc={date}
        setEpoc={setDate}
        submitFunc={submitDate}
      />

      {selectedItem.fundsArray.length > 0 ? (
        <MachineAndFundsList
          moveCursorToEnd={moveCursorToEnd}
          validateNumberInput={validateNumberInput}
          totalFunds={totalFunds}
          setTotalFunds={setTotalFunds}
          setMsg={setMsg}
        />
      ) : (
        <TotalFundsList
          moveCursorToEnd={moveCursorToEnd}
          validateNumberInput={validateNumberInput}
          totalFunds={totalFunds}
          setTotalFunds={setTotalFunds}
          setMsg={setMsg}
        />
      )}

      <Box mt={6}>
        <AlertDialog
          target={`${selectedItem.laundryName}店(${createNowData(
            selectedItem.date
          )}`}
          deleteAction={deleteAction}
        />
      </Box>
    </Box>
  );
};

export default MoneyDataCard;
