import { Box, Container, VStack, Heading, Button } from "@chakra-ui/react";
import QuickAction from "./QuickAction";
import SalesCard from "./SalesCard";
import GreetingHeader from "./GreetingHeader";
import StatusSummaryCards from "./StatusSummaryCards";
import RecentCollectList from "./RecentCollectList";
import CollectCountdown from "./CollectCountdown";
import JoinOrgForm from "@/app/feacher/settings/components/JoinOrgForm";

const LoginUserHome = ({ id, username = "集金担当者", myRole, hasOrg = true }) => {
  if (!hasOrg) {
    return (
      <Box bg="var(--app-bg, #F0F9FF)" minH="100vh">
        <Container maxW="480px" px={{ base: 4, md: 4 }} py={{ base: 6, md: 8 }}>
          <VStack align="stretch" gap={6}>
            <GreetingHeader username={username} />
            <JoinOrgForm />
            <form action="/api/auth/logout" method="post">
              <Button
                type="submit" w="full"
                fontSize="sm" fontWeight="semibold"
                bg="var(--card-bg, #FFFFFF)" color="red.500"
                border="2px solid" borderColor="red.400"
                borderRadius="lg" cursor="pointer" transition="all 0.2s"
                _hover={{ bg: "red.50" }} _active={{ bg: "red.100" }}
              >
                サインアウト
              </Button>
            </form>
          </VStack>
        </Container>
      </Box>
    );
  }

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

          <CollectCountdown />

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
