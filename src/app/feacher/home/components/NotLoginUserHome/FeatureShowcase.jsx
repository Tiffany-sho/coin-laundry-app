import { Box, Container, Flex, Grid, Heading, Text, VStack } from "@chakra-ui/react";

const STORE_COLORS = ["#818CF8", "#34D399", "#FCD34D", "#F9A8D4", "#C4B5FD", "#67E8F9"];

/* ---- 集金入力モック（Image 5 準拠） ---- */
const CollectMock = () => (
  <Box bg="var(--app-bg)" borderRadius="2xl" overflow="hidden" boxShadow="var(--shadow-hero)" border="1px solid" borderColor="cyan.100">
    {/* 店舗ヘッダー */}
    <Box bg="white" px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={3}>
          <Box
            w="40px" h="40px"
            borderRadius="xl"
            bg="var(--teal)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="18px"
          >
            🪙
          </Box>
          <Box>
            <Text fontSize="md" fontWeight="bold" color="var(--text-main)">銀座一丁目</Text>
            <Text fontSize="xs" color="var(--teal)">集金中</Text>
          </Box>
        </Flex>
        <Box
          bg="var(--teal)"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px={3}
          py={1.5}
          borderRadius="lg"
        >
          店舗切り替え
        </Box>
      </Flex>
    </Box>

    <Box px={5} py={4}>
      {/* 集金方式 */}
      <Box bg="white" borderRadius="xl" p={4} mb={4} border="1px solid" borderColor="cyan.100">
        <Flex align="center" justify="space-between" mb={1}>
          <Flex align="center" gap={2}>
            <Text fontSize="sm" color="var(--teal)">¥</Text>
            <Text fontSize="sm" fontWeight="bold" color="var(--text-main)">集金方式</Text>
          </Flex>
          {/* トグル */}
          <Box w="40px" h="22px" bg="var(--teal)" borderRadius="full" position="relative">
            <Box position="absolute" right="3px" top="3px" w="16px" h="16px" bg="white" borderRadius="full" />
          </Box>
        </Flex>
        <Text fontSize="xs" color="var(--text-muted)">各機種ごとに金額を入力します</Text>
      </Box>

      {/* 機種別金額 */}
      <Flex align="center" gap={2} mb={3}>
        <Text fontSize="sm" color="var(--teal)">¥</Text>
        <Text fontSize="sm" fontWeight="bold" color="var(--text-main)">機種別金額</Text>
      </Flex>

      {/* 洗濯乾燥機 */}
      <Box bg="white" borderRadius="xl" p={4} mb={3} border="1px solid" borderColor="cyan.100">
        <Flex align="center" justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">洗濯乾燥機</Text>
          <Box w="28px" h="28px" borderRadius="full" border="1.5px solid" borderColor="cyan.300" display="flex" alignItems="center" justifyContent="center">
            <Text fontSize="10px" color="var(--teal)">↺</Text>
          </Box>
        </Flex>
        <Text fontSize="xs" color="var(--text-muted)" mb={2}>枚数を入力</Text>
        <Flex align="center" gap={2} mb={2}>
          <Box bg="var(--app-bg)" px={3} py={1.5} borderRadius="lg" border="1px solid" borderColor="cyan.100">
            <Text fontSize="xs" color="var(--text-muted)">枚</Text>
          </Box>
          <Text fontSize="md" fontWeight="bold" color="var(--text-main)" flex={1}>1250</Text>
        </Flex>
        <Box bg="var(--app-bg)" borderRadius="lg" px={3} py={2}>
          <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">合計: ¥125,000</Text>
        </Box>
      </Box>

      {/* 乾燥機 */}
      <Box bg="white" borderRadius="xl" p={4} mb={4} border="1px solid" borderColor="cyan.100">
        <Flex align="center" justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">乾燥機</Text>
          <Box w="28px" h="28px" borderRadius="full" border="1.5px solid" borderColor="cyan.300" display="flex" alignItems="center" justifyContent="center">
            <Text fontSize="10px" color="var(--teal)">↺</Text>
          </Box>
        </Flex>
        <Text fontSize="xs" color="var(--text-muted)" mb={2}>枚数を入力</Text>
        <Flex align="center" gap={2} mb={2}>
          <Box bg="var(--app-bg)" px={3} py={1.5} borderRadius="lg" border="1px solid" borderColor="cyan.100">
            <Text fontSize="xs" color="var(--text-muted)">枚</Text>
          </Box>
          <Text fontSize="md" fontWeight="bold" color="var(--text-main)" flex={1}>254</Text>
        </Flex>
        <Box bg="var(--app-bg)" borderRadius="lg" px={3} py={2}>
          <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">合計: ¥25,400</Text>
        </Box>
      </Box>

      {/* 合計収益額 */}
      <Box borderTop="1px solid" borderColor="gray.100" pt={3} mb={4}>
        <Text fontSize="xs" color="var(--text-muted)" mb={1}>合計収益額</Text>
        <Text fontSize="2xl" fontWeight="800" color="var(--teal)" fontFamily="'Space Mono', monospace">
          ¥163,200
        </Text>
      </Box>

      {/* ボタン */}
      <Flex gap={2}>
        <Box flex={1} py={3} borderRadius="xl" border="1.5px solid" borderColor="gray.200" textAlign="center">
          <Text fontSize="sm" color="var(--text-muted)" fontWeight="semibold">キャンセル</Text>
        </Box>
        <Box flex={1} py={3} borderRadius="xl" border="1.5px solid" borderColor="cyan.300" textAlign="center">
          <Text fontSize="sm" color="var(--teal)" fontWeight="semibold">一時保存</Text>
        </Box>
        <Box flex={1} py={3} borderRadius="xl" bg="var(--teal)" textAlign="center">
          <Text fontSize="sm" color="white" fontWeight="bold">登録確認</Text>
        </Box>
      </Flex>
    </Box>
  </Box>
);

/* ---- 在庫管理モック（Image 2 準拠） ---- */
const storeStocks = [
  { name: "銀座一丁目店", det: 2,  sof: 4,  ok: true },
  { name: "表参道店",     det: 10, sof: 7,  ok: true },
  { name: "下北沢店",     det: 1,  sof: 1,  ok: false },
  { name: "三軒茶屋店",   det: 2,  sof: 2,  ok: true },
  { name: "神楽坂店",     det: 2,  sof: 7,  ok: true },
  { name: "浅草雷門店",   det: 2,  sof: 5,  ok: true },
];

const StatusBadge = ({ ok }) => (
  <Box
    w="26px" h="26px"
    borderRadius="full"
    bg={ok ? "var(--teal)" : "#F97316"}
    display="flex"
    alignItems="center"
    justifyContent="center"
    flexShrink={0}
  >
    <Text fontSize="11px" color="white" fontWeight="bold">{ok ? "✓" : "!"}</Text>
  </Box>
);

const InventoryMock = () => (
  <Box bg="var(--app-bg)" borderRadius="2xl" overflow="hidden" boxShadow="var(--shadow-hero)" border="1px solid" borderColor="cyan.100">
    {/* ヘッダー */}
    <Box bg="white" px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={3}>
          <Box w="40px" h="40px" borderRadius="xl" bg="var(--teal)" display="flex" alignItems="center" justifyContent="center" fontSize="18px">
            📦
          </Box>
          <Box>
            <Text fontSize="md" fontWeight="bold" color="var(--text-main)">在庫管理</Text>
            <Text fontSize="xs" color="var(--text-muted)">全店舗の在庫状況</Text>
          </Box>
        </Flex>
        <Text fontSize="xs" color="var(--teal)" fontWeight="semibold">設備管理 &gt;</Text>
      </Flex>
    </Box>

    <Box px={4} py={3}>
      {/* ステータスバナー */}
      <Box bg="#ECFEFF" border="1px solid" borderColor="cyan.200" borderRadius="lg" px={4} py={2.5} mb={3}>
        <Flex align="center" gap={2}>
          <Text fontSize="xs" color="var(--teal)">✓</Text>
          <Text fontSize="xs" fontWeight="semibold" color="var(--teal)">全店舗の在庫は問題ありません</Text>
        </Flex>
      </Box>

      {/* 店舗リスト */}
      <VStack gap={2} align="stretch">
        {storeStocks.map((s) => (
          <Box
            key={s.name}
            bg="white"
            borderRadius="xl"
            px={4}
            py={3}
            border="1.5px solid"
            borderColor={s.ok ? "cyan.100" : "orange.200"}
            style={s.ok ? {} : { background: "#FFF7ED" }}
          >
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color={s.ok ? "var(--text-main)" : "#C2410C"}>
                  {s.name}
                </Text>
                <Text fontSize="xs" color={s.ok ? "var(--text-muted)" : "#EA580C"}>
                  洗剤: {s.det}　柔軟剤: {s.sof}
                </Text>
              </Box>
              <StatusBadge ok={s.ok} />
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  </Box>
);

/* ---- 設備管理モック（Image 3 準拠） ---- */
const storeEquip = [
  { name: "銀座一丁目", ok: true,  detail: "全8台稼働中", tags: [] },
  { name: "表参道",     ok: false, detail: "店内状況 故障中", tags: ["店内状況 故障中"] },
  { name: "下北沢",     ok: false, detail: "", tags: ["洗濯乾燥機 故障中", "洗濯機 故障中"] },
  { name: "三軒茶屋",   ok: true,  detail: "全8台稼働中", tags: [] },
  { name: "神楽坂",     ok: false, detail: "", tags: ["スニーカー洗濯機 故障中"] },
  { name: "浅草雷門",   ok: true,  detail: "全8台稼働中", tags: [] },
];

const MachineMock = () => (
  <Box bg="var(--app-bg)" borderRadius="2xl" overflow="hidden" boxShadow="var(--shadow-hero)" border="1px solid" borderColor="cyan.100">
    {/* ヘッダー */}
    <Box bg="white" px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={3}>
          <Box w="40px" h="40px" borderRadius="xl" bg="var(--teal)" display="flex" alignItems="center" justifyContent="center" fontSize="18px">
            🔧
          </Box>
          <Box>
            <Text fontSize="md" fontWeight="bold" color="var(--text-main)">設備管理</Text>
            <Text fontSize="xs" color="var(--text-muted)">全店舗の機器状態</Text>
          </Box>
        </Flex>
        <Text fontSize="xs" color="var(--teal)" fontWeight="semibold">在庫管理 &gt;</Text>
      </Flex>
    </Box>

    <Box px={4} py={3}>
      {/* 故障バナー */}
      <Box bg="#FFF7ED" border="1px solid" borderColor="orange.200" borderRadius="lg" px={4} py={2.5} mb={3}>
        <Flex align="center" gap={2}>
          <Text fontSize="xs" color="#F97316">!</Text>
          <Text fontSize="xs" fontWeight="semibold" color="#C2410C">3店舗で4台の機器が故障中です。</Text>
        </Flex>
      </Box>

      {/* 店舗リスト */}
      <VStack gap={2} align="stretch">
        {storeEquip.map((s) => (
          <Box
            key={s.name}
            bg="white"
            borderRadius="xl"
            px={4}
            py={3}
            border="1.5px solid"
            borderColor={s.ok ? "cyan.100" : "orange.200"}
            style={s.ok ? {} : { background: "#FFF7ED" }}
          >
            <Flex align="center" justify="space-between">
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="semibold" color={s.ok ? "var(--text-main)" : "#C2410C"} mb={s.tags.length ? 1 : 0}>
                  {s.name}
                </Text>
                {s.detail && !s.tags.length && (
                  <Text fontSize="xs" color="var(--text-muted)">{s.detail}</Text>
                )}
                {s.tags.length > 0 && (
                  <Flex gap={1.5} flexWrap="wrap">
                    {s.tags.map((t) => (
                      <Box key={t} bg="#FFEDD5" px={2} py={0.5} borderRadius="md">
                        <Text fontSize="10px" color="#EA580C" fontWeight="semibold">{t}</Text>
                      </Box>
                    ))}
                  </Flex>
                )}
              </Box>
              <StatusBadge ok={s.ok} />
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  </Box>
);

/* ---- 売上レポートモック（Image 1 準拠） ---- */
const barDataMonthly = [
  [22, 13, 10, 9, 7, 1],
  [28, 14, 12, 11, 9, 2],
  [18, 9, 7, 6, 4, 1],
  [26, 12, 10, 9, 7, 1],
  [27, 13, 11, 10, 8, 2],
  [24, 11, 9, 8, 5, 1],
];
const months = ["2026年\n1月", "2月", "3月", "4月", "5月", "6月"];

const ReportMock = () => (
  <Box bg="white" borderRadius="2xl" overflow="hidden" boxShadow="var(--shadow-hero)" border="1px solid" borderColor="cyan.100">
    {/* ヘッダー */}
    <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
      <Flex align="center" gap={2} mb={1}>
        <Text fontSize="xs" color="var(--text-muted)">🗓</Text>
        <Text fontSize="md" fontWeight="bold" color="var(--text-main)">月別売上</Text>
      </Flex>
    </Box>

    <Box px={5} py={4}>
      {/* 集金総額 */}
      <Text fontSize="xs" color="var(--text-muted)" mb={1}>集金総額</Text>
      <Flex align="baseline" gap={1} mb={1}>
        <Text fontSize="2xl" fontWeight="800" color="var(--text-main)" fontFamily="'Space Mono', monospace">
          ¥14,870,300
        </Text>
        <Text fontSize="xs" color="var(--text-muted)">円 累計 66回</Text>
      </Flex>
      <Text fontSize="xs" color="var(--text-muted)" mb={4}>2025/12/01 〜 2026/06/01</Text>

      {/* 積み上げ棒グラフ */}
      <Box bg="#F8FAFC" borderRadius="xl" p={3} mb={4}>
        <Flex align="flex-end" gap="8px" h="80px" mb={2}>
          {barDataMonthly.map((bars, i) => (
            <Box key={i} flex={1} display="flex" flexDirection="column-reverse" h="full" gap="1.5px">
              {bars.map((h, j) => (
                <Box
                  key={j}
                  w="full"
                  style={{ height: `${h * 2.2}%` }}
                  bg={STORE_COLORS[j]}
                  borderRadius={j === bars.length - 1 ? "3px 3px 0 0" : "0"}
                  opacity={0.88}
                />
              ))}
            </Box>
          ))}
        </Flex>
        <Flex justify="space-around">
          {months.map((m, i) => (
            <Text key={i} fontSize="8px" color="var(--text-faint)" whiteSpace="pre-line" textAlign="center">{m}</Text>
          ))}
        </Flex>
      </Box>

      {/* 凡例 */}
      <Flex flexWrap="wrap" gap={2} mb={4}>
        {["銀座一丁目", "表参道", "下北沢", "三軒茶屋", "神楽坂", "浅草雷門"].map((s, i) => (
          <Flex key={s} align="center" gap={1}>
            <Box w="8px" h="8px" borderRadius="2px" bg={STORE_COLORS[i]} />
            <Text fontSize="9px" color="var(--text-muted)">{s}</Text>
          </Flex>
        ))}
      </Flex>

      {/* 月次サマリー */}
      <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
        <Flex align="center" gap={1} mb={3}>
          <Text fontSize="xs" color="var(--text-muted)">🗓</Text>
          <Text fontSize="sm" fontWeight="bold" color="var(--text-main)">月次サマリー</Text>
        </Flex>
        <Grid templateColumns="1fr 1fr 1fr" gap={0}>
          {["年月", "合計", "前月比"].map((h) => (
            <Text key={h} fontSize="xs" color="var(--text-faint)" pb={2} borderBottom="1px solid" borderColor="gray.100">{h}</Text>
          ))}
          {[
            { m: "2026年5月", t: "¥2,780,200", pct: "+12.5%", up: true },
            { m: "2026年4月", t: "¥2,471,000", pct: "+49.3%", up: true },
            { m: "2026年3月", t: "¥1,654,800", pct: "−23.2%", up: false },
          ].map((r) => (
            <>
              <Text key={r.m + "m"} fontSize="xs" color="var(--text-muted)" py={2.5} borderBottom="1px solid" borderColor="gray.50">{r.m}</Text>
              <Text key={r.m + "t"} fontSize="xs" color="var(--text-main)" fontWeight="600" py={2.5} borderBottom="1px solid" borderColor="gray.50">{r.t}</Text>
              <Text key={r.m + "p"} fontSize="xs" color={r.up ? "green.500" : "red.500"} fontWeight="600" py={2.5} borderBottom="1px solid" borderColor="gray.50">{r.pct}</Text>
            </>
          ))}
        </Grid>
      </Box>
    </Box>
  </Box>
);

/* ---- 機能定義 ---- */
const features = [
  {
    tag: "01 集金記録",
    title: "現場でサッと記録、\nそのまま自動集計",
    description:
      "機種ごとの枚数を入力するだけで金額を自動計算。日次・月次・年次の売上データが自動で集計され、グラフ化されます。",
    points: [
      "機種別・枚数入力で金額を自動計算",
      "複数店舗の売上を一括管理",
      "月次・年次グラフでトレンドを把握",
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
      "故障中の機器を店舗名付きで一目確認",
    ],
    mock: <MachineMock />,
    reverse: false,
  },
  {
    tag: "04 売上レポート",
    title: "データで経営判断を、\nもっとスマートに",
    description:
      "月次・年次の積み上げグラフで店舗別の業績をビジュアルに把握。前月比・前年比など、経営判断に必要な数字をすぐに確認できます。",
    points: [
      "店舗別・月次積み上げグラフ",
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
    <Box flex={1} minW={0} maxW={{ base: "full", md: "420px" }}>
      {mock}
    </Box>
  </Flex>
);

const FeatureShowcase = () => {
  return (
    <Box py={{ base: 20, md: 28 }} bg="var(--app-bg, #F0F9FF)">
      <Container maxW="container.xl">
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

        {features.map((f) => (
          <FeatureRow key={f.tag} {...f} />
        ))}
      </Container>
    </Box>
  );
};

export default FeatureShowcase;
