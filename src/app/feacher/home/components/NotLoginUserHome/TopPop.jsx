import { Box, Container, Flex, Grid, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

/* 店舗ごとの色（実際のアプリのグラフ配色） */
const STORE_COLORS = ["#818CF8", "#34D399", "#FCD34D", "#F9A8D4", "#C4B5FD", "#67E8F9"];
const stores = [
  { name: "銀座一丁目", pct: 91, color: STORE_COLORS[0] },
  { name: "表参道",     pct: 84, color: STORE_COLORS[1] },
  { name: "下北沢",     pct: 69, color: STORE_COLORS[2] },
  { name: "三軒茶屋",   pct: 63, color: STORE_COLORS[3] },
  { name: "神楽坂",     pct: 38, color: STORE_COLORS[4] },
  { name: "浅草雷門",   pct: 8,  color: STORE_COLORS[5] },
];

/* 月次サマリー行 */
const summaryRows = [
  { month: "2026年5月", total: "¥3,000,500", mom: "+12.5%", yoy: "+10.4%", up: true },
  { month: "2026年4月", total: "¥2,471,000", mom: "+49.3%", yoy: "+16.2%", up: true },
  { month: "2026年3月", total: "¥1,654,800", mom: "−23.2%", yoy: "+2.6%",  up: false },
];

/* 積み上げ棒グラフの各月データ（高さ%） */
const barData = [
  [22, 12, 10, 9,  7, 1],
  [28, 14, 12, 11, 9, 2],
  [24, 11, 9,  8,  5, 1],
  [18, 9,  7,  6,  4, 1],
  [28, 13, 11, 10, 8, 2],
  [26, 12, 10, 9,  7, 1],
];

const DashboardMock = () => (
  <Box position="relative" pb="28px" pr="20px">
    {/* PC 収益レポート風 */}
    <Box
      bg="white"
      borderRadius="2xl"
      p={4}
      boxShadow="0 20px 60px rgba(0,0,0,0.35)"
      overflow="hidden"
    >
      {/* ヘッダー */}
      <Flex align="center" gap={2} mb={3} pb={2.5} borderBottom="1px solid" borderColor="gray.100">
        <Text fontSize="xs" fontWeight="bold" color="var(--text-main)">収益レポート</Text>
        <Box bg="var(--teal)" color="white" fontSize="9px" fontWeight="bold" px={2} py={0.5} borderRadius="full">
          店舗切替
        </Box>
        <Box ml="auto" display="flex" alignItems="center" gap={1}>
          <Text fontSize="8px" color="var(--teal)" fontWeight="semibold">↓ 収益データダウンロード</Text>
        </Box>
      </Flex>

      <Grid templateColumns="1fr 1fr" gap={3}>
        {/* 左：店舗別累計売上 */}
        <Box>
          <Text fontSize="9px" color="var(--text-muted)" mb={1}>店舗別累計売上</Text>
          <Text fontSize="9px" color="var(--text-muted)">全店舗計</Text>
          <Text fontSize="md" fontWeight="800" color="var(--text-main)" fontFamily="'Space Mono', monospace" mb={2}>
            ¥120,341,000
          </Text>
          {/* 横棒グラフ */}
          <VStack gap={1} align="stretch" mb={3}>
            {stores.map((s) => (
              <Flex key={s.name} align="center" gap={1.5}>
                <Text fontSize="8px" color="var(--text-muted)" w="44px" flexShrink={0}>{s.name}</Text>
                <Box flex={1} bg="#F1F5F9" borderRadius="full" h="7px" overflow="hidden">
                  <Box w={`${s.pct}%`} h="full" bg={s.color} borderRadius="full" />
                </Box>
              </Flex>
            ))}
          </VStack>
          {/* 凡例 */}
          <Flex flexWrap="wrap" gap={1}>
            {stores.map((s) => (
              <Flex key={s.name} align="center" gap={1}>
                <Box w="6px" h="6px" borderRadius="full" bg={s.color} />
                <Text fontSize="7px" color="var(--text-muted)">{s.name}</Text>
              </Flex>
            ))}
          </Flex>

          {/* 月次サマリー */}
          <Box mt={3} borderTop="1px solid" borderColor="gray.100" pt={2}>
            <Flex align="center" gap={1} mb={2}>
              <Text fontSize="9px" color="var(--text-muted)">🗓 月次サマリー</Text>
            </Flex>
            <Grid templateColumns="1fr 1fr 1fr 1fr" gap={0}>
              {["年月", "合計", "前月比", "前年比"].map((h) => (
                <Text key={h} fontSize="7px" color="var(--text-faint)" pb={1}>{h}</Text>
              ))}
              {summaryRows.map((r) => (
                <>
                  <Text key={r.month + "m"} fontSize="7px" color="var(--text-muted)" py={1} borderTop="1px solid" borderColor="gray.50">{r.month}</Text>
                  <Text key={r.month + "t"} fontSize="7px" color="var(--text-main)" fontWeight="600" py={1} borderTop="1px solid" borderColor="gray.50">{r.total}</Text>
                  <Text key={r.month + "o"} fontSize="7px" color={r.up ? "green.500" : "red.500"} fontWeight="600" py={1} borderTop="1px solid" borderColor="gray.50">{r.mom}</Text>
                  <Text key={r.month + "y"} fontSize="7px" color="green.500" fontWeight="600" py={1} borderTop="1px solid" borderColor="gray.50">{r.yoy}</Text>
                </>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* 右：月別売上グラフ */}
        <Box>
          <Text fontSize="9px" color="var(--text-muted)" mb={1}>月別売上</Text>
          <Text fontSize="9px" color="var(--text-muted)">集金総額</Text>
          <Text fontSize="md" fontWeight="800" color="var(--text-main)" fontFamily="'Space Mono', monospace" mb={2}>
            ¥76,818,000
          </Text>
          {/* 積み上げ棒グラフ */}
          <Box bg="#F8FAFC" borderRadius="lg" p={2}>
            <Flex align="flex-end" gap="3px" h="70px" mb={1}>
              {barData.map((bars, i) => (
                <Box key={i} flex={1} display="flex" flexDirection="column-reverse" h="full" gap="1px">
                  {bars.map((h, j) => (
                    <Box
                      key={j}
                      w="full"
                      style={{ height: `${h}%` }}
                      bg={STORE_COLORS[j]}
                      borderRadius={j === bars.length - 1 ? "2px 2px 0 0" : "0"}
                      opacity={0.85}
                    />
                  ))}
                </Box>
              ))}
            </Flex>
            <Flex justify="space-around">
              {["1月", "2月", "3月", "4月", "5月", "6月"].map((m) => (
                <Text key={m} fontSize="7px" color="var(--text-faint)">{m}</Text>
              ))}
            </Flex>
          </Box>
          {/* 凡例 */}
          <Flex flexWrap="wrap" gap={1} mt={2}>
            {stores.map((s) => (
              <Flex key={s.name} align="center" gap={1}>
                <Box w="6px" h="6px" borderRadius="1px" bg={s.color} />
                <Text fontSize="7px" color="var(--text-muted)">{s.name}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Grid>
    </Box>

    {/* スマホモック（右下に重ねる）— 集金入力画面 */}
    <Box
      position="absolute"
      bottom={0}
      right={0}
      bg="var(--app-bg)"
      borderRadius="2xl"
      p={3}
      boxShadow="0 8px 32px rgba(0,0,0,0.4)"
      w="118px"
      border="1px solid"
      borderColor="cyan.100"
    >
      {/* 店舗ヘッダー */}
      <Flex align="center" gap={2} mb={2}>
        <Box
          w="22px" h="22px"
          borderRadius="lg"
          bg="var(--teal)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="10px"
          flexShrink={0}
        >
          🪙
        </Box>
        <Box>
          <Text fontSize="8px" fontWeight="bold" color="var(--text-main)" lineHeight={1}>銀座一丁目</Text>
          <Text fontSize="7px" color="var(--teal)">集金中</Text>
        </Box>
      </Flex>

      {/* 機種別金額 */}
      <Text fontSize="7.5px" fontWeight="bold" color="var(--text-muted)" mb={1.5}>機種別金額</Text>
      <Box bg="white" borderRadius="md" p={2} mb={1.5} border="1px solid" borderColor="cyan.100">
        <Text fontSize="7px" color="var(--text-main)" mb={1}>洗濯乾燥機</Text>
        <Flex align="center" gap={1} mb={1}>
          <Box bg="var(--app-bg)" px={1.5} py={0.5} borderRadius="sm">
            <Text fontSize="7px" color="var(--text-muted)">枚</Text>
          </Box>
          <Text fontSize="9px" fontWeight="bold" color="var(--text-main)">1250</Text>
        </Flex>
        <Text fontSize="7px" color="var(--teal)" fontWeight="semibold">合計: ¥125,000</Text>
      </Box>
      <Box bg="white" borderRadius="md" p={2} mb={2} border="1px solid" borderColor="cyan.100">
        <Text fontSize="7px" color="var(--text-main)" mb={1}>乾燥機</Text>
        <Flex align="center" gap={1} mb={1}>
          <Box bg="var(--app-bg)" px={1.5} py={0.5} borderRadius="sm">
            <Text fontSize="7px" color="var(--text-muted)">枚</Text>
          </Box>
          <Text fontSize="9px" fontWeight="bold" color="var(--text-main)">254</Text>
        </Flex>
        <Text fontSize="7px" color="var(--teal)" fontWeight="semibold">合計: ¥25,400</Text>
      </Box>

      {/* 合計 */}
      <Box borderTop="1px solid" borderColor="cyan.100" pt={1.5}>
        <Text fontSize="7px" color="var(--text-muted)">合計収益額</Text>
        <Text fontSize="11px" fontWeight="800" color="var(--teal)" fontFamily="'Space Mono', monospace">
          ¥163,200
        </Text>
      </Box>
    </Box>
  </Box>
);

const TopPop = () => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      style={{
        background: "linear-gradient(140deg, #155E75 0%, #0891B2 55%, #06B6D4 100%)",
      }}
    >
      {/* 装飾円 */}
      <Box
        position="absolute" top="-120px" right="-120px"
        w="480px" h="480px" borderRadius="full"
        bg="rgba(255,255,255,0.06)" pointerEvents="none"
      />
      <Box
        position="absolute" bottom="-80px" left="-80px"
        w="320px" h="320px" borderRadius="full"
        bg="rgba(255,255,255,0.05)" pointerEvents="none"
      />

      <Container maxW="container.xl" position="relative">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: 14, lg: 12 }}
          py={{ base: 20, lg: 28 }}
          minH={{ base: "auto", lg: "100vh" }}
        >
          {/* 左：テキスト */}
          <VStack
            align="start"
            gap={7}
            flex={1}
            maxW={{ base: "full", lg: "520px" }}
            style={{ animation: "fadeSlideUp 0.6s ease both" }}
          >
            <Box
              px={4} py={1.5}
              bg="rgba(255,255,255,0.18)"
              borderRadius="full"
              border="1px solid rgba(255,255,255,0.35)"
            >
              <Text fontSize="sm" color="white" fontWeight="semibold" letterSpacing="0.02em">
                コインランドリー集金管理アプリ Collecie
              </Text>
            </Box>

            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              color="white"
              lineHeight="1.15"
              fontWeight="bold"
              letterSpacing="-0.02em"
            >
              集金管理を、
              <br />
              もっとスマートに。
            </Heading>

            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="rgba(255,255,255,0.85)"
              lineHeight="1.9"
              maxW="460px"
            >
              面倒な集金作業をデジタル化。
              <br />
              売上管理から在庫・機器状態まで、これひとつで完結します。
            </Text>

            <HStack gap={3} flexWrap="wrap">
              <Link href="/auth/login">
                <Box
                  px={8} py={3.5}
                  bg="white"
                  color="var(--teal-deeper)"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="bold"
                  boxShadow="0 4px 24px rgba(0,0,0,0.18)"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 32px rgba(0,0,0,0.28)" }}
                >
                  無料で始める →
                </Box>
              </Link>
              <Link href="/auth/login">
                <Box
                  px={8} py={3.5}
                  color="white"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="semibold"
                  border="2px solid rgba(255,255,255,0.55)"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: "rgba(255,255,255,0.1)", borderColor: "white" }}
                >
                  ログイン
                </Box>
              </Link>
            </HStack>

            <HStack gap={{ base: 4, md: 6 }} flexWrap="wrap">
              {["14日間無料トライアル", "クレジットカード不要", "3店舗まで永久無料"].map((label) => (
                <HStack key={label} gap={2}>
                  <Box w="6px" h="6px" borderRadius="full" bg="rgba(255,255,255,0.65)" flexShrink={0} />
                  <Text fontSize="sm" color="rgba(255,255,255,0.82)">{label}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>

          {/* 右：ダッシュボードモック */}
          <Box
            display={{ base: "none", lg: "block" }}
            flex={1}
            maxW="500px"
            w="full"
            style={{ animation: "fadeSlideUp 0.8s ease both 0.25s" }}
          >
            <DashboardMock />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default TopPop;
