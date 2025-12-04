import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Grid,
  GridItem,
  Badge,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import MonthFundTotal from "./MonthFundTotal";
import NowMachinesState from "./NowMachinesState";
import NowStockState from "./NowStockState";
import QuickAction from "./QuickAction";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "おはようございます";
  if (hour < 17) return "こんにちは";
  return "こんばんは";
};

const getCurrentDate = () => {
  const today = new Date();
  const option = { timeZone: "Asia/Tokyo" };
  const year = today.getFullYear("jp-JP", { ...option, year: "numeric" });
  const month = today.getMonth("jp-JP", { ...option, month: "numeric" }) + 1;
  const date = today.getDate("jp-JP", { ...option, date: "numeric" });
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
                前月比較や詳細は「収益」から確認できます
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
          <QuickAction />
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginUserHome;
