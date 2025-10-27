"use client";

import { useSWRConfig } from "swr";
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

const MoneyDataCard = ({ item, onRowClick, setOpen, valiant }) => {
  const [toggleArray, setToggleArray] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const getArray = () => {
      const array = item.moneyArray.map((machines) => {
        return {
          id: machines._id,
          machine: machines.machine.name,
          money: machines.money,
          editing: false,
          sending: false,
        };
      });
      setToggleArray(array);
    };
    getArray();
  }, []);

  const { mutate } = useSWRConfig();

  const onSubmit = (e) => {
    e.preventDefault();
  };

  const deleteAction = () => {
    fetch(`/api/coinLaundry/${item.storeId}/collectMoney/${item._id}`, {
      method: "delete",
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((res) => {
          return res.msg;
        });
      }
      return res.json().then((res) => {
        onRowClick(null);
        setOpen(false);
        toaster.create({
          description: `${res.store}(${createNowData(
            res.date
          )})の集金データを削除しました`,
          type: "warning",
          closable: true,
        });
        if (valiant === "manyStore") {
          mutate("/api/collectMoney");
        } else if (valiant === "aStore") {
          mutate(`/api/coinLaundry/${item.storeId}/collectMoney`);
        }
      });
    });
  };
  const editAbleForm = (id, e, action) => {
    setToggleArray((prevArray) => {
      return prevArray.map((item) => {
        if (id === item.id) {
          const input = e.value;
          if (action === "change") {
            const value = input.replace(/[^0-9]/g, "");
            return {
              ...item,
              money: parseInt(value),
              editing: true,
              sending: false,
            };
          } else if (action === "reset") {
            const value = input.replace(/[^0-9]/g, "");
            return {
              ...item,
              money: parseInt(value),
              editing: false,
              sending: false,
            };
          } else if (action === "submit") {
            const value = input.replace(/[^0-9]/g, "");
            return {
              ...item,
              money: parseInt(value),
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
      const editMachine = toggleArray.find((item) => item.id === id);
      fetch(`/api/collectMoney/${item._id}`, {
        method: "PUT",
        body: JSON.stringify(editMachine),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((res) => {
              return res.msg;
            });
          }
          return res.json().then((res) => {
            toaster.create({
              description: `${res.machine}店(${res.store})の集金データを更新しました`,
              type: "success",
              closable: true,
            });
            if (valiant === "manyStore") {
              mutate("/api/collectMoney");
            } else if (valiant === "aStore") {
              mutate(`/api/coinLaundry/${item.storeId}/collectMoney`);
            }
          });
        })
        .then((msg) => {
          setMsg(msg);
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
                  defaultValue={item.money.toString()}
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
          <Table.Row key={item.total}>
            <Table.Cell>合計</Table.Cell>
            <Table.Cell>
              {" "}
              {item.moneyArray.reduce((accumulator, currentValue) => {
                return accumulator + parseInt(currentValue.money);
              }, 0)}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <form onSubmit={onSubmit}>
        <Box mt="5%">
          <AlertDialog
            target={`${item.store}店(${createNowData(item.date)})`}
            deleteAction={deleteAction}
          />
        </Box>
      </form>
    </>
  );
};

export default MoneyDataCard;
