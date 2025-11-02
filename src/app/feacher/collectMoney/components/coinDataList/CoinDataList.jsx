import { useEffect, useState } from "react";
import {
  Card,
  Box,
  Text,
  Link,
  Heading,
  Flex,
  CloseButton,
  Drawer,
  Portal,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import MoneyDataTable from "@/app/feacher/collectMoney/components/coinDataList/CoinDataTable";
import MoneyDataCard from "@/app/feacher/collectMoney/components/coinDataList/CoinDataCard";
import * as Order from "@/createArray/dateOrder";
import OrderSelecter from "./OrderSelecter";
import { createNowData } from "@/date";
import MonoCoinDataChart from "./MonoCoinDataChart";
import ManyCoinDataChart from "./ManyCoinDataChart";
import DataClipBoard from "./DataClipBoard";

const MoneyDataList = ({ valiant, coinData }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
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
    <Flex direction="column" alignItems="center" justifyContent="center">
      <Card.Root size="lg" mt="5%" mb="5%" w="90%">
        <Card.Header>
          <Flex w="100%" direction="column">
            <Heading size="md" mb={4}>
              <Flex justifyContent="space-between">
                <Heading size="3xl">
                  {valiant === "aStore" && `${coinData[0].store}店`}
                  {valiant === "manyStore" && "全データ一覧"}
                </Heading>
                <Box>
                  総額
                  <Box textStyle="3xl">
                    {coinData.reduce((accumulator, current) => {
                      const summary = current.moneyArray.reduce(
                        (accumulator, currentValue) => {
                          return accumulator + parseInt(currentValue.money);
                        },
                        0
                      );
                      return accumulator + summary;
                    }, 0) * 100}
                    円
                  </Box>
                </Box>
              </Flex>
            </Heading>
            <Box w="100%" flex="1">
              {valiant === "aStore" && <MonoCoinDataChart data={orderData} />}
              {valiant === "manyStore" && (
                <ManyCoinDataChart data={orderData} />
              )}
            </Box>
          </Flex>
        </Card.Header>
        <Card.Body color="fg.muted">
          <OrderSelecter setOrder={setOrder} />
        </Card.Body>

        <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
          <Drawer.Trigger asChild>
            <Box>
              <MoneyDataTable
                items={orderData}
                selectedItemId={selectedItem?._id}
                onRowClick={setSelectedItem}
                open={open}
              />
            </Box>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                {selectedItem && (
                  <>
                    <Drawer.Header>
                      <Drawer.Title>
                        <Flex justifyContent="space-between" mt="10%">
                          <Box>
                            {valiant === "aStore" && `${selectedItem.store}店`}
                            {valiant === "manyStore" && (
                              <Link
                                variant="underline"
                                href={`/coinLaundry/${selectedItem.storeId}/coinDataList`}
                              >
                                {selectedItem.store}店
                              </Link>
                            )}

                            <Text textStyle="sm">
                              {createNowData(selectedItem.date)}
                            </Text>
                          </Box>
                          <DataClipBoard data={selectedItem} />
                        </Flex>
                      </Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <MoneyDataCard
                        item={selectedItem}
                        onRowClick={setSelectedItem}
                        setOpen={setOpen}
                        valiant={valiant}
                        key={selectedItem._id}
                      />
                    </Drawer.Body>
                    <Drawer.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Drawer.CloseTrigger>
                  </>
                )}
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      </Card.Root>
    </Flex>
  );
};

export default MoneyDataList;
