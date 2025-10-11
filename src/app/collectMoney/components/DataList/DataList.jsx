"use client";

import { useEffect, useState } from "react";
import { HStack, Card, Heading, Box } from "@chakra-ui/react";
import DataCard from "../DataCard/DataCard";
import DataTable from "../DataTable/DataTable";
import Styles from "./DataList.module.css";

const DataList = ({ filterItem = "" }) => {
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const datas = await fetch("/api/collectMoney").then((res) => res.json());
      setLoading(false);
      if (filterItem) {
        const toggleArray = datas
          .filter((data) => {
            return data._id == filterItem;
          })
          .map((data) => {
            const newObj = {
              data,
              toggle: false,
            };
            return newObj;
          });

        setDatas(toggleArray);
      } else {
        const toggleArray = datas.map((data) => {
          const newObj = {
            data,
            toggle: false,
          };
          return newObj;
        });

        setDatas(toggleArray);
      }

      setLoading(true);
    };
    getData();
  }, []);

  if (loading && datas.length === 0) {
    return <div>登録店舗は見つかりませんでした</div>;
  }

  if (!loading) {
    return <div>Loading...</div>;
  }
  return (
    <Card.Root size="lg">
      <div className={Styles.container}>
        <Card.Header>
          <Heading size="2xl">
            {" "}
            {filterItem ? `${filterItem}店の集金データ` : "集金データ一覧"}
          </Heading>
        </Card.Header>
        <Card.Body color="fg.muted">
          <HStack width="100%" spacing={4}>
            <Box w="100%" key="dataTable">
              <DataTable items={datas} setDatas={setDatas} />
            </Box>
            {datas.map((data) => {
              if (data.toggle) {
                return (
                  <Box w="1/3" key="dataCard">
                    <DataCard item={data.data} key={data.data._id} />
                  </Box>
                );
              }
            })}
          </HStack>
        </Card.Body>
      </div>
    </Card.Root>
  );
};

export default DataList;
