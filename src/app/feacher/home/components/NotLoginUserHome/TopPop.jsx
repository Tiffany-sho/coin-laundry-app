import { Box, Container, Flex, Grid, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

const DashboardMock = () => (
  <Box position="relative" pb="28px" pr="20px">
    {/* PC ダッシュボード */}
    <Box
      bg="white"
      borderRadius="2xl"
      p={4}
      boxShadow="0 20px 60px rgba(0,0,0,0.35)"
    >
      {/* Topbar */}
      <Flex
        justify="space-between"
        align="center"
        bg="linear-gradient(90deg, #0E7490, #0891B2)"
        borderRadius="lg"
        px={3}
        py={2}
        mb={3}
      >
        <Text fontSize="xs" color="white" fontWeight="semibold">📊 ダッシュボード</Text>
        <Text fontSize="xs" color="rgba(255,255,255,0.7)">2024年6月</Text>
      </Flex>

      {/* Stats */}
      <Grid templateColumns="repeat(3, 1fr)" gap={2} mb={3}>
        {[
          { label: "今月売上", value: "¥128,400" },
          { label: "管理店舗", value: "3店舗" },
          { label: "次回集金", value: "3日後" },
        ].map((s) => (
          <Box key={s.label} bg="var(--app-bg)" borderRadius="lg" p={2} textAlign="center">
            <Text fontSize="9px" color="var(--text-muted)" mb="2px">{s.label}</Text>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="var(--teal)"
              fontFamily="'Space Mono', monospace"
            >
              {s.value}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Chart */}
      <Box bg="var(--app-bg)" borderRadius="lg" p={3}>
        <Text fontSize="9px" color="var(--text-muted)" mb={2}>月次売上推移</Text>
        <Flex align="flex-end" gap="5px" h="44px">
          {[
            { h: 55, opacity: 0.35 },
            { h: 65, opacity: 0.45 },
            { h: 72, opacity: 0.55 },
            { h: 85, opacity: 0.68 },
            { h: 78, opacity: 0.78 },
            { h: 100, opacity: 1 },
            { h: 40, opacity: 0, isGray: true },
          ].map((bar, i) => (
            <Box
              key={i}
              flex={1}
              style={{ height: `${bar.h}%` }}
              bg={bar.isGray ? "#E2E8F0" : "var(--teal)"}
              opacity={bar.isGray ? 1 : bar.opacity}
              borderRadius="3px 3px 0 0"
            />
          ))}
        </Flex>
        <Flex justify="space-between" mt={1}>
          {["1月", "2月", "3月", "4月", "5月", "6月", "7月"].map((m) => (
            <Text key={m} fontSize="8px" color="var(--text-faint)">{m}</Text>
          ))}
        </Flex>
      </Box>
    </Box>

    {/* スマホモック（右下に重ねる） */}
    <Box
      position="absolute"
      bottom={0}
      right={0}
      bg="white"
      borderRadius="2xl"
      p={3}
      boxShadow="0 8px 32px rgba(0,0,0,0.4)"
      w="116px"
      border="1px solid rgba(8,145,178,0.12)"
    >
      <Box bg="var(--teal)" borderRadius="md" px={2} py={1.5} mb={2}>
        <Text fontSize="8.5px" color="white" fontWeight="bold" textAlign="center">
          💰 集金入力
        </Text>
      </Box>
      {[
        ["店舗A", "¥42,000"],
        ["店舗B", "¥38,500"],
        ["店舗C", "¥47,900"],
      ].map(([name, val]) => (
        <Flex
          key={name}
          justify="space-between"
          align="center"
          bg="var(--app-bg)"
          px={2}
          py={1.5}
          borderRadius="md"
          mb="4px"
        >
          <Text fontSize="8px" color="var(--text-main)">{name}</Text>
          <Text fontSize="8px" color="var(--teal)" fontWeight="bold" fontFamily="'Space Mono', monospace">
            {val}
          </Text>
        </Flex>
      ))}
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
      <Box
        position="absolute" top="35%" left="55%"
        w="240px" h="240px" borderRadius="full"
        bg="rgba(255,255,255,0.03)" pointerEvents="none"
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
            {/* バッジ */}
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

            {/* 見出し */}
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

            {/* サブテキスト */}
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

            {/* CTAボタン */}
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

            {/* トラスト */}
            <HStack gap={{ base: 4, md: 6 }} flexWrap="wrap">
              {["14日間無料トライアル", "クレジットカード不要", "3店舗まで永久無料"].map((label) => (
                <HStack key={label} gap={2}>
                  <Box w="6px" h="6px" borderRadius="full" bg="rgba(255,255,255,0.65)" flexShrink={0} />
                  <Text fontSize="sm" color="rgba(255,255,255,0.82)">{label}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>

          {/* 右：ダッシュボードモック（モバイルでは非表示） */}
          <Box
            display={{ base: "none", lg: "block" }}
            flex={1}
            maxW="480px"
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
