import { useEffect, useState } from "react";
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
import { toaster } from "@/components/ui/toaster";
import MoneyDataTable from "@/app/feacher/collectMoney/components/coinDataList/CoinDataTable";
import MoneyDataCard from "@/app/feacher/collectMoney/components/coinDataList/CoinDataCard";
import * as Order from "@/order/dateOrder";
const frameworks = createListCollection({
  items: [
    { label: "新しい順", value: "newer" },
    { label: "古い順", value: "older" },
    { label: "売上順", value: "income" },
  ],
});

const MoneyDataList = ({ valiant, coinData }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [order, setOrder] = useState(["newer"]);
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const toastInfo = sessionStorage.getItem("toast");

      if (toastInfo) {
        const toastInfoStr = JSON.parse(toastInfo);

        toaster.create(toastInfoStr);
      }
      sessionStorage.removeItem("toast");
    }, 0);
  }, []);

  useEffect(() => {
    if (!coinData) return;

    const getSetOrder = () => {
      switch (order[0]) {
        case "newer":
          const newerArray = Order.newerOrder(coinData);
          return newerArray;
        case "older":
          const olderArray = Order.olderOrder(coinData);
          return olderArray;
        case "income":
          const incomeArray = Order.incomeOrder(coinData);
          return incomeArray;
        default:
          return coinData;
      }
    };
    const newArray = getSetOrder();
    setOrderData(newArray);
  }, [coinData, order]);

  useEffect(() => {
    if (coinData && selectedItem) {
      const updatedSelectedItem = coinData.find(
        (item) => item._id === selectedItem._id
      );
      setSelectedItem(updatedSelectedItem);
    }
  }, [coinData]);
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
              <Select.Label>並び替え</Select.Label>
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
              items={orderData}
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
