import { Box, Container, Grid, GridItem, Heading, Text, VStack, Flex } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const features = [
  {
    icon: <Icon.PiHandCoinsLight size={26} />,
    title: "集金記録",
    description: "現金・電子マネー問わず素早く記録。日次・月次の売上データを自動集計します。",
  },
  {
    icon: <Icon.LuPackage size={26} />,
    title: "在庫管理",
    description: "洗剤・柔軟剤の在庫を閾値アラート付きで管理。補充のし忘れを防ぎます。",
  },
  {
    icon: <Icon.LuWrench size={26} />,
    title: "機器状態",
    description: "洗濯機・乾燥機の稼働・故障情報を一覧管理。メンテナンスを効率化します。",
  },
  {
    icon: <Icon.VscGraphLine size={26} />,
    title: "売上レポート",
    description: "月次・年次の売上グラフでビジュアルに把握。経営判断をデータで支えます。",
  },
];

const ExplainFunction = () => {
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
              Features
            </Text>
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              color="var(--text-main)"
              letterSpacing="-0.01em"
            >
              必要な機能がすべて揃っています
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="var(--text-muted)" maxW="xl">
              コインランドリー経営に必要な機能を一元管理
            </Text>
          </VStack>

          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
            gap={{ base: 4, md: 6 }}
            w="full"
          >
            {features.map((feature, i) => (
              <GridItem key={i}>
                <VStack
                  align="start"
                  p={6}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="cyan.100"
                  bg="white"
                  boxShadow="var(--shadow-sm)"
                  gap={4}
                  h="full"
                  transition="all 0.2s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(8,145,178,0.14)",
                    borderColor: "cyan.200",
                  }}
                >
                  <Flex
                    w="52px" h="52px"
                    borderRadius="xl"
                    bg="var(--teal-pale)"
                    align="center"
                    justify="center"
                    color="var(--teal)"
                    flexShrink={0}
                  >
                    {feature.icon}
                  </Flex>
                  <VStack align="start" gap={1.5}>
                    <Heading fontSize="md" color="var(--text-main)">{feature.title}</Heading>
                    <Text fontSize="sm" color="var(--text-muted)" lineHeight="1.7">
                      {feature.description}
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

export default ExplainFunction;
