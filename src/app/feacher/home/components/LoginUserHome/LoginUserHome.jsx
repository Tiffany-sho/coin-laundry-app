import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Grid,
  GridItem,
  Button,
  Badge,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import MonthFundTotal from "./MonthFundTotal";
import NowMachinesState from "./NowMachinesState";
import NowStockState from "./NowStockState";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "おはようございます";
  if (hour < 17) return "こんにちは";
  return "こんばんは";
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const day = days[today.getDay()];
  return `${year}年${month}月${date}日（${day}）`;
};

const LoginUserHome = ({ id, username = "集金担当者" }) => {
  return (
    <Box bg="gray.50" minH="100vh" pb={20}>
      <Container
        maxW="container.xl"
        px={{ base: 3, md: 4 }}
        py={{ base: 4, md: 6 }}
      >
        <VStack align="stretch" gap={{ base: 4, md: 6 }}>
          <Box>
            <Heading size={{ base: "lg", md: "xl" }} color="gray.800" mb={1}>
              {getGreeting()}、{username}さん
            </Heading>
            <HStack gap={2} color="gray.600">
              <Icon.LuCalendar size={16} />
              <Text fontSize={{ base: "sm", md: "md" }}>
                {getCurrentDate()}
              </Text>
            </HStack>
          </Box>

          <Box
            bg="#007BBB"
            p={{ base: 4, md: 6 }}
            borderRadius="xl"
            boxShadow="lg"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-20%"
              right="-10%"
              w="200px"
              h="200px"
              bg="white"
              opacity={0.05}
              borderRadius="full"
            />
            <Box
              position="absolute"
              bottom="-30%"
              left="-5%"
              w="150px"
              h="150px"
              bg="white"
              opacity={0.05}
              borderRadius="full"
            />

            <VStack align="stretch" gap={3} position="relative">
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Icon.LuTrendingUp color="white" size={24} />
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    color="white"
                    fontWeight="semibold"
                  >
                    今月の売上
                  </Text>
                </HStack>
                <Badge
                  bg="whiteAlpha.300"
                  color="white"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {new Date().getMonth() + 1}月
                </Badge>
              </HStack>

              <MonthFundTotal id={id} />

              <Text fontSize="xs" color="whiteAlpha.800" mt={1}>
                前月比較や詳細は「利益」から確認できます
              </Text>
            </VStack>
          </Box>

          <Box>
            <Heading size={{ base: "md", md: "lg" }} color="gray.800" mb={3}>
              今日の対応状況
            </Heading>

            <Grid
              templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
              gap={{ base: 3, md: 4 }}
            >
              <GridItem>
                <NowMachinesState id={id} />
              </GridItem>

              <GridItem>
                <NowStockState id={id} />
              </GridItem>
            </Grid>
          </Box>

          <Box>
            <Heading size={{ base: "md", md: "lg" }} color="gray.800" mb={3}>
              クイックアクション
            </Heading>

            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
              gap={{ base: 2, md: 3 }}
            >
              <GridItem>
                <Button
                  w="full"
                  h={{ base: "70px", md: "80px" }}
                  flexDirection="column"
                  gap={2}
                  variant="outline"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.300",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                  boxShadow="sm"
                >
                  <Text fontSize={{ base: "2xl", md: "3xl" }}>
                    <Icon.PiHandCoinsLight />
                  </Text>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="semibold"
                  >
                    集金記録
                  </Text>
                </Button>
              </GridItem>

              <GridItem>
                <Button
                  w="full"
                  h={{ base: "70px", md: "80px" }}
                  flexDirection="column"
                  gap={2}
                  variant="outline"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.300",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                  boxShadow="sm"
                >
                  <Text fontSize={{ base: "2xl", md: "3xl" }}>
                    <Icon.LuPackage />
                  </Text>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="semibold"
                  >
                    在庫管理
                  </Text>
                </Button>
              </GridItem>

              <GridItem>
                <Button
                  w="full"
                  h={{ base: "70px", md: "80px" }}
                  flexDirection="column"
                  gap={2}
                  variant="outline"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.300",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                  boxShadow="sm"
                >
                  <Text fontSize={{ base: "2xl", md: "3xl" }}>
                    <Icon.LiaStoreSolid />
                  </Text>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="semibold"
                  >
                    店舗一覧
                  </Text>
                </Button>
              </GridItem>

              <GridItem>
                <Button
                  w="full"
                  h={{ base: "70px", md: "80px" }}
                  flexDirection="column"
                  gap={2}
                  variant="outline"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.300",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                  boxShadow="sm"
                >
                  <Text fontSize={{ base: "2xl", md: "3xl" }}>
                    <Icon.VscGraphLine />
                  </Text>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="semibold"
                  >
                    レポート
                  </Text>
                </Button>
              </GridItem>
            </Grid>
          </Box>

          <Box
            bg="white"
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
            textAlign="center"
          >
            <Text fontSize="xs" color="gray.500">
              最終更新: {new Date().toLocaleTimeString("ja-JP")}
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginUserHome;
