import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import * as Icon from "@/app/feacher/Icon";

const features = [
  {
    tag: "01 集金記録",
    title: "現場でサッと記録、\nそのまま自動集計",
    description:
      "機種ごとの枚数を入力するだけで金額を自動計算。日次・月次・年次の売上データがリアルタイムでグラフ化されます。計算ミスはなくなり、月次集計にかかっていた時間をゼロにできます。",
    points: [
      "機種別・枚数入力で金額を自動計算",
      "複数店舗の売上を一括管理",
      "月次・年次グラフでトレンドを把握",
      "CSV / Excel エクスポート対応",
    ],
    src: "/screenshots/collect-input-phone.png",
    alt: "集金入力画面",
    imgW: 1320,
    imgH: 2736,
    blobColor: "radial-gradient(circle, rgba(8,145,178,0.18) 0%, rgba(6,182,212,0.08) 60%, transparent 100%)",
    reverse: false,
  },
  {
    tag: "02 在庫管理",
    title: "在庫切れを\n事前に防ぐ",
    description:
      "洗剤・柔軟剤の在庫数を店舗ごとに記録。閾値を設定しておくと残量が少なくなった時点でアラートが表示されます。現地に行かなくても補充タイミングがわかり、サービス停止によるクレームを防ぎます。",
    points: [
      "洗剤・柔軟剤・カスタム在庫を管理",
      "閾値アラートで補充タイミングを通知",
      "全店舗の在庫を一覧で確認",
    ],
    src: "/screenshots/manage-stock-phone.png",
    alt: "在庫管理画面",
    imgW: 1320,
    imgH: 2736,
    blobColor: "radial-gradient(circle, rgba(14,116,144,0.16) 0%, rgba(8,145,178,0.06) 60%, transparent 100%)",
    reverse: true,
  },
  {
    tag: "03 機器状態",
    title: "全店舗の機器状態を\nいつでも把握",
    description:
      "洗濯機・乾燥機など各機器の稼働状況・故障情報を一覧で管理。自宅やオフィスからでも全店舗の状況を即座に確認でき、対応の優先順位を素早く判断できます。",
    points: [
      "機器ごとの稼働・故障状態を記録",
      "全店舗の機器を一覧で比較",
      "故障中の機器を店舗名付きで一目確認",
    ],
    src: "/screenshots/manage-equipment-phone.png",
    alt: "設備管理画面",
    imgW: 1320,
    imgH: 2736,
    blobColor: "radial-gradient(circle, rgba(8,145,178,0.18) 0%, rgba(6,182,212,0.08) 60%, transparent 100%)",
    reverse: false,
  },
  {
    /*
      ⚠️ **経費は 2026-08-18 に足した。** 機能としては 2026-08-03 からあるのに
         LP には 1 文字も出ていなかった（`featureList` にも無かった）。
      ⚠️ **「利益」を売り文句の中心に置くこと。** 売上だけなら集金アプリは
         他にもあるが、**売上 − 経費まで出せるのがここの差**。
      ⚠️ 組織ごとに経費を切れる（012）ので「必ず出る」とは書かないこと。
    */
    tag: "04 経費管理",
    title: "売上だけでなく、\n利益まで見える",
    description:
      "家賃・水道光熱費・仕入れなどの支出を記録すると、売上から差し引いた月別の利益がそのままグラフになります。毎月かかる固定費は一度登録すれば自動で計上。確定申告に向けた材料もそのまま書き出せます。",
    points: [
      "単発の支出と毎月の固定費を記録",
      "カテゴリ別の内訳を円グラフで把握",
      "売上 − 経費の「月別利益」を自動計算",
      "経費を含めた CSV / Excel 書き出し",
    ],
    src: "/screenshots/expenses-phone.png",
    alt: "経費管理画面",
    imgW: 1320,
    imgH: 2736,
    blobColor: "radial-gradient(circle, rgba(14,116,144,0.16) 0%, rgba(8,145,178,0.06) 60%, transparent 100%)",
    reverse: true,
  },
  {
    tag: "05 売上レポート",
    title: "データで経営判断を、\nもっとスマートに",
    description:
      "月次・年次の積み上げグラフで店舗別の業績をビジュアルに把握。前月比・前年比を自動計算し、「どの店舗を強化すべきか」「売上が落ちている原因はどこか」を数字で判断できます。",
    points: [
      "店舗別・月次積み上げグラフ",
      "店舗別売上ランキング",
      "前月比・前年比の自動計算",
      "期間・店舗指定でエクスポート",
    ],
    src: "/screenshots/revenue-report-phone.png",
    alt: "月別売上画面",
    imgW: 1320,
    imgH: 2736,
    /* ⚠️ 左右は交互。経費(04)を挟んだので 05 は false に戻す */
    blobColor: "radial-gradient(circle, rgba(8,145,178,0.18) 0%, rgba(6,182,212,0.08) 60%, transparent 100%)",
    reverse: false,
  },
];

const FeatureRow = ({ tag, title, description, points, src, alt, imgW, imgH, blobColor, reverse }) => (
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
              color="var(--teal)"
            >
              <Icon.LuCheck size={11} />
            </Box>
            <Text fontSize="sm" color="var(--text-main)">{p}</Text>
          </Flex>
        ))}
      </VStack>
    </VStack>

    {/* スクリーンショット＋背景ブロブ */}
    <Box
      flex={1}
      minW={0}
      maxW={{ base: "260px", md: "300px" }}
      mx={{ base: "auto", md: 0 }}
      position="relative"
    >
      {/* 背景ブロブ（円形グラデーション） */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        style={{
          transform: "translate(-50%, -50%)",
          background: blobColor,
          width: "140%",
          height: "140%",
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* 画像本体 */}
      {/*
        ⚠️ **角丸で切り抜かないこと。** スクショは端末の枠込み・背景透過で
           書き出してあるので、四角を丸く切ると**枠の角が削れる。**
        ⚠️ 影は `drop-shadow`（アルファを辿る）のまま。`box-shadow` に
           変えると透過部分ごと四角い影が落ちる。
      */}
      <Box
        position="relative"
        zIndex={1}
        filter="drop-shadow(0 24px 48px rgba(14,116,144,0.28))"
      >
        <Image
          src={src}
          alt={alt}
          width={imgW}
          height={imgH}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>
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
            集金・在庫・機器・売上レポートをひとつのアプリで完結
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
