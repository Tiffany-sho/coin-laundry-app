import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Circle,
} from "@chakra-ui/react";
import React from "react";

const Procedure = () => {
  const steps = [
    {
      number: "1",
      title: "アカウント登録",
      description: "メールアドレスで簡単に無料登録",
    },
    {
      number: "2",
      title: "店舗情報を登録",
      description: "店舗名と所在地を入力するだけ",
    },
    {
      number: "3",
      title: "集金データを記録",
      description: "すぐに使い始められます",
    },
  ];

  return (
    <Box py={{ base: 16, md: 20 }} bg="gray.50">
      <Container maxW="container.xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          {/* ヘッダー */}
          <VStack spacing={4} textAlign="center">
            <Heading size={{ base: "lg", md: "xl" }} color="gray.800">
              簡単3ステップ
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
              すぐに始められる簡単セットアップ
            </Text>
          </VStack>

          {/* ステップ */}
          <VStack spacing={{ base: 8, md: 10 }} w="full" maxW="4xl">
            {steps.map((step, index) => (
              <HStack
                key={index}
                spacing={{ base: 4, md: 6 }}
                align="start"
                w="full"
                p={{ base: 6, md: 8 }}
                bg="white"
                borderRadius="xl"
                boxShadow="md"
                _hover={{
                  boxShadow: "lg",
                  transform: "translateY(-4px)",
                }}
                transition="all 0.3s"
              >
                {/* ステップ番号 */}
                <Circle
                  size={{ base: "50px", md: "60px" }}
                  bg="blue.600"
                  color="white"
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  flexShrink={0}
                >
                  {step.number}
                </Circle>

                {/* ステップ内容 */}
                <VStack align="start" spacing={2} flex={1}>
                  <Heading size={{ base: "sm", md: "md" }} color="gray.800">
                    {step.title}
                  </Heading>
                  <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                    {step.description}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Procedure;
