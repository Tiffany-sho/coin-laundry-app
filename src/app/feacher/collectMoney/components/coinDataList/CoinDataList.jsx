import { useEffect, useState } from "react";
import {
  Card,
  Box,
  Heading,
  Flex,
  Button,
  CloseButton,
  Drawer,
  Portal,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import MoneyDataTable from "@/app/feacher/collectMoney/components/coinDataList/CoinDataTable";
import MoneyDataCard from "@/app/feacher/collectMoney/components/coinDataList/CoinDataCard";
import * as Order from "@/createArray/dateOrder";
import OrderSelecter from "./OrderSelecter";
import MonoCoinDataChart from "./MonoCoinDataChart";
import ManyCoinDataChart from "./ManyCoinDataChart";

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
    <>
      <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Drawer.Trigger asChild>
          <Card.Root size="lg" mt="5%">
            <Card.Header>
              <Flex w="100%" h="400px" direction="column">
                <Heading size="md" mb={4}>
                  過去の記録
                </Heading>
                <Box w="100%" flex="1">
                  {valiant === "aStore" && (
                    <MonoCoinDataChart data={orderData} />
                  )}
                  {valiant === "manyStore" && (
                    <ManyCoinDataChart data={orderData} />
                  )}
                </Box>
              </Flex>
            </Card.Header>
            <Card.Body color="fg.muted">
              <OrderSelecter setOrder={setOrder} />
              <Box>
                <MoneyDataTable
                  items={orderData}
                  selectedItemId={selectedItem?._id}
                  onRowClick={setSelectedItem}
                  open={open}
                />
              </Box>
            </Card.Body>
          </Card.Root>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop onClick={() => console.log("sam")} />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Drawer Title</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                {selectedItem && (
                  <MoneyDataCard
                    item={selectedItem}
                    onRowClick={setSelectedItem}
                    valiant={valiant}
                    key={selectedItem._id}
                  />
                )}
              </Drawer.Body>
              <Drawer.Footer>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
};

export default MoneyDataList;
