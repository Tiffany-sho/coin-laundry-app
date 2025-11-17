import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";

const Subscribe = () => {
  return (
    <Box
      py={20}
      bgGradient="to-t"
      gradientFrom="blue.400"
      gradientTo="blue.500"
      mb={10}
      borderRadius={20}
    >
      <Container maxW="4xl">
        <VStack spacing={8} textAlign="center">
          <Heading size={{ base: "lg", md: "xl" }} color="white">
            今すぐ始めて、業務効率を改善しましょう
          </Heading>
          <Text fontSize="xl" color="blue.100">
            クレジットカード不要・すぐに使い始められます
          </Text>
          <Button
            size="lg"
            bg="white"
            color="blue.600"
            _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
            boxShadow="xl"
            fontSize="lg"
            px={10}
          >
            無料アカウントを作成
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default Subscribe;
