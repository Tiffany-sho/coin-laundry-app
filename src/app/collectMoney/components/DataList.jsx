"use client";

import useSWR from "swr";
import { Table } from "@chakra-ui/react";
import { createNowData } from "@/date";

const DataList = () => {
  const fetcher = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
      const error = new Error("エラーが発生しました");
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return res.json();
  };

  const { data, error, isLoading } = useSWR("/api/collectMoney", fetcher);

  if (!isLoading && data.length === 0) {
    return <div>登録店舗は見つかりませんでした</div>;
  }

  if (error) {
    return <div>failed to load{data.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table.Root size="sm" interactive>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>店舗</Table.ColumnHeader>
          <Table.ColumnHeader>合計売上(×100)</Table.ColumnHeader>
          <Table.ColumnHeader>記録日</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((item) => (
          <Table.Row key={item._id}>
            <Table.Cell>{item.store}</Table.Cell>
            <Table.Cell>{item.total}</Table.Cell>
            <Table.Cell>{createNowData(item.date)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default DataList;
