import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";

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
    src: "/screenshots/collect-input.jpeg",
    alt: "集金入力画面",
    imgW: 694,
    imgH: 1361,
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
    src: "/screenshots/inventory.png",
    alt: "在庫管理画面",
    imgW: 704,
    imgH: 1524,
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
    src: "/screenshots/equipment.png",
    alt: "設備管理画面",
    imgW: 704,
    imgH: 1524,
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
    src: "/screenshots/monthly-sales.png",
    alt: "月別売上画面",
    imgW: 704,
    imgH: 1524,
    reverse: true,
  },
];

const FeatureRow = ({ tag, title, description, points, src, alt, imgW, imgH, reverse }) => (
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

    {/* スクリーンショット */}
    <Box
      flex={1}
      minW={0}
      maxW={{ base: "260px", md: "300px" }}
      mx={{ base: "auto", md: 0 }}
      filter="drop-shadow(0 24px 56px rgba(0,0,0,0.28))"
    >
      <Image
        src={src}
        alt={alt}
        width={imgW}
        height={imgH}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
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
