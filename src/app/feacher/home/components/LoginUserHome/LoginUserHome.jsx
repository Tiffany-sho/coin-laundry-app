import {
  Box,
  Container,
  VStack,
  Heading,
  Grid,
  GridItem,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import QuickAction from "./QuickAction";
import SalesCard from "./SalesCard";
import GreetingHeader from "./GreetingHeader";

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
            <Grid
              templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
              gap={{ base: 3, md: 4 }}
            >
              <GridItem>
                <Link href="/equipment">
                  <Box
                    bg="var(--teal-pale, #CFFAFE)"
                    px={4} py={8}
                    border="1px solid" borderRadius="xl"
                    borderColor="cyan.200"
                    cursor="pointer"
                    _hover={{ bg: "cyan.50", borderColor: "cyan.300" }}
                    transition="all 0.2s"
                    textAlign="center"
                  >
                    <VStack align="center" gap={3}>
                      <Box bg="var(--teal, #0891B2)" color="white" borderRadius="full" p={2}>
                        <Icon.LuWrench size={18} />
                      </Box>
                      <Text fontSize="sm" fontWeight="semibold" color="var(--teal-deeper, #155E75)">
                        設備状況
                      </Text>
                      <Text fontSize="xs" color="var(--text-muted, #64748B)">
                        設備・故障状況を確認する →
                      </Text>
                    </VStack>
                  </Box>
                </Link>
              </GridItem>
              <GridItem>
                <Link href="/inventory">
                  <Box
                    bg="var(--teal-pale, #CFFAFE)"
                    px={4} py={8}
                    border="1px solid" borderRadius="xl"
                    borderColor="cyan.200"
                    cursor="pointer"
                    _hover={{ bg: "cyan.50", borderColor: "cyan.300" }}
                    transition="all 0.2s"
                    textAlign="center"
                  >
                    <VStack align="center" gap={3}>
                      <Box bg="var(--teal, #0891B2)" color="white" borderRadius="full" p={2}>
                        <Icon.LuPackage size={18} />
                      </Box>
                      <Text fontSize="sm" fontWeight="semibold" color="var(--teal-deeper, #155E75)">
                        在庫状況
                      </Text>
                      <Text fontSize="xs" color="var(--text-muted, #64748B)">
                        在庫・補充状況を確認する →
                      </Text>
                    </VStack>
                  </Box>
                </Link>
              </GridItem>
            </Grid>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginUserHome;
