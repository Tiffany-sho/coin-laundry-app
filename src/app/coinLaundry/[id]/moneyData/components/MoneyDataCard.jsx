"use client";

import { useSWRConfig } from "swr";
import { Table, Heading, Text, Button } from "@chakra-ui/react";
import { createNowData } from "@/date";
import { redirect } from "next/navigation";
import { toaster } from "@/components/ui/toaster";

const MoneyDataCard = ({ item, laundryId }) => {
  const { mutate } = useSWRConfig();
  const onSubmit = (e) => {
    e.preventDefault();
    fetch(`/api/coinLaundry/${laundryId}/collectMoney/${item._id}`, {
      method: "delete",
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((res) => {
          return res.msg;
        });
      }
      return res.json().then((res) => {
        toaster.create({
          description: `${res.store}(${createNowData(
            res.date
          )})の集金データを削除しました`,
          type: "warning",
          closable: true,
        });
        mutate(`/api/coinLaundry/${laundryId}/collectMoney`);
        redirect(`/coinLaundry/${laundryId}/moneyData`);
      });
    });
  };
  return (
    <>
      <Heading size="lg">
        {item.store}
        <Text textStyle="sm"> {createNowData(item.date)}</Text>
      </Heading>
      <Table.Root size="md" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>設備</Table.ColumnHeader>
            <Table.ColumnHeader>売上</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {item.moneyArray.map((item) => (
            <Table.Row key={item._id}>
              <Table.Cell>{item.machine.name}</Table.Cell>
              <Table.Cell>{item.money}</Table.Cell>
            </Table.Row>
          ))}
          <Table.Row key={item.total}>
            <Table.Cell>合計</Table.Cell>
            <Table.Cell>{item.total}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <form onSubmit={onSubmit}>
        <Button color="red.500" variant="outline" border="none" type="submit">
          このデータを削除
        </Button>
      </form>
    </>
  );
};

export default MoneyDataCard;
