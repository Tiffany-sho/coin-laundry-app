"use client";

import { useEffect } from "react";
import { Table, Badge, Text, Box } from "@chakra-ui/react";
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
    <Table.Root size="md" interactive variant="line">
      <Table.Body>
        {items.map((item, index) => {
          const total = item.totalFunds;

          return (
            <Table.Row
              key={item.id}
              onClick={() => toggleHander(item)}
              bgColor={selectedItemId === item.id ? "blue.50" : "transparent"}
              cursor="pointer"
              _hover={{
                bgColor: selectedItemId === item.id ? "blue.100" : "gray.50",
                transform: "scale(1.01)",
              }}
              transition="all 0.2s"
              borderBottom={index === items.length - 1 ? "none" : "1px solid"}
              borderColor="gray.100"
            >
              <Table.Cell py={4}>
                <Text fontWeight="semibold" color="gray.800">
                  {item.laundryName}店
                </Text>
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Badge
                  color={total > 200000 ? "green.600" : "gray.600"}
                  fontSize="md"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontWeight="bold"
                >
                  ¥{total.toLocaleString()}
                </Badge>
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Text fontSize="sm" color="gray.600">
                  {createNowData(item.date)}
                </Text>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
};

export default DataTable;
