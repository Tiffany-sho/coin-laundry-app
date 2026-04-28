import {
  Box,
  Container,
  VStack,
  Heading,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import NowMachinesState from "./NowMachinesState";
import NowStockState from "./NowStockState";
import QuickAction from "./QuickAction";
import SalesCard from "./SalesCard";
import GreetingHeader from "./GreetingHeader";

const LoginUserHome = ({ id, username = "集金担当者", myRole }) => {
  return (
    <Box bg="gray.50" minH="100vh" pb={20}>
      <Container
        maxW="container.xl"
        px={{ base: 3, md: 4 }}
        py={{ base: 4, md: 6 }}
      >
        <VStack align="stretch" gap={{ base: 4, md: 6 }}>
          <Box>
            <GreetingHeader username={username} />
          </Box>

          <SalesCard id={id} />

          <Box>
            <Heading size={{ base: "md", md: "lg" }} color="gray.800" mb={3}>
              クイックアクション
            </Heading>
            <QuickAction myRole={myRole} />
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
