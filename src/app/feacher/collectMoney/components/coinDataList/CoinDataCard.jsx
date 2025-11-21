"use client";

import {
  Table,
  Editable,
  IconButton,
  Box,
  Badge,
  Flex,
  Text,
  Alert,
  Stack,
} from "@chakra-ui/react";
import { createNowData } from "@/date";
import { toaster } from "@/components/ui/toaster";
import * as Icon from "@/app/feacher/Icon";
import { useEffect, useState } from "react";
import AlertDialog from "@/app/feacher/dialog/AlertDialog";
import {
  deleteData,
  updateData,
  updateDate,
} from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import EpochTimeSelector from "../selectDate/SelectDate";
import { useUploadPage } from "../../context/UploadPageContext";

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

  const showToast = (type, isSuccess) => {
    const description = isSuccess
      ? `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データを更新しました`
      : `${selectedItem.laundryName}店(${createNowData(
          selectedItem.date
        )})の集金データの編集に失敗しました`;

    toaster.create({
      placement: "top-end",
      description,
      type,
      closable: true,
    });
  };

  const editAbleForm = async (id, e, action) => {
    setSelectedItem((item) => {
      const fundsAndMachines = item.fundsArray.map((item) => {
        if (id === item.id) {
          const input = e.value || 0;
          if (!validateNumberInput(input)) {
            return item;
          }

          const parsedValue = parseInt(input);

          if (action === "change") {
            return {
              ...item,
              funds: parsedValue,
            };
          } else if (action === "reset") {
            return {
              ...item,
              funds: parsedValue,
            };
          } else if (action === "submit") {
            return {
              ...item,
              funds: parsedValue,
            };
          }
        }
        return item;
      });

      return { ...item, fundsArray: fundsAndMachines };
    });

    if (action === "submit") {
      await submitMachineData(e.value);
    }
  };

  const submitMachineData = async (input) => {
    try {
      if (!validateNumberInput(input)) {
        throw new Error("数字以外の文字が含まれています");
      }

      const totalFunds =
        selectedItem.fundsArray.reduce((acc, cur) => acc + cur.funds, 0) * 100;
      const result = await updateData(
        selectedItem.fundsArray,
        totalFunds,
        selectedItem.id
      );

      if (result.error) {
        throw new Error(result.error.message || "編集に失敗しました");
      }

      showToast("success", true);
      setTotalFunds(totalFunds);
      setMsg("");
    } catch (error) {
      setMsg(error.message);
      showToast("error", false);
    }
  };

  const submitDate = async (date) => {
    try {
      const result = await updateDate(date, selectedItem.id);

      if (result.error) {
        throw new Error(result.error.message || "編集に失敗しました");
      }
      toaster.create({
        description: `${selectedItem.laundryName}店(${createNowData(
          result.data.date
        )})に日付を更新しました`,
        type: "success",
        closable: true,
      });
      setMsg("");
    } catch (error) {
      setMsg(error.message);
      showToast("error", false);
    }
  };

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
        throw new Error(result.error.message || "編集に失敗しました");
      }

      showToast("success", true);
      setMsg("");
    } catch (error) {
      setMsg(error.message);
      setTotalFunds(selectedItem.totalFunds);
      showToast("error", false);
    }
  };

  const deleteAction = async () => {
    try {
      const result = await deleteData(selectedItem.id);

      if (result.error) {
        throw new Error(result.error.message || "削除に失敗しました");
      }
    } catch (error) {
      console.error("API Error:", error);
    }

    setSelectedItem(null);
    setOpen(false);
    toaster.create({
      description: "集金データを削除しました",
      type: "warning",
      closable: true,
    });
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
        <>
          <Box
            mb={6}
            p={5}
            borderRadius="xl"
            border="1px solid"
            borderColor="blue.100"
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

              <Badge
                bg="blue.200"
                fontSize="lg"
                px={4}
                py={2}
                borderRadius="full"
              >
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
                      <Flex
                        alignItems="center"
                        justifyContent="flex-end"
                        gap={2}
                      >
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
                  </Table.Cell>
                </Table.Row>
              ))}
              <Table.Row bg="blue.50" fontWeight="bold">
                <Table.Cell py={4}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    合計
                  </Text>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    ¥{totalFunds.toLocaleString()}
                  </Text>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </>
      ) : (
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
