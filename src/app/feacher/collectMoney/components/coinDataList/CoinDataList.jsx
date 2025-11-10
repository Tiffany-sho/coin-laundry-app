// CoinDataList.jsx
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
  Badge,
  Container,
  VStack,
  HStack,
  Button,
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
import { LuPlus } from "react-icons/lu";

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
        (item) => item.id === selectedItem.id
      );
      setSelectedItem(updatedSelectedItem);
    }
  }, [coinData]);

  const totalRevenue =
    coinData.reduce((accumulator, current) => {
      const summary = current.fundsArray.reduce((accumulator, currentValue) => {
        return accumulator + parseInt(currentValue.funds);
      }, 0);
      return accumulator + summary;
    }, 0) * 100;

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #ffffff 0%, #f7fafc 50%, #edf2f7 100%)"
      py={{ base: 6, md: 12 }}
      px={{ base: 3, md: 4 }}
    >
      <Container maxW="1400px" px={0}>
        <Card.Root
          size="lg"
          borderRadius="24px"
          overflow="hidden"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.08)"
          bg="white"
        >
          <Card.Header
            bg="linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)"
            p={{ base: 6, md: 8 }}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <VStack align="stretch" gap={6}>
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
                gap={4}
              >
                <Heading
                  size={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  color="gray.800"
                  letterSpacing="tight"
                >
                  {valiant === "aStore" && `${coinData[0].laundryName}店`}
                  {valiant === "manyStore" && "全集計データ"}
                </Heading>

                {valiant === "aStore" && (
                  <Link
                    href={`/collectMoney/${coinData[0].laundryId}/newData`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Button
                      size={{ base: "md", md: "lg" }}
                      bg="gray.700"
                      color="white"
                      _hover={{ bg: "gray.800" }}
                      borderRadius="full"
                      px={6}
                      fontWeight="semibold"
                    >
                      <LuPlus /> 新規集金を記録
                    </Button>
                  </Link>
                )}
              </Flex>

              <Box
                bg="white"
                p={{ base: 5, md: 6 }}
                borderRadius="16px"
                border="2px solid"
                borderColor="gray.200"
                boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
              >
                <VStack align="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    総額
                  </Text>
                  <HStack align="baseline" flexWrap="wrap" gap={2}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                      ¥
                    </Text>
                    <Text
                      fontSize={{ base: "3xl", md: "5xl" }}
                      fontWeight="extrabold"
                      color="gray.800"
                      lineHeight="1"
                    >
                      {totalRevenue.toLocaleString()}
                    </Text>
                    <Badge
                      colorScheme="gray"
                      fontSize="md"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      円
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              <Box
                bg="white"
                px={{ base: 3, md: 6 }}
                borderRadius="16px"
                boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
              >
                {valiant === "aStore" && <MonoCoinDataChart data={orderData} />}
                {valiant === "manyStore" && (
                  <ManyCoinDataChart data={orderData} />
                )}
              </Box>
            </VStack>
          </Card.Header>
          <Card.Body
            p={{ base: 4, md: 6 }}
            bg="linear-gradient(to bottom, #fafafa, #ffffff)"
          >
            <VStack align="stretch" gap={4}>
              <Box
                p={4}
                bg="gray.50"
                borderRadius="12px"
                border="1px solid"
                borderColor="gray.200"
              >
                <OrderSelecter setOrder={setOrder} />
              </Box>

              <Box
                borderRadius="16px"
                overflow="hidden"
                boxShadow="0 2px 10px rgba(0, 0, 0, 0.04)"
                bg="white"
                border="1px solid"
                borderColor="gray.100"
                transition="all 0.2s"
                _hover={{
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }}
              >
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
                      <Drawer.Content borderRadius="24px 0 0 24px">
                        {selectedItem && (
                          <>
                            <Drawer.Header
                              bg="white"
                              borderBottom="2px solid"
                              borderColor="gray.200"
                              p={6}
                            >
                              <VStack align="stretch" gap={2} pt={8}>
                                {valiant === "aStore" && (
                                  <Heading
                                    size="lg"
                                    fontWeight="bold"
                                    color="gray.800"
                                  >
                                    {selectedItem.laundryName}店
                                  </Heading>
                                )}
                                {valiant === "manyStore" && (
                                  <Link
                                    href={`/coinLaundry/${selectedItem.laundryId}/coinDataList`}
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color="gray.700"
                                    _hover={{
                                      color: "gray.900",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    {selectedItem.laundryName}店
                                  </Link>
                                )}
                                <Text
                                  fontSize="sm"
                                  color="gray.600"
                                  fontWeight="medium"
                                >
                                  {createNowData(selectedItem.date)}
                                </Text>
                                <Box mt={2}>
                                  <DataClipBoard data={selectedItem} />
                                </Box>
                              </VStack>
                            </Drawer.Header>
                            <Drawer.Body bg="white" p={6}>
                              <MoneyDataCard
                                item={selectedItem}
                                onRowClick={setSelectedItem}
                                setOpen={setOpen}
                                valiant={valiant}
                                key={selectedItem._id}
                              />
                            </Drawer.Body>
                            <Drawer.CloseTrigger asChild>
                              <CloseButton
                                size="lg"
                                position="absolute"
                                top={4}
                                right={4}
                                bg="white"
                                borderRadius="full"
                                border="1px solid"
                                borderColor="gray.300"
                                _hover={{
                                  bg: "gray.100",
                                  transform: "rotate(90deg)",
                                }}
                                transition="all 0.2s"
                              />
                            </Drawer.CloseTrigger>
                          </>
                        )}
                      </Drawer.Content>
                    </Drawer.Positioner>
                  </Portal>
                </Drawer.Root>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
};

export default MoneyDataList;
