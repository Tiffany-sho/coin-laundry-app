import { Box, Container, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

const TopPop = () => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      /*
        ⚠️ **淡い地にした**（2026-08-17）。以前は `#155E75 → #0891B2 → #06B6D4` の
           濃いシアンで、画面の高さいっぱい（`minH="100vh"`）を濃色が占めていた。
        ⚠️ **地を薄くしたら、上に乗る白文字と白ボタンを必ず反転させること。**
           下の見出し・本文・ボタン・箇条書きの点はすべてこの地の上にある。
      */
      style={{
        background: "linear-gradient(140deg, #ECFEFF 0%, #CFFAFE 100%)",
      }}
    >
      {/* 装飾円。⚠️ 淡い地では白が消えるのでティールの薄い影にする */}
      <Box position="absolute" top="-120px" right="-120px" w="480px" h="480px" borderRadius="full" bg="rgba(8,145,178,0.07)" pointerEvents="none" />
      <Box position="absolute" bottom="-80px" left="-80px" w="320px" h="320px" borderRadius="full" bg="rgba(8,145,178,0.06)" pointerEvents="none" />

      <Container maxW="container.xl" position="relative">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: 14, lg: 12 }}
          pt={{ base: 20, lg: 28 }}
          pb={{ base: 28, lg: 28 }}
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
              bg="var(--card-bg, #FFFFFF)"
              borderRadius="full"
              border="1px solid"
              borderColor="cyan.200"
            >
              <Text fontSize="sm" color="var(--teal-deeper, #155E75)" fontWeight="semibold" letterSpacing="0.02em">
                コインランドリー集金管理アプリ Collecie
              </Text>
            </Box>

            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              color="var(--teal-deeper, #155E75)"
              lineHeight="1.15"
              fontWeight="bold"
              letterSpacing="-0.02em"
            >
              集金ノートを、
              <br />
              卒業しませんか。
            </Heading>

            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="var(--text-muted, #64748B)"
              lineHeight="1.9"
              maxW="460px"
            >
              機種ごとの枚数を入力するだけで、売上を自動集計。
              <br />
              在庫管理から機器状態まで、スマホひとつでまとめて管理できます。
            </Text>

            <HStack gap={3} flexWrap="wrap">
              {/*
                ⚠️ **主 CTA は塗りのティールのまま残す。** 地を淡くしたので、
                   白地のボタンだと背景と同化して押しどころが消える。
              */}
              <Link href="/auth/login">
                <Box
                  px={8} py={3.5}
                  bg="var(--teal, #0891B2)"
                  color="white"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="bold"
                  boxShadow="0 4px 20px rgba(8,145,178,0.32)"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: "var(--teal-dark, #0E7490)", transform: "translateY(-2px)", boxShadow: "0 8px 28px rgba(8,145,178,0.42)" }}
                >
                  無料で始める →
                </Box>
              </Link>
              <Link href="/auth/login">
                <Box
                  px={8} py={3.5}
                  bg="var(--card-bg, #FFFFFF)"
                  color="var(--teal-dark, #0E7490)"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="semibold"
                  border="2px solid"
                  borderColor="cyan.300"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: "var(--teal-pale, #CFFAFE)", borderColor: "var(--teal, #0891B2)" }}
                >
                  ログイン
                </Box>
              </Link>
            </HStack>

            <HStack gap={{ base: 4, md: 6 }} flexWrap="wrap">
              {["Proプランは6か月無料", "3店舗まで永久無料"].map((label) => (
                <HStack key={label} gap={2}>
                  <Box w="6px" h="6px" borderRadius="full" bg="var(--teal, #0891B2)" flexShrink={0} />
                  <Text fontSize="sm" color="var(--text-muted, #64748B)">{label}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>

          {/* 右：実際のスクリーンショット */}
          <Box
            flex={1}
            maxW={{ base: "420px", lg: "540px" }}
            w="full"
            position="relative"
            alignSelf={{ base: "center", lg: "auto" }}
            style={{ animation: "fadeSlideUp 0.8s ease both 0.25s" }}
          >
            {/*
              PC 収益レポート画面（ノート PC のモック・背景透過）。

              ⚠️ **中身を差し替えるときはファイル名も変えること。**
                 next/image の応答は `immutable` で 1 年キャッシュされるため、
                 **同じ名前のまま画像だけ入れ替えても、ブラウザも Vercel の CDN も
                 古いほうを出し続ける。** 実際 `revenue-report-pc.png` のまま
                 差し替えて反映されなかった（2026-08-18）。
            */}
            {/*
              ⚠️ **角丸・`overflow:hidden`・`box-shadow` を付けないこと。**
                 画像が端末の形をしていて背景が透過しているので、四角い箱を
                 かぶせると**淡い地の上に白い箱が出る**（差し替え前は
                 ブラウザ画面の直取りだったので箱が要った）。
              ⚠️ 影は `drop-shadow`（アルファを辿る）。`box-shadow` だと
                 透過部分ごと四角い影が落ちる。
            */}
            <Box filter="drop-shadow(0 24px 48px rgba(14,116,144,0.30))">
              <Image
                src="/screenshots/revenue-dashboard-pc.png"
                alt="Collecie 収益レポート画面"
                width={1215}
                height={880}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
            </Box>

            {/* スマホ（月次売上）— 右下に重ねる */}
            {/* ⚠️ 角丸で切り抜かない。枠込み・背景透過のスクショなので角が削れる */}
            <Box
              position="absolute"
              bottom="-20px"
              right={{ base: "-8px", lg: "-16px" }}
              w={{ base: "110px", lg: "150px" }}
              filter="drop-shadow(0 20px 40px rgba(14,116,144,0.35))"
            >
              <Image
                src="/screenshots/revenue-report-phone.png"
                alt="Collecie 収益レポート（スマホ）"
                width={1320}
                height={2736}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default TopPop;
