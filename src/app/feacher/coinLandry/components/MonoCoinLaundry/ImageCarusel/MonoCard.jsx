import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import ImageCarousel from "./ImageCarusel";
import ActionMenu from "../ActionMenu/ActionMenu";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  CloseButton,
  Drawer,
  Portal,
  Badge,
  Grid,
} from "@chakra-ui/react";
import MonoDataTotal from "../MonoDataTotal";
import MachinesState from "../../MachinesState";
import NowLaundryNum from "../../NowLaundryNum";

const MonoCard = ({ coinLaundry }) => {
  return (
    <Box minH="100vh" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
      <Container maxW="900px" px={0}>
        <Box
          bg="white"
          borderRadius="16px"
          overflow="hidden"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.15)"
        >
          <ImageCarousel images={coinLaundry.images} />

          <Box p={{ base: 6, md: 8 }} position="relative">
            <ActionMenu id={coinLaundry.id} store={coinLaundry.store} />

            <VStack align="stretch" gap={6}>
              <Heading
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color="gray.700"
                letterSpacing="tight"
              >
                {coinLaundry.store}店
              </Heading>

              <HStack color="gray.600" fontSize="sm" fontWeight="semibold">
                <Icon.PiMapPin size={18} />
                <Text>{coinLaundry.location}</Text>
              </HStack>
              {coinLaundry.description && (
                <Box
                  p={5}
                  bg="gray.50"
                  borderRadius="lg"
                  borderLeft="4px solid"
                  borderColor="gray.700"
                >
                  <Text
                    fontSize="md"
                    lineHeight="tall"
                    color="gray.700"
                    whiteSpace="pre-wrap"
                  >
                    {coinLaundry.description}
                  </Text>
                </Box>
              )}

              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={4}
                mt={2}
              >
                <Drawer.Root size={{ base: "xs", md: "md" }}>
                  <Drawer.Trigger asChild>
                    <Box
                      p={5}
                      bg="blue.50"
                      borderRadius="lg"
                      borderLeft="4px solid"
                      borderColor="blue.500"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: "blue.100",
                        transform: "translateY(-2px)",
                        boxShadow: "md",
                      }}
                    >
                      <VStack align="stretch" gap={3}>
                        <HStack justify="space-between">
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="gray.600"
                          >
                            設備情報
                          </Text>
                          <Box
                            bg="blue.500"
                            color="white"
                            borderRadius="full"
                            p={2}
                          >
                            <Icon.LuWrench size={20} />
                          </Box>
                        </HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                          {coinLaundry.machines.length}種類
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          クリックして詳細を表示
                        </Text>
                      </VStack>
                    </Box>
                  </Drawer.Trigger>
                  <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                      <Drawer.Content>
                        <Drawer.Header
                          borderBottom="1px solid"
                          borderColor="gray.200"
                          pb={4}
                        >
                          <HStack gap={3}>
                            <Box
                              bg="blue.500"
                              color="white"
                              borderRadius="full"
                              p={2}
                            >
                              <Icon.LuWrench size={24} />
                            </Box>
                            <Drawer.Title fontSize="xl" fontWeight="bold">
                              設備一覧
                            </Drawer.Title>
                          </HStack>
                        </Drawer.Header>
                        <Drawer.CloseTrigger asChild>
                          <CloseButton
                            size="sm"
                            position="absolute"
                            top={4}
                            right={4}
                          />
                        </Drawer.CloseTrigger>
                        <Drawer.Body pt={6}>
                          <VStack align="stretch" gap={3}>
                            {coinLaundry.machines?.map((machine) => (
                              <Box
                                key={machine.id}
                                p={4}
                                bg="gray.50"
                                borderRadius="lg"
                                borderLeft="4px solid"
                                borderColor="blue.500"
                                transition="all 0.2s"
                                _hover={{
                                  bg: "blue.50",
                                  transform: "translateX(4px)",
                                  boxShadow: "md",
                                }}
                              >
                                <VStack align="stretch" gap={2}>
                                  <Heading
                                    fontSize="lg"
                                    fontWeight="bold"
                                    color="gray.700"
                                  >
                                    {machine.name}
                                  </Heading>
                                  <HStack gap={2} flexWrap="wrap">
                                    <Badge
                                      fontSize="sm"
                                      px={3}
                                      py={1}
                                      borderRadius="full"
                                    >
                                      台数: {machine.num}
                                    </Badge>
                                    {machine.comment && (
                                      <Badge
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                      >
                                        価格: {machine.comment}
                                      </Badge>
                                    )}
                                  </HStack>
                                </VStack>
                              </Box>
                            ))}
                          </VStack>
                        </Drawer.Body>
                      </Drawer.Content>
                    </Drawer.Positioner>
                  </Portal>
                </Drawer.Root>

                <Box
                  p={5}
                  bg="green.50"
                  borderRadius="lg"
                  borderLeft="4px solid"
                  borderColor="green.500"
                >
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.600"
                      >
                        総売上
                      </Text>
                      <Box
                        bg="green.500"
                        color="white"
                        borderRadius="full"
                        p={2}
                      >
                        <Icon.TbCoinYenFilled size={20} />
                      </Box>
                    </HStack>
                    <MonoDataTotal id={coinLaundry.id} />
                    <Link href={`/coinLaundry/${coinLaundry.id}/coinDataList`}>
                      <Button
                        fontSize="xs"
                        variant="outline"
                        color="gray.600"
                        _hover={{
                          bg: "green.100",
                          transform: "translateY(-2px)",
                          boxShadow: "md",
                        }}
                      >
                        <Icon.VscGraphLine />
                        集計データページへ
                      </Button>
                    </Link>
                  </VStack>
                </Box>

                <NowLaundryNum id={coinLaundry.id} />
                <MachinesState id={coinLaundry.id} />
              </Grid>
            </VStack>
          </Box>

          {/* フッター */}
          <Flex
            justifyContent="center"
            p={{ base: 4, md: 6 }}
            bg="gray.50"
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <Link href={`/collectMoney/${coinLaundry.id}/newData`}>
              <Button
                size="lg"
                bg="green.500"
                color="white"
                w="100%"
                fontWeight="semibold"
                px={8}
                _hover={{ bg: "gray.800", transform: "translateY(-2px)" }}
                transition="all 0.2s"
                boxShadow="md"
              >
                <Icon.PiHandCoinsLight size={24} />
                集金を開始
              </Button>
            </Link>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default MonoCard;
