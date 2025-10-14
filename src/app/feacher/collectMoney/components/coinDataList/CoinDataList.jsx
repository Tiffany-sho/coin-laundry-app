"use client";

import { useState } from "react";
import {
  Portal,
  Select,
  createListCollection,
  Card,
  Stack,
  Heading,
  Box,
  HStack,
} from "@chakra-ui/react";
import MoneyDataTable from "@/app/feacher/collectMoney/components/coinDataList/CoinDataTable";
import MoneyDataCard from "@/app/feacher/collectMoney/components/coinDataList/CoinDataCard";
const frameworks = createListCollection({
  items: [
    { label: "新しい順", value: "newer" },
    { label: "古い順", value: "older" },
    { label: "店舗別順", value: "store" },
    { label: "売上順", value: "income" },
  ],
});

const MoneyDataList = ({ coinData, valiant }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [order, setOrder] = useState("react");

  return (
    <>
      <Card.Root size="lg" w={selectedItem ? "2/3" : "100%"} mt="5%">
        <Card.Header>
          <HStack>
            <Heading size="2xl">集金データ一覧</Heading>
            <Select.Root
              collection={frameworks}
              size="sm"
              width="120px"
              ml="auto"
              defaultValue={["newer"]}
              onValueChange={(e) => setOrder(e.value)}
            >
              <Select.HiddenSelect />
              <Select.Label>Select plan</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="新しい順" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {frameworks.items.map((framework) => (
                      <Select.Item item={framework} key={framework.value}>
                        <Stack gap="0">
                          <Select.ItemText>{framework.label}</Select.ItemText>
                        </Stack>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </HStack>
        </Card.Header>
        <Card.Body color="fg.muted">
          <Box>
            <MoneyDataTable
              items={coinData}
              selectedItemId={selectedItem?._id}
              onRowClick={setSelectedItem}
            />
          </Box>
        </Card.Body>
      </Card.Root>
      <Box w="1/3">
        {selectedItem && (
          <MoneyDataCard
            item={selectedItem}
            onRowClick={setSelectedItem}
            valiant={valiant}
            key={selectedItem._id}
          />
        )}
      </Box>
    </>
  );
};

export default MoneyDataList;
