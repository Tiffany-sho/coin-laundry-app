import { Box, Container, Heading, Text, VStack, HStack, Grid, GridItem, Flex } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const steps = [
  {
    number: "01",
    icon: <Icon.LuUser size={24} />,
    title: "アカウント登録",
    description: "メールアドレスで簡単に無料登録。14日間のトライアルがすぐに始まります。",
  },
  {
    number: "02",
    icon: <Icon.LiaStoreSolid size={24} />,
    title: "店舗情報を登録",
    description: "店舗名・所在地・機器情報を入力するだけ。複数店舗も一括管理できます。",
  },
  {
    number: "03",
    icon: <Icon.PiHandCoinsLight size={24} />,
    title: "集金データを記録",
    description: "現場でスマートフォンから素早く記録。履歴は自動で蓄積・可視化されます。",
  },
];

const Procedure = () => {
  return (
    <Box py={{ base: 20, md: 28 }} bg="var(--app-bg, #F0F9FF)">
      <Container maxW="container.xl">
        <VStack gap={{ base: 12, md: 16 }}>
          <VStack gap={3} textAlign="center">
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="var(--teal)"
              letterSpacing="0.12em"
              textTransform="uppercase"
            >
              How it works
            </Text>
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              color="var(--text-main)"
              letterSpacing="-0.01em"
            >
              3ステップで始められます
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="var(--text-muted)">
              セットアップは最短5分
            </Text>
          </VStack>

          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap={{ base: 4, md: 6 }}
            w="full"
          >
            {steps.map((step, i) => (
              <GridItem key={i}>
                <VStack
                  align={{ base: "start", md: "center" }}
                  textAlign={{ base: "left", md: "center" }}
                  p={{ base: 6, md: 8 }}
                  bg="white"
                  borderRadius="xl"
                  boxShadow="var(--shadow-sm)"
                  border="1px solid"
                  borderColor="cyan.100"
                  gap={4}
                  h="full"
                >
                  <HStack gap={2} align="center">
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="var(--teal)"
                      letterSpacing="0.08em"
                      fontFamily="'Space Mono', monospace"
                    >
                      STEP {step.number}
                    </Text>
                  </HStack>

                  <Flex
                    w="60px" h="60px"
                    borderRadius="xl"
                    style={{ background: "linear-gradient(140deg, #0E7490 0%, #0891B2 100%)" }}
                    align="center"
                    justify="center"
                    color="white"
                    mx={{ base: 0, md: "auto" }}
                  >
                    {step.icon}
                  </Flex>

                  <VStack align={{ base: "start", md: "center" }} gap={1.5}>
                    <Heading fontSize="md" color="var(--text-main)">{step.title}</Heading>
                    <Text fontSize="sm" color="var(--text-muted)" lineHeight="1.7">
                      {step.description}
                    </Text>
                  </VStack>
                </VStack>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default Procedure;
