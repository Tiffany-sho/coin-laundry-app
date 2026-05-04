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
  totalFunds,
  setTotalFunds,
  setMsg,
  readOnly = false,
}) => {
  const { selectedItem, setSelectedItem } = useUploadPage();

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
      const totalFunds =
        fundsArray.reduce((acc, cur) => acc + cur.funds, 0) * 100;
      const result = await updateData(fundsArray, totalFunds, selectedItem.id);

      if (result.error) {
        throw new Error("編集に失敗しました");
      }

      showToast(
        "success",
        `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データを更新しました`
      );
      setTotalFunds(totalFunds);
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
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              ¥{totalFunds.toLocaleString()}
            </Text>
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
          <Table.Row bg="cyan.50" fontWeight="bold">
            <Table.Cell py={4}>
              <Text fontSize="lg" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                合計
              </Text>
            </Table.Cell>
            <Table.Cell textAlign="right">
              <Text fontSize="xl" fontWeight="bold" color="var(--teal, #0891B2)">
                ¥{totalFunds.toLocaleString()}
              </Text>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default MachineAndFundsList;
