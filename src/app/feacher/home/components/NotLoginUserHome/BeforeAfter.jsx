import { Box, Container, Flex, Grid, Heading, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const beforeItems = [
  { icon: <Icon.LuFileText size={18} />, text: "集金金額を紙のノートやExcelに手書き・手入力" },
  { icon: <Icon.BiMessageSquareDetail size={18} />, text: "スタッフから電話・LINEで口頭報告を受け取る" },
  { icon: <Icon.LuPackage size={18} />, text: "洗剤・柔軟剤の在庫切れに現地へ行って気づく" },
  { icon: <Icon.LuWrench size={18} />, text: "どの機器が故障中かすぐに答えられない" },
  { icon: <Icon.VscGraphLine size={18} />, text: "月次集計に毎月1〜2時間かかってしまう" },
];

const afterItems = [
  { icon: <Icon.LuSmartphone size={18} />, text: "スマホからその場でタップして即記録・即集計" },
  { icon: <Icon.VscGraphLine size={18} />, text: "リアルタイムで売上グラフが自動生成される" },
  { icon: <Icon.LuBell size={18} />, text: "在庫が閾値を下回ったら自動でアラート表示" },
  { icon: <Icon.LuCheck size={18} />, text: "全店舗の機器状態を一覧でいつでも確認できる" },
  { icon: <Icon.LuZap size={18} />, text: "月次レポートはボタン1つでCSV/Excelに出力" },
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
              Collecieで、何が変わるか
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="var(--text-muted)" maxW="xl">
              コインランドリー管理のよくある悩みをまるごと解決します
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
