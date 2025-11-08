"use client";

import { useEffect } from "react";
import { Table } from "@chakra-ui/react";
import { createNowData } from "@/date";

const DataTable = ({ items, selectedItemId, onRowClick, open }) => {
  useEffect(() => {
    if (!open) {
      onRowClick(null);
    }
  }, [open]);

  const toggleHander = (item) => {
    const id = selectedItemId;
    if (id === item.id) {
      onRowClick(null);
    } else {
      onRowClick(item);
    }
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
            key={item.id}
            onClick={() => toggleHander(item)}
            bgColor={selectedItemId === item.id ? "gray.200" : "transparent"}
            cursor="pointer"
          >
            <Table.Cell>{item.laundryName}店</Table.Cell>
            <Table.Cell>
              {item.fundsArray.reduce((accumulator, currentValue) => {
                return accumulator + parseInt(currentValue.funds);
              }, 0)}
            </Table.Cell>
            <Table.Cell>{createNowData(item.date)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default DataTable;
