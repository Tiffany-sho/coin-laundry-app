import { Box, Container, Flex, Grid, Heading, Text, VStack } from "@chakra-ui/react";

/* ---- モックアップ部品 ---- */

const CollectMock = () => (
  <Box bg="white" borderRadius="2xl" p={5} boxShadow="var(--shadow-hero)" border="1px solid" borderColor="cyan.100">
    <Flex
      bg="linear-gradient(90deg,#0E7490,#0891B2)"
      borderRadius="lg"
      px={4}
      py={2.5}
      mb={4}
      align="center"
      justify="space-between"
    >
      <Text fontSize="sm" color="white" fontWeight="bold">💰 集金入力</Text>
      <Text fontSize="xs" color="rgba(255,255,255,0.7)">2024年6月15日</Text>
    </Flex>
    {[
      { name: "🏪 店舗A", val: "¥42,000" },
      { name: "🏪 店舗B", val: "¥38,500" },
      { name: "🏪 店舗C", val: "¥47,900" },
    ].map((r) => (
      <Flex
        key={r.name}
        justify="space-between"
        align="center"
        bg="var(--app-bg)"
        px={4}
        py={3}
        borderRadius="lg"
        mb={2}
        fontSize="sm"
      >
        <Text color="var(--text-main)">{r.name}</Text>
        <Text color="var(--teal)" fontWeight="bold" fontFamily="'Space Mono', monospace">{r.val}</Text>
      </Flex>
    ))}
    <Box mt={4} mb={3} px={1}>
      <Text fontSize="xs" color="var(--text-muted)">今月累計</Text>
      <Text fontSize="2xl" fontWeight="800" color="var(--teal)" fontFamily="'Space Mono', monospace">
        ¥128,400
      </Text>
    </Box>
    <Box bg="var(--teal)" borderRadius="lg" py={3} textAlign="center">
      <Text fontSize="sm" color="white" fontWeight="bold">記録する</Text>
    </Box>
  </Box>
);

const InventoryMock = () => (
  <Box bg="white" borderRadius="2xl" p={5} boxShadow="var(--shadow-hero)" border="1px solid" borderColor="cyan.100">
    <Flex
      bg="linear-gradient(90deg,#155E75,#0E7490)"
      borderRadius="lg"
      px={4}
      py={2.5}
      mb={4}
      align="center"
      justify="space-between"
    >
      <Text fontSize="sm" color="white" fontWeight="bold">📦 在庫管理</Text>
      <Text fontSize="xs" color="rgba(255,255,255,0.7)">店舗A</Text>
    </Flex>
    <Flex justify="space-between" align="center" bg="var(--app-bg)" px={4} py={3} borderRadius="lg" mb={2} fontSize="sm">
      <Text color="var(--text-main)">🧴 洗剤</Text>
      <Text color="var(--teal)" fontWeight="bold">残り 5本 ✓</Text>
    </Flex>
    <Flex justify="space-between" align="center" bg="#FFF8F8" px={4} py={3} borderRadius="lg" mb={2} fontSize="sm" border="1.5px solid" borderColor="red.200">
      <Text color="var(--text-main)">🫧 柔軟剤</Text>
      <Text color="red.500" fontWeight="bold">残り 1本 ⚠</Text>
    </Flex>
    <Flex justify="space-between" align="center" bg="var(--app-bg)" px={4} py={3} borderRadius="lg" mb={4} fontSize="sm">
      <Text color="var(--text-main)">🧹 カスタム</Text>
      <Text color="var(--teal)" fontWeight="bold">残り 3個 ✓</Text>
    </Flex>
    <Box bg="#FFF3CD" borderRadius="lg" px={4} py={3}>
      <Text fontSize="xs" color="#92400E" lineHeight="1.6">
        ⚠ 柔軟剤の在庫が少なくなっています。補充をご確認ください。
      </Text>
    </Box>
  </Box>
);

const MachineMock = () => (
  <Box bg="white" borderRadius="2xl" p={5} boxShadow="var(--shadow-hero)" border="1px solid" borderColor="cyan.100">
    <Flex
      bg="linear-gradient(90deg,#0891B2,#06B6D4)"
      borderRadius="lg"
      px={4}
      py={2.5}
      mb={4}
      align="center"
      justify="space-between"
    >
      <Text fontSize="sm" color="white" fontWeight="bold">🔧 機器状態</Text>
      <Text fontSize="xs" color="rgba(255,255,255,0.7)">全店舗</Text>
    </Flex>
    <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
      {[
        { name: "🌀 洗濯機A", ok: true },
        { name: "🌀 洗濯機B", ok: true },
        { name: "🌪 乾燥機A", ok: false },
        { name: "🌪 乾燥機B", ok: true },
      ].map((m) => (
        <Box
          key={m.name}
          bg={m.ok ? "var(--app-bg)" : "#FFF8F8"}
          border="1.5px solid"
          borderColor={m.ok ? "cyan.200" : "red.200"}
          borderRadius="xl"
          p={3}
          textAlign="center"
        >
          <Text fontSize="sm" color="var(--text-main)" mb={1}>{m.name}</Text>
          <Text fontSize="xs" fontWeight="bold" color={m.ok ? "var(--teal)" : "red.500"}>
            {m.ok ? "● 稼働中" : "● 故障中"}
          </Text>
        </Box>
      ))}
    </Grid>
    <Box bg="#FFF8F8" borderRadius="lg" px={4} py={3} border="1px solid" borderColor="red.100">
      <Text fontSize="xs" color="red.700" lineHeight="1.6">
        ❌ 乾燥機Aが故障中です。修理業者に連絡済み。
      </Text>
    </Box>
  </Box>
);

const ReportMock = () => (
  <Box bg="white" borderRadius="2xl" p={5} boxShadow="var(--shadow-hero)" border="1px solid" borderColor="cyan.100">
    <Flex
      bg="linear-gradient(90deg,#0E7490,#0891B2)"
      borderRadius="lg"
      px={4}
      py={2.5}
      mb={4}
      align="center"
      justify="space-between"
    >
      <Text fontSize="sm" color="white" fontWeight="bold">📊 売上レポート</Text>
      <Text fontSize="xs" color="rgba(255,255,255,0.7)">2024年</Text>
    </Flex>
    <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
      <Box bg="var(--app-bg)" borderRadius="lg" p={3} textAlign="center">
        <Text fontSize="xs" color="var(--text-muted)" mb={1}>今月</Text>
        <Text fontSize="xl" fontWeight="800" color="var(--teal)" fontFamily="'Space Mono', monospace">
          ¥128,400
        </Text>
      </Box>
      <Box bg="var(--app-bg)" borderRadius="lg" p={3} textAlign="center">
        <Text fontSize="xs" color="var(--text-muted)" mb={1}>前月比</Text>
        <Text fontSize="xl" fontWeight="800" color="green.500" fontFamily="'Space Mono', monospace">
          +12.3%
        </Text>
      </Box>
    </Grid>
    <Box bg="var(--app-bg)" borderRadius="lg" p={3}>
      <Text fontSize="xs" color="var(--text-muted)" mb={3}>月次売上グラフ（2024年）</Text>
      <Flex align="flex-end" gap="6px" h="52px" mb={1}>
        {[
          { h: 50, opacity: 0.3 },
          { h: 62, opacity: 0.4 },
          { h: 70, opacity: 0.52 },
          { h: 80, opacity: 0.64 },
          { h: 75, opacity: 0.76 },
          { h: 100, opacity: 1 },
          { h: 38, gray: true },
        ].map((b, i) => (
          <Box
            key={i}
            flex={1}
            style={{ height: `${b.h}%` }}
            bg={b.gray ? "#E2E8F0" : "var(--teal)"}
            opacity={b.gray ? 1 : b.opacity}
            borderRadius="3px 3px 0 0"
          />
        ))}
      </Flex>
      <Flex justify="space-between">
        {["1月", "2月", "3月", "4月", "5月", "6月", "7月"].map((m) => (
          <Text key={m} fontSize="8px" color="var(--text-faint)">{m}</Text>
        ))}
      </Flex>
    </Box>
  </Box>
);

/* ---- 各機能の定義 ---- */

const features = [
  {
    tag: "01 集金記録",
    title: "現場でサッと記録、\nそのまま自動集計",
    description:
      "現金・電子マネー問わず、その場でスマホから記録するだけ。日次・月次・年次の売上データが自動で集計され、グラフ化されます。",
    points: [
      "複数店舗の売上を一括管理",
      "月次・年次グラフでトレンドを把握",
      "前月比・前年比を自動計算",
      "CSV / Excel エクスポート対応",
    ],
    mock: <CollectMock />,
    reverse: false,
  },
  {
    tag: "02 在庫管理",
    title: "在庫切れを\n事前に防ぐ",
    description:
      "洗剤・柔軟剤の在庫数を店舗ごとに記録。閾値を設定しておくと残量が少なくなった時点でアラートが表示されます。",
    points: [
      "洗剤・柔軟剤・カスタム在庫を管理",
      "閾値アラートで補充タイミングを通知",
      "全店舗の在庫を一覧で確認",
    ],
    mock: <InventoryMock />,
    reverse: true,
  },
  {
    tag: "03 機器状態",
    title: "全店舗の機器状態を\nいつでも把握",
    description:
      "洗濯機・乾燥機など各機器の稼働状況・故障情報を一覧で管理。現地に行かなくても状況を確認でき、メンテナンスを効率化します。",
    points: [
      "機器ごとの稼働・故障状態を記録",
      "全店舗の機器を一覧で比較",
      "集金時に気づいた不具合をメモ",
    ],
    mock: <MachineMock />,
    reverse: false,
  },
  {
    tag: "04 売上レポート",
    title: "データで経営判断を、\nもっとスマートに",
    description:
      "月次・年次の売上グラフで業績をビジュアルに把握。店舗別の比較や前年同月比など、経営判断に必要な数字をすぐに確認できます。",
    points: [
      "月次・年次売上グラフ",
      "店舗別売上ランキング",
      "前月比・前年比の自動計算",
      "期間・店舗指定でエクスポート",
    ],
    mock: <ReportMock />,
    reverse: true,
  },
];

const FeatureRow = ({ tag, title, description, points, mock, reverse }) => (
  <Flex
    direction={{ base: "column", md: reverse ? "row-reverse" : "row" }}
    gap={{ base: 8, md: 14 }}
    align="center"
    mb={{ base: 16, md: 24 }}
    _last={{ mb: 0 }}
  >
    {/* テキスト */}
    <VStack align="start" gap={5} flex={1} minW={0}>
      <Text
        fontSize="xs"
        fontWeight="bold"
        color="var(--teal)"
        letterSpacing="0.1em"
        fontFamily="'Space Mono', monospace"
      >
        {tag}
      </Text>
      <Heading
        fontSize={{ base: "2xl", md: "3xl" }}
        color="var(--text-main)"
        letterSpacing="-0.01em"
        lineHeight="1.35"
        whiteSpace="pre-line"
      >
        {title}
      </Heading>
      <Text fontSize={{ base: "sm", md: "md" }} color="var(--text-muted)" lineHeight="1.85">
        {description}
      </Text>
      <VStack align="start" gap={2}>
        {points.map((p) => (
          <Flex key={p} align="center" gap={2}>
            <Box
              w="18px" h="18px"
              borderRadius="full"
              bg="var(--teal-pale)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text fontSize="9px" color="var(--teal)" fontWeight="bold">✓</Text>
            </Box>
            <Text fontSize="sm" color="var(--text-main)">{p}</Text>
          </Flex>
        ))}
      </VStack>
    </VStack>

    {/* モックアップ */}
    <Box flex={1} minW={0} maxW={{ base: "full", md: "440px" }}>
      {mock}
    </Box>
  </Flex>
);

const FeatureShowcase = () => {
  return (
    <Box py={{ base: 20, md: 28 }} bg="var(--app-bg, #F0F9FF)">
      <Container maxW="container.xl">
        {/* 見出し */}
        <VStack gap={3} textAlign="center" mb={{ base: 14, md: 20 }}>
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
            コインランドリー経営に必要な管理業務を一元化
          </Text>
        </VStack>

        {/* 機能ロウ */}
        {features.map((f) => (
          <FeatureRow key={f.tag} {...f} />
        ))}
      </Container>
    </Box>
  );
};

export default FeatureShowcase;
