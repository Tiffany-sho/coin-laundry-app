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
} from "@chakra-ui/react";
import { createNowData } from "@/date";
import { toaster } from "@/components/ui/toaster";
import { LuCheck, LuPencilLine, LuX } from "react-icons/lu";
import { useEffect, useState } from "react";
import AlertDialog from "@/app/feacher/dialog/AlertDialog";
import { deleteData, updateData } from "@/app/collectMoney/action";

const MoneyDataCard = ({ item, onRowClick, setOpen }) => {
  const [toggleArray, setToggleArray] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const getArray = () => {
      const array = item.fundsArray.map((machines) => {
        return {
          id: machines.id,
          machine: machines.name,
          funds: machines.funds,
          editing: false,
          sending: false,
        };
      });
      setToggleArray(array);
    };
    getArray();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  const deleteAction = async () => {
    try {
      const result = await deleteData(item.id);

      if (result.error) {
        throw new Error(result.error.message || "削除に失敗しました");
      }
    } catch (error) {
      console.error("API Error:", error);
      setMsg(error);
    }

    onRowClick(null);
    setOpen(false);
    toaster.create({
      description: `${item.laundryName}店(${createNowData(
        item.date
      )})の集金データを削除しました`,
      type: "warning",
      closable: true,
    });
  };

  const editAbleForm = async (id, e, action) => {
    setToggleArray((prevArray) => {
      return prevArray.map((item) => {
        if (id === item.id) {
          const input = e.value;
          if (action === "change") {
            const value = input.replace(/[^0-9]/g, "");
            if (value === "") {
              return {
                ...item,
                funds: 0,
                editing: true,
                sending: false,
              };
            } else {
              return {
                ...item,
                funds: parseInt(value),
                editing: true,
                sending: false,
              };
            }
          } else if (action === "reset") {
            const value = input.replace(/[^0-9]/g, "");
            if (value === "") {
              return {
                ...item,
                funds: 0,
                editing: false,
                sending: false,
              };
            } else {
              return {
                ...item,
                funds: parseInt(value),
                editing: false,
                sending: false,
              };
            }
          } else if (action === "submit") {
            const value = input.replace(/[^0-9]/g, "");
            if (value === "") {
              return {
                ...item,
                funds: 0,
                editing: false,
                sending: true,
              };
            } else {
              return {
                ...item,
                funds: parseInt(value),
                editing: false,
                sending: true,
              };
            }
          } else {
            return item;
          }
        }
        return item;
      });
    });
    if (action === "submit") {
      const editMachine = toggleArray.map((item) => {
        const newObj = {
          id: item.id,
          name: item.machine,
          funds: item.funds,
        };
        return newObj;
      });
      try {
        const result = await updateData(editMachine, item.id);

        if (result.error) {
          throw new Error(result.error.message || "編集に失敗しました");
        }
      } catch (error) {
        console.error("API Error:", error);
        setMsg(error);
      }

      toaster.create({
        description: `${item.laundryName}店(${createNowData(
          item.date
        )})の集金データを更新しました`,
        type: "success",
        closable: true,
      });
    }
  };

  const totalRevenue = item.fundsArray.reduce((accumulator, currentValue) => {
    return accumulator + parseInt(currentValue.funds) * 100;
  }, 0);

  return (
    <Box>
      {msg && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>エラーが発生しました</Alert.Title>
          <Alert.Description>{msg}</Alert.Description>
        </Alert.Root>
      )}

      <Box
        mb={6}
        p={5}
        bg="gradient-to-r"
        gradientFrom="blue.50"
        gradientTo="purple.50"
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
              ¥{totalRevenue.toLocaleString()}
            </Text>
          </Box>
          <Badge
            colorScheme="blue"
            fontSize="lg"
            px={4}
            py={2}
            borderRadius="full"
          >
            {toggleArray.length}台
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
              売上(×100)
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {toggleArray.map((item) => (
            <Table.Row
              key={item.id}
              _hover={{ bg: "gray.50" }}
              transition="background 0.2s"
            >
              <Table.Cell py={4}>
                <Flex alignItems="center" gap={3}>
                  <Text fontWeight="semibold" color="gray.800">
                    {item.machine}
                  </Text>
                  {item.editing && (
                    <Badge colorScheme="yellow" fontSize="xs">
                      編集中...
                    </Badge>
                  )}
                  {item.sending && (
                    <Badge colorScheme="green" fontSize="xs">
                      編集済
                    </Badge>
                  )}
                </Flex>
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Editable.Root
                  defaultValue={item.funds.toString()}
                  submitMode="enter"
                  onValueChange={(e) => editAbleForm(item.id, e, "change")}
                  onValueRevert={(e) => editAbleForm(item.id, e, "reset")}
                  onValueCommit={(e) => editAbleForm(item.id, e, "submit")}
                  onInteractOutside={(e) =>
                    editAbleForm(item.id, e, "outPoint")
                  }
                >
                  <Flex alignItems="center" justifyContent="flex-end" gap={2}>
                    <Editable.Preview
                      fontWeight="semibold"
                      fontSize="lg"
                      px={3}
                      py={1}
                      borderRadius="md"
                      _hover={{ bg: "gray.100" }}
                    />
                    <Editable.Input
                      w="50px"
                      textAlign="left"
                      fontSize="lg"
                      fontWeight="semibold"
                    />
                    <Editable.Control>
                      <Editable.EditTrigger asChild>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          colorScheme="blue"
                        >
                          <LuPencilLine />
                        </IconButton>
                      </Editable.EditTrigger>
                      <Editable.CancelTrigger asChild>
                        <IconButton
                          variant="outline"
                          size="sm"
                          colorScheme="red"
                        >
                          <LuX />
                        </IconButton>
                      </Editable.CancelTrigger>
                      <Editable.SubmitTrigger asChild>
                        <IconButton
                          variant="solid"
                          size="sm"
                          colorScheme="green"
                        >
                          <LuCheck />
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
                ¥{totalRevenue.toLocaleString()}
              </Text>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>

      <form onSubmit={onSubmit}>
        <Box mt={6}>
          <AlertDialog
            target={`${item.laundryName}店(${createNowData(item.date)})`}
            deleteAction={deleteAction}
          />
        </Box>
      </form>
    </Box>
  );
};

export default MoneyDataCard;
