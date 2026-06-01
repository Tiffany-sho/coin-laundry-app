import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
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
    description: "店舗名・所在地・機器情報を入力するだけ。複数店舗もまとめて登録できます。",
  },
  {
    number: "03",
    icon: <Icon.PiHandCoinsLight size={24} />,
    title: "集金データを記録",
    description: "現場でスマートフォンから素早く記録。履歴は自動で蓄積・グラフ化されます。",
  },
];

const Procedure = () => {
  return (
    <Box py={{ base: 20, md: 28 }} bg="white">
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
              セットアップは最短5分。すぐに使い始められます。
            </Text>
          </VStack>

          {/* ステップカード */}
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={{ base: 5, md: 4 }}
            w="full"
            align="stretch"
          >
            {steps.map((step, i) => (
              <Flex key={step.number} flex={1} direction={{ base: "row", md: "column" }} gap={0} align="center">
                {/* カード */}
                <VStack
                  align={{ base: "start", md: "center" }}
                  textAlign={{ base: "left", md: "center" }}
                  p={{ base: 5, md: 7 }}
                  bg="var(--app-bg, #F0F9FF)"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor="cyan.100"
                  gap={4}
                  flex={1}
                  w="full"
                  boxShadow="var(--shadow-sm)"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(8,145,178,0.14)" }}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="var(--teal)"
                    letterSpacing="0.08em"
                    fontFamily="'Space Mono', monospace"
                  >
                    STEP {step.number}
                  </Text>

                  <Flex
                    w="56px" h="56px"
                    borderRadius="xl"
                    style={{ background: "linear-gradient(140deg, #0E7490 0%, #0891B2 100%)" }}
                    align="center"
                    justify="center"
                    color="white"
                    mx={{ base: 0, md: "auto" }}
                    flexShrink={0}
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

                {/* 矢印（最後のステップには表示しない） */}
                {i < steps.length - 1 && (
                  <Flex
                    display={{ base: "none", md: "flex" }}
                    align="center"
                    justify="center"
                    color="var(--text-faint)"
                    px={2}
                    flexShrink={0}
                  >
                    <Icon.LuChevronRight size={24} />
                  </Flex>
                )}
              </Flex>
            ))}
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Procedure;
