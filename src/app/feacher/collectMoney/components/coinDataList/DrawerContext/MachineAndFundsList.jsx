import {
  Badge,
  Box,
  Editable,
  Flex,
  IconButton,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { showToast } from "@/functions/makeToast/toast";
import { updateData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { createNowData } from "@/functions/makeDate/date";

const MachineAndFundsList = ({
  moveCursorToEnd,
  validateNumberInput,
  /** 現金ぶん（設備の枚数 × 100）。⚠️ `updateData` に渡すのはこちら */
  cashFunds,
  setCashFunds,
  /** 画面に出す総額（現金 + キャッシュレス）。⚠️ こちらを送らないこと */
  displayTotal,
  setMsg,
  readOnly = false,
}) => {
  const { selectedItem, setSelectedItem } = useUploadPage();
  /** キャッシュレスぶん。設備を直しても変わらないので差で出す */
  const cashlessSum = displayTotal - cashFunds;

  const editAbleForm = async (id, e, action) => {
    const input = e.value || 0;

    if (action === "change" && !validateNumberInput(input)) return;

    const parsedValue = parseInt(input) || 0;
    const updatedFundsArray = selectedItem.fundsArray.map((item) => {
      if (id === item.id) return { ...item, funds: parsedValue };
      return item;
    });

    setSelectedItem((item) => ({ ...item, fundsArray: updatedFundsArray }));

    if (action === "submit") {
      await submitMachineData(updatedFundsArray);
    }
  };

  const submitMachineData = async (fundsArray) => {
    try {
      /*
        ⚠️ **送るのは現金ぶん。** サーバがキャッシュレスを足して総額を組み直す。
           ⚠️ `cashless` を渡さない＝「据え置き」。機器ごとの内訳も
              `updateData` が id → 名前の順で引き継ぐので消えない。
      */
      const cash = fundsArray.reduce((acc, cur) => acc + (Number(cur.funds) || 0), 0) * 100;
      const result = await updateData(fundsArray, cash, selectedItem.id);

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
      /*
        ⚠️ **現金ぶんだけを入れる。** ここに総額を入れると、次の保存で
           キャッシュレスを二重に足すことになる。画面の総額は親が
           `cashFunds + cashlessSum` で組む。
      */
      setCashFunds(cash);
      setSelectedItem((item) => ({ ...item, totalFunds: cash + cashlessSum }));
      setMsg("");
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
  return (
    <>
      <Box
        mb={6}
        p={5}
        borderRadius="xl"
        border="1px solid"
        borderColor="cyan.100"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>
              合計売上
            </Text>
            {/* ⚠️ 総額（現金 + キャッシュレス）。一覧の金額と一致させること */}
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              ¥{displayTotal.toLocaleString()}
            </Text>
            {cashlessSum !== 0 && (
              <Text fontSize="xs" color="var(--text-muted, #64748B)" mt={1}>
                現金 ¥{cashFunds.toLocaleString()} ／ キャッシュレス ¥
                {cashlessSum.toLocaleString()}
              </Text>
            )}
          </Box>

          <Badge bg="cyan.100" color="var(--teal-deeper, #155E75)" fontSize="lg" px={4} py={2} borderRadius="full">
            {selectedItem.fundsArray.length}台
          </Badge>
        </Flex>
      </Box>

      <Table.Root
        size="md"
        variant="outline"
        borderRadius="lg"
        overflow="hidden"
      >
        <Table.Header bg="gray.50">
          <Table.Row>
            <Table.ColumnHeader
              fontWeight="bold"
              fontSize="sm"
              color="gray.700"
            >
              設備
            </Table.ColumnHeader>
            <Table.ColumnHeader
              fontWeight="bold"
              fontSize="sm"
              color="gray.700"
              textAlign="right"
            >
              売上
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {selectedItem.fundsArray.map((item) => (
            <Table.Row
              key={item.id}
              _hover={{ bg: "gray.50" }}
              transition="background 0.2s"
            >
              <Table.Cell py={4}>
                <Stack alignItems="center" gap={3}>
                  <Text fontWeight="semibold" color="gray.800">
                    {item.name}
                  </Text>
                </Stack>
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Editable.Root
                  defaultValue={item.funds.toString()}
                  submitMode="enter"
                  onValueChange={(e) => editAbleForm(item.id, e, "change")}
                  onValueRevert={(e) => editAbleForm(item.id, e, "reset")}
                  onValueCommit={(e) => editAbleForm(item.id, e, "submit")}
                >
                  <Flex alignItems="center" justifyContent="flex-end" gap={2}>
                    <Editable.Preview
                      fontWeight="semibold"
                      fontSize="lg"
                      px={3}
                      py={1}
                      borderRadius="md"
                      _hover={{ bg: "gray.100" }}
                    >
                      ¥{(item.funds * 100).toLocaleString()}
                    </Editable.Preview>
                    <Editable.Input
                      w="50px"
                      textAlign="left"
                      fontSize="16px"
                      fontWeight="semibold"
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
              </Table.Cell>
            </Table.Row>
          ))}
          {/* ⚠️ この表は設備＝**現金ぶん**しか並べていない。キャッシュレスを含む
                 総額をここに出すと、縦に足しても合わない表になる */}
          <Table.Row bg="cyan.50" fontWeight="bold">
            <Table.Cell py={4}>
              <Text fontSize="lg" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                {cashlessSum === 0 ? "合計" : "現金の合計"}
              </Text>
            </Table.Cell>
            <Table.Cell textAlign="right">
              <Text fontSize="xl" fontWeight="bold" color="var(--teal, #0891B2)">
                ¥{cashFunds.toLocaleString()}
              </Text>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default MachineAndFundsList;
