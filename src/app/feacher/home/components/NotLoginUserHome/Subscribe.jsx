import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

const Subscribe = () => {
  return (
    <Box
      py={20}
      style={{ background: "linear-gradient(140deg, #0E7490 0%, #0891B2 60%, #06B6D4 100%)" }}
      mb={10}
      borderRadius={20}
    >
      <Container maxW="4xl">
        <VStack spacing={8} textAlign="center">
          <Heading size={{ base: "lg", md: "xl" }} color="white">
            今すぐ始めて、業務効率を改善しましょう
          </Heading>
          <Text fontSize="xl" color="rgba(255,255,255,0.80)">
            支払い不要・すぐに使い始められます
          </Text>
          <Link href="/auth/login">
            <Button
              size="lg"
              bg="white"
              color="var(--teal-deeper, #155E75)"
              fontWeight="bold"
              _hover={{
                bg: "var(--teal-pale, #CFFAFE)",
                transform: "translateY(-2px)",
                boxShadow: "xl",
              }}
              boxShadow="0 4px 20px rgba(0,0,0,0.15)"
              fontSize="lg"
              px={10}
              transition="all 0.2s"
            >
              無料アカウントを作成
            </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
};

export default Subscribe;
