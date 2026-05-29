import { Box, Container, Heading, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import Link from "next/link";

const TopPop = () => {
  return (
    <Box
      position="relative"
      minH="100vh"
      overflow="hidden"
      style={{
        background: "linear-gradient(140deg, #155E75 0%, #0891B2 55%, #06B6D4 100%)",
      }}
    >
      <Box
        position="absolute"
        top="-120px" right="-120px"
        w="480px" h="480px"
        borderRadius="full"
        bg="rgba(255,255,255,0.06)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-80px" left="-80px"
        w="320px" h="320px"
        borderRadius="full"
        bg="rgba(255,255,255,0.05)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        top="40%" left="60%"
        w="200px" h="200px"
        borderRadius="full"
        bg="rgba(255,255,255,0.04)"
        pointerEvents="none"
      />

      <Container maxW="container.lg" position="relative">
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="100vh"
          gap={8}
          textAlign="center"
          py={20}
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

          <VStack gap={5}>
            <Heading
              fontSize={{ base: "4xl", md: "6xl" }}
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
              fontSize={{ base: "md", md: "xl" }}
              color="rgba(255,255,255,0.85)"
              maxW="xl"
              lineHeight="1.8"
            >
              面倒な集金作業をデジタル化。<br />
              売上管理から在庫・機器状態まで、これひとつで完結します。
            </Text>
          </VStack>

          <HStack gap={3} flexWrap="wrap" justify="center">
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
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 32px rgba(0,0,0,0.24)" }}
              >
                無料で始める
              </Box>
            </Link>
            <Link href="/auth/login">
              <Box
                px={8} py={3.5}
                bg="transparent"
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

          <HStack gap={{ base: 4, md: 8 }} flexWrap="wrap" justify="center">
            {["14日間無料トライアル", "クレジットカード不要", "3店舗まで永久無料"].map((label) => (
              <HStack key={label} gap={2}>
                <Box w="6px" h="6px" borderRadius="full" bg="rgba(255,255,255,0.65)" flexShrink={0} />
                <Text fontSize="sm" color="rgba(255,255,255,0.82)">{label}</Text>
              </HStack>
            ))}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default TopPop;
