import { Box, Container, Flex, Grid, Heading, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const beforeItems = [
  { icon: <Icon.LuFileText size={18} />, text: "集金金額を紙のノートやExcelに手書き・手入力している" },
  { icon: <Icon.BiMessageSquareDetail size={18} />, text: "スタッフからの口頭報告で、記録の抜け漏れが発生する" },
  { icon: <Icon.LuPackage size={18} />, text: "洗剤・柔軟剤の在庫切れに、現地へ行って初めて気づく" },
  { icon: <Icon.LuWrench size={18} />, text: "どの店舗のどの機器が故障中か、すぐに答えられない" },
  { icon: <Icon.VscGraphLine size={18} />, text: "月次集計に毎月1〜2時間を費やしている" },
];

const afterItems = [
  { icon: <Icon.LuSmartphone size={18} />, text: "スマホで機種ごとの枚数を入力するだけで売上を自動計算" },
  { icon: <Icon.VscGraphLine size={18} />, text: "日次・月次・年次の売上グラフがリアルタイムで自動生成" },
  { icon: <Icon.LuBell size={18} />, text: "在庫が閾値を下回るとアラート表示。補充し忘れを防止" },
  { icon: <Icon.LuCheck size={18} />, text: "全店舗の機器状態を一覧でいつでもどこからでも確認" },
  { icon: <Icon.LuZap size={18} />, text: "月次レポートはボタン1つでCSV/Excel出力。集計ゼロ時間" },
];

const ItemRow = ({ icon, text, isBefore }) => (
  <Flex
    align="flex-start"
    gap={3}
    p={3}
    borderRadius="lg"
    bg={isBefore ? "rgba(0,0,0,0.03)" : "rgba(8,145,178,0.06)"}
    transition="all 0.15s"
    _hover={{ bg: isBefore ? "rgba(0,0,0,0.06)" : "rgba(8,145,178,0.1)" }}
  >
    <Box
      color={isBefore ? "var(--text-muted)" : "var(--teal)"}
      flexShrink={0}
      mt="2px"
    >
      {icon}
    </Box>
    <Text fontSize="sm" color={isBefore ? "var(--text-muted)" : "var(--text-main)"} lineHeight="1.6">
      {text}
    </Text>
  </Flex>
);

const BeforeAfter = () => {
  return (
    <Box py={{ base: 20, md: 28 }} bg="white">
      <Container maxW="container.xl">
        <VStack gap={{ base: 12, md: 16 }}>
          <VStack gap={3} textAlign="center" style={{ animation: "fadeSlideUp 0.5s ease both" }}>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="var(--teal)"
              letterSpacing="0.12em"
              textTransform="uppercase"
            >
              Before / After
            </Text>
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              color="var(--text-main)"
              letterSpacing="-0.01em"
            >
              Collecieで、業務がこう変わる
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="var(--text-muted)" maxW="xl">
              コインランドリー経営者が抱えるよくある課題を、まるごと解決します
            </Text>
          </VStack>

          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={6}
            w="full"
            style={{ animation: "fadeSlideUp 0.6s ease both 0.1s" }}
          >
            {/* Before */}
            <Box
              p={{ base: 6, md: 8 }}
              borderRadius="2xl"
              bg="#F8FAFC"
              border="1.5px solid"
              borderColor="gray.200"
            >
              <Flex align="center" gap={2} mb={6} justify="center">
                <Box color="var(--text-muted)"><Icon.LuX size={18} /></Box>
                <Text fontSize="md" fontWeight="bold" color="var(--text-muted)">
                  今まで
                </Text>
              </Flex>
              <VStack gap={3} align="stretch">
                {beforeItems.map((item, i) => (
                  <ItemRow key={i} {...item} isBefore />
                ))}
              </VStack>
            </Box>

            {/* After */}
            <Box
              p={{ base: 6, md: 8 }}
              borderRadius="2xl"
              bg="#ECFEFF"
              border="1.5px solid"
              borderColor="cyan.300"
            >
              <Flex align="center" gap={2} mb={6} justify="center">
                <Box color="var(--teal)"><Icon.LuZap size={18} /></Box>
                <Text fontSize="md" fontWeight="bold" color="var(--teal)">
                  Collecieなら
                </Text>
              </Flex>
              <VStack gap={3} align="stretch">
                {afterItems.map((item, i) => (
                  <ItemRow key={i} {...item} isBefore={false} />
                ))}
              </VStack>
            </Box>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default BeforeAfter;
