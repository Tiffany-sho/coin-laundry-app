"use client";

import { Table } from "@chakra-ui/react";
import { createNowData } from "@/date";
import Styles from "./DataTable.module.css";

const DataTable = ({ items, setDatas }) => {
  const toggleHander = (id) => {
    setDatas((prevArray) => {
      return prevArray.map((item) => {
        if (id === item.data._id) {
          const boolean = item.toggle;
          return { ...item, toggle: !boolean };
        }
        return { ...item, toggle: false };
      });
    });
  };
  return (
    <Table.Root size="sm" className={Styles.container} interactive>
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
            key={item.data._id}
            onClick={() => toggleHander(item.data._id)}
            bgColor={item.toggle && "gray.200"}
          >
            <Table.Cell>{item.data.store}店</Table.Cell>
            <Table.Cell>{item.data.total}</Table.Cell>
            <Table.Cell>{createNowData(item.data.date)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default DataTable;
