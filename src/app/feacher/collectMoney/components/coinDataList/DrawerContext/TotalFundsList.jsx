import * as Icon from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { showToast } from "@/functions/makeToast/toast";
import { Box, Editable, Flex, IconButton, Text } from "@chakra-ui/react";
import { updateData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { createNowData } from "@/functions/makeDate/date";
import { cashPortion } from "@/functions/cashlessMath";

/**
 * 合計入力モード（`fundsArray` が空）の集金データ。
 *
 * ⚠️ **入力欄は「現金ぶん」で、上に出すのが総額。** `updateData` が受け取る
 *    `totalFunds` は現金ぶんで、サーバがキャッシュレスを足して総額を組み直す。
 *    2026-08-02 まで**表示中の総額をそのまま送っており、保存のたびに
 *    キャッシュレスぶんだけ総額が増えていた**（型エラーも 0 行更新も起きず、
 *    金額がじわじわ膨らむだけなので気づけない）。
 */
const TotalFundsList = ({
  moveCursorToEnd,
  validateNumberInput,
  cashFunds,
  setCashFunds,
  displayTotal,
  cashlessSum,
  setMsg,
  readOnly = false,
}) => {
  const { selectedItem, setSelectedItem } = useUploadPage();
  const hasCashless = cashlessSum !== 0;

  const handleTotalFundsChange = (e) => {
    const input = e.value;
    if (validateNumberInput(input)) {
      setCashFunds(parseInt(input) || 0);
    }
  };

  const handleTotalFundsRevert = () => {
    setCashFunds(cashPortion(selectedItem));
    setMsg("");
  };

  const handleTotalFundsCommit = async (e) => {
    const input = e.value;
    try {
      if (!validateNumberInput(input)) {
        throw new Error("数字以外の文字が含まれています");
      }

      const cash = parseInt(input) || 0;
      /* ⚠️ `cashless` を渡さない＝据え置き。サーバが既存の合計を足し戻す */
      const result = await updateData([], cash, selectedItem.id);

      if (result.error) {
        throw new Error("編集に失敗しました");
      }
      /*
        ⚠️ **`changed` を見る。** 非 admin が他人の集金データを編集すると
           0 行更新の 200 が返る（docs/contracts.md の「既知の未対応」）。
      */
      if (result.changed === 0) {
        throw new Error("この集金データを編集する権限がありません");
      }

      showToast(
        "success",
        `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データを更新しました`
      );
      setSelectedItem((item) => ({ ...item, totalFunds: cash + cashlessSum }));
      setMsg("");
    } catch (error) {
      setMsg(error.message);
      setCashFunds(cashPortion(selectedItem));
      showToast(
        "error",
        `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データの更新に失敗しました`
      );
    }
  };
  return (
    <Box
      mb={6}
      p={5}
      borderRadius="xl"
      border="1px solid"
      borderColor="cyan.100"
    >
      {/* ⚠️ キャッシュレスがあるときだけ総額を別に出す。無いときは
             同じ数字が縦に 2 回並ぶだけになる */}
      {hasCashless && (
        <Box mb={4} pb={4} borderBottom="1px solid" borderColor="var(--divider, #F1F5F9)">
          <Text fontSize="sm" color="gray.600" mb={1}>
            合計売上
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            ¥{displayTotal.toLocaleString()}
          </Text>
        </Box>
      )}

      <Box>
        <Text fontSize="sm" color="gray.600" mb={1}>
          {hasCashless ? "現金" : "合計売上"}
        </Text>
        <Editable.Root
          key={cashFunds}
          defaultValue={cashFunds.toString()}
          submitMode="enter"
          onValueChange={handleTotalFundsChange}
          onValueRevert={handleTotalFundsRevert}
          onValueCommit={handleTotalFundsCommit}
        >
          <Flex alignItems="center" gap={2}>
            <Editable.Preview
              fontSize="3xl"
              fontWeight="bold"
              color="gray.800"
              px={3}
              py={1}
              borderRadius="md"
              _hover={{ bg: "gray.100" }}
            >
              ¥{cashFunds.toLocaleString()}
            </Editable.Preview>
            <Editable.Input
              w="150px"
              fontSize="3xl"
              fontWeight="bold"
              color="gray.800"
              onFocus={moveCursorToEnd}
            />
            {!readOnly && (
              <Editable.Control>
                <Editable.EditTrigger asChild>
                  <IconButton variant="ghost" size="sm">
                    <Icon.LuPencilLine />
                  </IconButton>
                </Editable.EditTrigger>
                <Editable.CancelTrigger asChild>
                  <IconButton variant="outline" size="sm">
                    <Icon.LuX />
                  </IconButton>
                </Editable.CancelTrigger>
                <Editable.SubmitTrigger asChild>
                  <IconButton variant="solid" size="sm">
                    <Icon.LuCheck />
                  </IconButton>
                </Editable.SubmitTrigger>
              </Editable.Control>
            )}
          </Flex>
        </Editable.Root>
      </Box>
    </Box>
  );
};

export default TotalFundsList;
