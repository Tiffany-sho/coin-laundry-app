"use client";

import { Table } from "@chakra-ui/react";
import { createNowData } from "@/date";

const DataTable = ({ items, setDatas }) => {
  const toggleHander = (id) => {
    setDatas((prevArray) => {
      return prevArray.map((item) => {
        if (id === item.money._id) {
          const boolean = item.toggle;
          return { ...item, toggle: !boolean };
        }
        return { ...item, toggle: false };
      });
    });
  };
  return (
    <Table.Root size="sm" interactive>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>店舗</Table.ColumnHeader>
          <Table.ColumnHeader>合計売上</Table.ColumnHeader>
          <Table.ColumnHeader>記録日</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map((item) => (
          <Table.Row
            key={item.money._id}
            onClick={() => toggleHander(item.money._id)}
            bgColor={item.toggle && "gray.200"}
          >
            <Table.Cell>{item.money.store}店</Table.Cell>
            <Table.Cell>{item.money.total}</Table.Cell>
            <Table.Cell>{createNowData(item.money.date)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default DataTable;
