import { Box, Container, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

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
      <Box position="absolute" top="-120px" right="-120px" w="480px" h="480px" borderRadius="full" bg="rgba(255,255,255,0.06)" pointerEvents="none" />
      <Box position="absolute" bottom="-80px" left="-80px" w="320px" h="320px" borderRadius="full" bg="rgba(255,255,255,0.05)" pointerEvents="none" />

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
              {["6か月無料トライアル", "クレジットカード不要", "3店舗まで永久無料"].map((label) => (
                <HStack key={label} gap={2}>
                  <Box w="6px" h="6px" borderRadius="full" bg="rgba(255,255,255,0.65)" flexShrink={0} />
                  <Text fontSize="sm" color="rgba(255,255,255,0.82)">{label}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>

          {/* 右：実際のスクリーンショット */}
          <Box
            display={{ base: "none", lg: "block" }}
            flex={1}
            maxW="540px"
            w="full"
            position="relative"
            style={{ animation: "fadeSlideUp 0.8s ease both 0.25s" }}
          >
            {/* PC 収益レポート画面（ブラウザウィンドウ風フレーム付き） */}
            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="0 24px 64px rgba(0,0,0,0.45)"
            >
          
              {/* スクリーンショット本体 */}
              <Image
                src="/screenshots/revenue-report-pc.png"
                alt="Collecie 収益レポート画面"
                width={1498}
                height={704}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
            </Box>

            {/* スマホ（集金入力）— 右下に重ねる
                PC画像(540×254px)に対してスマホ(162×317px)が上39px/下20px飛び出すバランス */}
            <Box
              borderRadius="3xl"
              overflow="hidden"
              position="absolute"
              bottom="-20px"
              right="-16px"
              w="140px"
              filter="drop-shadow(0 20px 48px rgba(0,0,0,0.55))"
            >
              <Image
                src="/screenshots/monthly-sales.jpeg"
                alt="Collecie 集金入力画面"
                width={694}
                height={1361}
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
