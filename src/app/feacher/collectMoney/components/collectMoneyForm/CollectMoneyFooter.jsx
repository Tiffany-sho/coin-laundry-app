import { Box, Button, HStack, Text } from "@chakra-ui/react";
import CheckDialog from "@/app/feacher/dialog/CheckDialogCollectMoney";
import CancelConfirmDialog from "./parts/CancelConfirmDialog";

const CollectMoneyFooter = ({
  machinesAndFunds,
  checked,
  moneyTotal,
  cashless,
  coinLaundry,
  epoc,
  setMsg,
  onCancel,
  onSaveDraft,
  clearDraft,
}) => {
  /*
    ⚠️ funds は硬貨の枚数なので金額にするには × 100。
       キャッシュレスは既に「円」なのでそのまま足す。
    ⚠️ ここは**画面に出す見込み額**。DB に入る totalFunds はサーバが
       `formData.totalFunds + cashless.sum` で組み直す（二重に足さないこと）。
  */
  const sumValues = (values) =>
    Object.values(values ?? {}).reduce((acc, value) => acc + (Number(value) || 0), 0);

  /*
    キャッシュレスは 2 か所から来る。**足し方を CheckDialog と揃えること**
    （画面の見込み額と、実際に登録される金額が食い違う）。

    ⚠️ **機器ごとに 1 円でも入力があれば、サーバは機器の側だけを正とする**
       （`hasMachineCashless`）。集金レベルのぶんは捨てられるので足さない。
    ⚠️ **逆に、機器ごとが空なら集金レベルのぶんは生きている。**
       機種別入力では欄を出していないが、**合計入力で入れてから切り替えた分が
       state に残る。** ここで足さないと、登録後に金額が増えたように見える
       （確認画面にも「キャッシュレス（内訳なし）」として必ず出す）。
  */
  const machineCashless = machinesAndFunds.reduce(
    (acc, item) => acc + sumValues(item.cashless),
    0
  );
  const cashlessTotal =
    checked && machineCashless > 0 ? machineCashless : sumValues(cashless);
  const cashTotal = checked
    ? machinesAndFunds.reduce((acc, item) => acc + (item.funds || 0), 0) * 100
    : Number(moneyTotal) || 0;
  const total = cashTotal + cashlessTotal;

  const hasData = checked
    ? machinesAndFunds.some(
        (item) => item.funds !== null || item.weight !== null || sumValues(item.cashless) > 0
      )
    : moneyTotal != null && moneyTotal !== "";

  return (
    <HStack
      py={{ base: 4, md: 6 }}
      px={{ base: 4, md: 8 }}
      w="full"
      bg="var(--card-bg, #FFFFFF)"
      position="fixed"
      bottom="0"
      zIndex="1400"
      borderTopWidth="1px"
      borderTopColor="var(--divider, #F1F5F9)"
      shadow="lg"
      gap={{ base: 3, md: 4 }}
      justify="space-between"
      flexWrap={{ base: "wrap", sm: "nowrap" }}
    >
      <Box minW={{ base: "full", sm: "150px" }}>
        <Text fontSize="xs" fontWeight="medium" color="var(--text-muted, #64748B)" mb={1}>
          合計収益額
        </Text>
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="var(--teal, #0891B2)"
        >
          ¥{total.toLocaleString()}
        </Text>
      </Box>

      <HStack gap={3} w={{ base: "full", sm: "auto" }}>
        {hasData ? (
          <CancelConfirmDialog
            onSaveAndLeave={() => { onSaveDraft(); onCancel(); }}
            onLeave={onCancel}
          />
        ) : (
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            bg="var(--card-bg, #FFFFFF)"
            color="var(--text-muted, #64748B)"
            fontWeight="semibold"
            px={{ base: 6, md: 8 }}
            borderWidth="2px"
            borderColor="var(--divider, #F1F5F9)"
            borderRadius="xl"
            flex={{ base: 1, sm: "unset" }}
            _hover={{
              bg: "var(--app-bg, #F0F9FF)",
              borderColor: "cyan.200",
              transform: "translateY(-1px)",
            }}
            _active={{ transform: "translateY(0)" }}
            transition="all 0.2s"
          >
            キャンセル
          </Button>
        )}

        <Button
          onClick={onSaveDraft}
          variant="outline"
          size="lg"
          bg="var(--card-bg, #FFFFFF)"
          color="amber.600"
          fontWeight="semibold"
          px={{ base: 4, md: 6 }}
          borderWidth="2px"
          borderColor="amber.400"
          borderRadius="xl"
          flex={{ base: 1, sm: "unset" }}
          _hover={{
            bg: "amber.50",
            borderColor: "amber.500",
            transform: "translateY(-1px)",
          }}
          _active={{ transform: "translateY(0)" }}
          transition="all 0.2s"
        >
          一時保存
        </Button>

        <Box flex={{ base: 1, sm: "unset" }} display="flex">
          <CheckDialog
            coinLaundry={coinLaundry}
            checked={checked}
            machinesAndFunds={machinesAndFunds}
            moneyTotal={moneyTotal}
            cashless={cashless}
            epoc={epoc}
            setMsg={setMsg}
            onSuccess={clearDraft}
          />
        </Box>
      </HStack>
    </HStack>
  );
};

export default CollectMoneyFooter;
