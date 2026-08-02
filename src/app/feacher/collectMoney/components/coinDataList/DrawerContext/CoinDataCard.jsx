"use client";

import { Box, Alert, Text, Spinner } from "@chakra-ui/react";
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
import CashlessList from "./CashlessList";
import { updateData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import {
  cashPortion,
  hasMachineCashless,
  sumCashless,
} from "@/functions/cashlessMath";

const MoneyDataCard = ({ myRole }) => {
  const { selectedItem, setSelectedItem, setOpen, isFundsArrayLoading } = useUploadPage();
  /**
   * ⚠️ **これは「現金ぶん」。総額ではない。**
   *    `collect_funds.totalFunds` は総額（現金 + キャッシュレス）だが、
   *    `updateData` が受け取る `totalFunds` は現金ぶんで、サーバがキャッシュレスを
   *    足して総額を組み直す。**総額をそのまま入れて保存すると、保存のたびに
   *    キャッシュレスぶんだけ総額が増えていく**（2026-08-02 まで実際にそうなっていた）。
   */
  const [cashFunds, setCashFunds] = useState(() => cashPortion(selectedItem));
  const [date, setDate] = useState(selectedItem.date);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!selectedItem) return;
    setCashFunds(cashPortion(selectedItem));
    setDate(selectedItem.date);
  }, [selectedItem]);

  const cashless = selectedItem.cashless ?? [];
  const cashlessSum = sumCashless(cashless);
  /** 画面に出す総額。⚠️ 現金ぶんだけ出すと一覧の金額と食い違う */
  const displayTotal = cashFunds + cashlessSum;
  /*
    ⚠️ **機器ごとの内訳を持つ集金では、集金レベルの `cashless` を編集させない。**
       あちらは `fundsArray[].cashless` からサーバが組み直す派生値なので、
       ここで上書きすると機器ごとの内訳と食い違う。
  */
  const perMachineMode = hasMachineCashless(selectedItem.fundsArray);

  /** キャッシュレスの内訳だけを保存する。⚠️ 現金ぶんは今の値をそのまま送る */
  const submitCashless = async (entries) => {
    try {
      const result = await updateData(
        selectedItem.fundsArray ?? [],
        cashFunds,
        selectedItem.id,
        entries
      );
      if (result.error) throw new Error("編集に失敗しました");
      /*
        ⚠️ **`changed` を見る。** 非 admin が他人の集金データを編集すると
           0 行更新の 200 が返る（docs/contracts.md の「既知の未対応」）。
           error だけ見ていると、起きていない更新を成功と表示してしまう。
      */
      if (result.changed === 0) throw new Error("この集金データを編集する権限がありません");

      setSelectedItem((item) => ({
        ...item,
        cashless: entries.map((entry) => ({
          ...entry,
          // 表示用。サーバは methodId から名前を引き直すので、次に開けば正になる
          name: cashless.find((c) => String(c.methodId) === String(entry.methodId))?.name,
        })),
        totalFunds: cashFunds + entries.reduce((acc, e) => acc + e.amount, 0),
      }));
      setMsg("");
      showToast(
        "success",
        `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データを更新しました`
      );
    } catch (error) {
      setMsg(error.message);
      showToast(
        "error",
        `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データの更新に失敗しました`
      );
    }
  };

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
    const storeName = selectedItem.laundryName;
    const dateStr = createNowData(selectedItem.date);
    const result = await deleteData(selectedItem.id);

    if (result.error) {
      showToast("error", `${storeName}店(${dateStr})の集金データの削除に失敗しました`);
      return;
    }

    setSelectedItem(null);
    setOpen(false);
    showToast("warning", `${storeName}店(${dateStr})の集金データを削除しました`);
  };

  const isViewer = myRole === "viewer";

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
        readOnly={isViewer}
      />

      <Text fontSize="sm" color="var(--text-muted, #64748B)" mt={2} mb={2}>
        集金者：{selectedItem.profiles?.username ?? "不明"}
      </Text>

      {isFundsArrayLoading ? (
        <Box py={6} display="flex" justifyContent="center">
          <Spinner color="var(--teal, #0891B2)" />
        </Box>
      ) : (
        <>
          {selectedItem.fundsArray?.length > 0 ? (
            <MachineAndFundsList
              moveCursorToEnd={moveCursorToEnd}
              validateNumberInput={validateNumberInput}
              cashFunds={cashFunds}
              setCashFunds={setCashFunds}
              displayTotal={displayTotal}
              setMsg={setMsg}
              readOnly={isViewer}
            />
          ) : (
            <TotalFundsList
              moveCursorToEnd={moveCursorToEnd}
              validateNumberInput={validateNumberInput}
              cashFunds={cashFunds}
              setCashFunds={setCashFunds}
              displayTotal={displayTotal}
              cashlessSum={cashlessSum}
              setMsg={setMsg}
              readOnly={isViewer}
            />
          )}

          <CashlessList
            recorded={cashless}
            methods={selectedItem.paymentMethods}
            perMachineMode={perMachineMode}
            readOnly={isViewer}
            onCommit={submitCashless}
          />
        </>
      )}

      {!isViewer && (
        <Box mt={6}>
          <AlertDialog
            target={`${selectedItem.laundryName}店(${createNowData(
              selectedItem.date
            )}`}
            deleteAction={deleteAction}
          />
        </Box>
      )}
    </Box>
  );
};

export default MoneyDataCard;
