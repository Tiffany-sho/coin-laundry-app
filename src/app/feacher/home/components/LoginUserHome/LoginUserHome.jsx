import { Box, Container, VStack, Heading } from "@chakra-ui/react";
import QuickAction from "./QuickAction";
import SalesCard from "./SalesCard";
import GreetingHeader from "./GreetingHeader";
import StatusSummaryCards from "./StatusSummaryCards";
import RecentCollectList from "./RecentCollectList";

const LoginUserHome = ({ id, username = "集金担当者", myRole }) => {
  return (
    <Box bg="var(--app-bg, #F0F9FF)" minH="100vh" pb={20}>
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
            <StatusSummaryCards />
          </Box>

          <Box>
            <RecentCollectList />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginUserHome;
