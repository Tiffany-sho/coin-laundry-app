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
      style={{ background: "linear-gradient(140deg, #0E7490 0%, #0891B2 55%, #06B6D4 100%)" }}
    >
      <Box
        position="absolute"
        top="-70px" right="-70px"
        w="240px" h="240px"
        borderRadius="full"
        bg="rgba(255,255,255,0.07)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-50px" left="-50px"
        w="180px" h="180px"
        borderRadius="full"
        bg="rgba(255,255,255,0.06)"
        pointerEvents="none"
      />

      <Container maxW="2xl" position="relative">
        <VStack gap={8} textAlign="center">
          <VStack gap={3}>
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              color="white"
              letterSpacing="-0.01em"
            >
              まずは無料で試してみませんか
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="rgba(255,255,255,0.82)"
              lineHeight="1.8"
            >
              3店舗まで永久無料。クレジットカード不要で今すぐ始められます。<br />
              Proプランは6か月間、費用ゼロでお試しいただけます。
            </Text>
          </VStack>

          <Link href="/auth/login">
            <Box
              px={10} py={4}
              bg="white"
              color="var(--teal-deeper)"
              borderRadius="xl"
              fontSize="md"
              fontWeight="bold"
              boxShadow="0 4px 24px rgba(0,0,0,0.18)"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
                bg: "var(--teal-pale)",
              }}
            >
              無料アカウントを作成
            </Box>
          </Link>

          <HStack gap={{ base: 4, md: 8 }} flexWrap="wrap" justify="center">
            {["3店舗まで永久無料", "6か月トライアル", "クレジットカード不要"].map((item) => (
              <HStack key={item} gap={1.5}>
                <Icon.LuCheck size={14} color="rgba(255,255,255,0.8)" />
                <Text fontSize="sm" color="rgba(255,255,255,0.8)">{item}</Text>
              </HStack>
            ))}
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Subscribe;
