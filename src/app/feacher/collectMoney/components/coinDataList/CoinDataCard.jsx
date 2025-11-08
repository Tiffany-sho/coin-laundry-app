"use client";

import {
  Table,
  Button,
  Editable,
  IconButton,
  Code,
  Box,
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

  console.log(toggleArray);
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
            return {
              ...item,
              funds: parseInt(value),
              editing: true,
              sending: false,
            };
          } else if (action === "reset") {
            const value = input.replace(/[^0-9]/g, "");
            return {
              ...item,
              funds: parseInt(value),
              editing: false,
              sending: false,
            };
          } else if (action === "submit") {
            const value = input.replace(/[^0-9]/g, "");
            return {
              ...item,
              funds: parseInt(value),
              editing: false,
              sending: true,
            };
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
  return (
    <>
      {msg && <Box color="red.600">{msg}</Box>}
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>設備</Table.ColumnHeader>
            <Table.ColumnHeader>売上</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {toggleArray.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>
                {item.machine}
                {(item.editing || item.sending) && (
                  <Code>
                    {item.editing && "編集中..."}
                    {item.sending && "編集済"}
                  </Code>
                )}
              </Table.Cell>
              <Table.Cell>
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
                  <Editable.Preview />
                  <Editable.Input w="40px" />
                  <Editable.Control>
                    <Editable.EditTrigger asChild>
                      <IconButton variant="ghost" size="xs">
                        <LuPencilLine />
                      </IconButton>
                    </Editable.EditTrigger>
                    <Editable.CancelTrigger asChild>
                      <IconButton variant="outline" size="xs">
                        <LuX />
                      </IconButton>
                    </Editable.CancelTrigger>
                    <Editable.SubmitTrigger asChild>
                      <IconButton variant="outline" size="xs">
                        <LuCheck />
                      </IconButton>
                    </Editable.SubmitTrigger>
                  </Editable.Control>
                </Editable.Root>
              </Table.Cell>
            </Table.Row>
          ))}
          <Table.Row key="total">
            <Table.Cell>合計</Table.Cell>
            <Table.Cell>
              {" "}
              {item.fundsArray.reduce((accumulator, currentValue) => {
                return accumulator + parseInt(currentValue.funds);
              }, 0)}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <form onSubmit={onSubmit}>
        <Box mt="5%">
          <AlertDialog
            target={`${item.laundryName}店(${createNowData(item.date)})`}
            deleteAction={deleteAction}
          />
        </Box>
      </form>
    </>
  );
};

export default MoneyDataCard;
