import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import NowMachinesState from "./NowMachinesState";
import NowStockState from "./NowStockState";
import QuickAction from "./QuickAction";
import SalesCard from "./SalesCard";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "おはようございます";
  if (hour < 17) return "こんにちは";
  return "こんばんは";
};

const getCurrentDate = () => {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const today = new Date(
    new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
  );
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
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

          <SalesCard id={id} />

          <Box>
            <Heading size={{ base: "md", md: "lg" }} color="gray.800" mb={3}>
              クイックアクション
            </Heading>
            <QuickAction />
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
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginUserHome;
