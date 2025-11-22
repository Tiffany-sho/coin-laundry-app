import * as Icon from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { showToast } from "@/functions/makeToast/toast";
import { Box, Editable, Flex, IconButton, Text } from "@chakra-ui/react";
import { updateData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { createNowData } from "@/functions/makeDate/date";

const TotalFundsList = ({
  moveCursorToEnd,
  validateNumberInput,
  totalFunds,
  setTotalFunds,
  setMsg,
}) => {
  const { selectedItem } = useUploadPage();

  const handleTotalFundsChange = (e) => {
    const input = e.value;
    if (validateNumberInput(input)) {
      setTotalFunds(parseInt(input) || 0);
    }
  };

  const handleTotalFundsRevert = () => {
    setTotalFunds(selectedItem.totalFunds);
    setMsg("");
  };

  const handleTotalFundsCommit = async (e) => {
    const input = e.value;
    try {
      if (!validateNumberInput(input)) {
        throw new Error("数字以外の文字が含まれています");
      }

      const result = await updateData([], parseInt(input), selectedItem.id);

      if (result.error) {
        throw new Error("編集に失敗しました");
      }

      showToast(
        "success",
        `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データを更新しました`
      );
      setMsg("");
    } catch (error) {
      setMsg(error.message);
      setTotalFunds(selectedItem.totalFunds);
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
      borderColor="blue.100"
    >
      <Box>
        <Text fontSize="sm" color="gray.600" mb={1}>
          合計売上
        </Text>
        <Editable.Root
          defaultValue={totalFunds.toString()}
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
              ¥{totalFunds.toLocaleString()}
            </Editable.Preview>
            <Editable.Input
              w="150px"
              fontSize="3xl"
              fontWeight="bold"
              color="gray.800"
              onFocus={moveCursorToEnd}
            />
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
          </Flex>
        </Editable.Root>
      </Box>
    </Box>
  );
};

export default TotalFundsList;
