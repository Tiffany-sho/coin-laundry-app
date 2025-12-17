"use client";

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
  VStack,
  HStack,
  Button,
  Table,
  Stack,
  Skeleton,
} from "@chakra-ui/react";
import { LuPlus } from "@/app/feacher/Icon";
import { useUploadPage } from "../../context/UploadPageContext";
import { toaster } from "@/components/ui/toaster";
import MoneyDataCard from "./DrawerContext/CoinDataCard";
import MonoCoinDataChart from "./Chart/MonoCoinDataChart";
import ManyCoinDataChart from "./Chart/ManyCoinDataChart";
import CoinManyDataTable from "./Table/CoinManyDataTable";
import CoinMonoDataTable from "./Table/CoinMonoDataTable";
import AddDataBtn from "./parts/AddDataBtn";
import OrderSelecter from "./parts/OrderSelecter";
import DataClipBoard from "./parts/DataClipBoard";
import SegmentedPeriod from "./parts/SegmentedPeriod";
import ChangeStores from "./parts/ChangeStore";
import { createNowData } from "@/functions/makeDate/date";

const MoneyDataList = ({ valiant, coinLaundry }) => {
  const { selectedItem, open, setOpen, data } = useUploadPage();

  const [totalRevenue, setTotalRevenue] = useState(null);
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
    if (!data) return;
    const totalRevenue = data.reduce((accumulator, current) => {
      return accumulator + current.totalFunds;
    }, 0);
    setTotalRevenue(totalRevenue);
  }, [data]);

  return (
    <Box
      size="lg"
      overflow="hidden"
      boxShadow="0 10px 40px rgba(0, 0, 0, 0.08)"
      bg="white"
    >
      <Box p={{ base: 6, md: 8 }} borderColor="gray.200">
        <VStack align="stretch" gap={6}>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={4}
          >
            <HStack justify="space-between">
              <Heading
                size={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                color="gray.800"
                letterSpacing="tight"
              >
                {valiant === "aStore" && `${coinLaundry.store}店`}
                {valiant === "manyStore" && `収益レポート`}
              </Heading>
              <ChangeStores />
            </HStack>

            {valiant === "aStore" && (
              <Link
                href={`/collectMoney/${coinLaundry.id}/newData`}
                _hover={{ textDecoration: "none" }}
              >
                <Button
                  size={{ base: "md", md: "lg" }}
                  color="white"
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
              <HStack>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  集金総額
                </Text>
                {data && (
                  <Text
                    fontSize=""
                    fontWeight="semibold"
                    color="gray.600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    ({createNowData(data[0].date)}~
                    {createNowData(data[data.length - 1].date)})
                  </Text>
                )}
              </HStack>

              <HStack align="baseline" flexWrap="wrap" gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  ¥
                </Text>
                {totalRevenue ? (
                  <Text
                    fontSize={{ base: "3xl", md: "5xl" }}
                    fontWeight="extrabold"
                    color="gray.800"
                    lineHeight="1"
                  >
                    {totalRevenue.toLocaleString()}
                  </Text>
                ) : (
                  <Skeleton height="10" width="20%" />
                )}

                <Badge
                  bg="gray.200"
                  fontSize="md"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  円
                </Badge>
                {data && (
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    累計{data.length}回の集金
                  </Text>
                )}
                <SegmentedPeriod />
              </HStack>
            </VStack>

            {valiant === "aStore" && <MonoCoinDataChart id={coinLaundry.id} />}
            {valiant === "manyStore" && <ManyCoinDataChart />}
          </Box>
        </VStack>
      </Box>
      <Box p={{ base: 6, md: 8 }} borderColor="gray.200">
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="16px"
          border="2px solid"
          borderColor="gray.200"
          boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
        >
          <VStack align="stretch" gap={4}>
            <HStack>
              <Heading>売上履歴</Heading>
              <OrderSelecter />
            </HStack>

            <Stack
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
              {valiant === "aStore" && (
                <CoinMonoDataTable id={coinLaundry.id} />
              )}
              {valiant === "manyStore" && <CoinManyDataTable />}

              {valiant === "aStore" && <AddDataBtn id={coinLaundry.id} />}
              {valiant === "manyStore" && <AddDataBtn />}

              <Drawer.Root
                size={{ base: "xs", md: "md" }}
                open={open}
                onOpenChange={(e) => {
                  setOpen(e.open);
                }}
              >
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
                            <HStack align="stretch" pt={8}>
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
                              <Box mt={2}>
                                <DataClipBoard data={selectedItem} />
                              </Box>
                            </HStack>
                          </Drawer.Header>
                          <Drawer.Body bg="white" p={6}>
                            <MoneyDataCard key={selectedItem._id} />
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
            </Stack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default MoneyDataList;
