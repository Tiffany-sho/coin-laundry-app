import { Box, Button, HStack, Text } from "@chakra-ui/react";
import CheckDialog from "@/app/feacher/dialog/CheckDialogCollectMoney";
import CancelConfirmDialog from "./parts/CancelConfirmDialog";

const CollectMoneyFooter = ({
  machinesAndFunds,
  checked,
  moneyTotal,
  coinLaundry,
  epoc,
  setMsg,
  onCancel,
  onSaveDraft,
  clearDraft,
}) => {
  const total =
    machinesAndFunds.reduce((acc, item) => acc + (item.funds || 0), 0) * 100;

  const hasData = checked
    ? machinesAndFunds.some((item) => item.funds !== null || item.weight !== null)
    : moneyTotal != null && moneyTotal !== "";

  return (
    <HStack
      py={{ base: 4, md: 6 }}
      px={{ base: 4, md: 8 }}
      w="full"
      bg="white"
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
            bg="white"
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
          bg="white"
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
