import { Box, Container, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

const Subscribe = () => {
  return (
    <Box
      py={{ base: 20, md: 28 }}
      mx={{ base: 4, md: 8 }}
      mb={12}
      borderRadius="2xl"
      position="relative"
      overflow="hidden"
      /* ⚠️ 淡い地にした（2026-08-17）。上に乗る白文字・白ボタンも反転済み */
      style={{ background: "linear-gradient(140deg, #ECFEFF 0%, #CFFAFE 100%)" }}
      border="1px solid"
      borderColor="cyan.200"
    >
      {/* ⚠️ 淡い地では白が消えるのでティールの薄い影にする */}
      <Box
        position="absolute"
        top="-70px" right="-70px"
        w="240px" h="240px"
        borderRadius="full"
        bg="rgba(8,145,178,0.08)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-50px" left="-50px"
        w="180px" h="180px"
        borderRadius="full"
        bg="rgba(8,145,178,0.07)"
        pointerEvents="none"
      />

      <Container maxW="2xl" position="relative">
        <VStack gap={8} textAlign="center">
          <VStack gap={3}>
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              color="var(--teal-deeper, #155E75)"
              letterSpacing="-0.01em"
            >
              まずは無料で試してみませんか
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="var(--text-muted, #64748B)"
              lineHeight="1.8"
            >
              3店舗まで永久無料。今すぐ始められます。<br />
              Proプランは6か月間、費用ゼロでお試しいただけます。
            </Text>
          </VStack>

          <Link href="/auth/login">
            <Box
              px={10} py={4}
              bg="var(--teal, #0891B2)"
              color="white"
              borderRadius="xl"
              fontSize="md"
              fontWeight="bold"
              boxShadow="0 4px 20px rgba(8,145,178,0.32)"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 28px rgba(8,145,178,0.42)",
                bg: "var(--teal-dark, #0E7490)",
              }}
            >
              無料アカウントを作成
            </Box>
          </Link>

          <HStack gap={{ base: 4, md: 8 }} flexWrap="wrap" justify="center">
            {["3店舗まで永久無料", "6か月トライアル"].map((item) => (
              <HStack key={item} gap={1.5}>
                <Icon.LuCheck size={14} color="var(--teal, #0891B2)" />
                <Text fontSize="sm" color="var(--text-muted, #64748B)">{item}</Text>
              </HStack>
            ))}
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Subscribe;
