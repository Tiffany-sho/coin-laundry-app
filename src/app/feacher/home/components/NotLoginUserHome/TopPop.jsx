import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";

const TopPop = () => {
  return (
    <Box position="relative" h="100vh" overflow="hidden">
      {/* 背景画像 */}
      <Box
        position="absolute"
        inset={0}
        bgImage="url(https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/topPop.png)"
        bgSize="cover"
        bgPosition="center"
      />

      {/* 暗がりオーバーレイ */}
      <Box position="absolute" inset={0} bg="blackAlpha.600" />

      {/* コンテンツ */}
      <Container
        maxW="container.lg"
        h="full"
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={8} textAlign="center">
          <Heading
            size={{ base: "xl", md: "2xl", lg: "3xl" }}
            color="white"
            lineHeight="1.3"
            fontWeight="bold"
          >
            コインランドリーの
            <br />
            集金管理をもっとスマートに
          </Heading>

          <Text
            fontSize={{ base: "lg", md: "xl" }}
            color="whiteAlpha.900"
            maxW="2xl"
          >
            面倒な集金作業をデジタル化。
            <br />
            売上管理から在庫管理まで、これひとつで完結。
          </Text>

          <Button
            size="lg"
            colorScheme="blue"
            px={10}
            py={6}
            fontSize="lg"
            boxShadow="xl"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "2xl",
            }}
            transition="all 0.2s"
          >
            無料で始める
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default TopPop;
