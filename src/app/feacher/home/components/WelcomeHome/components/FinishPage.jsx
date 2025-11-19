import { Button, Box, Text, VStack, Flex } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import Link from "next/link";

const FinishPage = () => {
  return (
    <VStack align="stretch" gap={8} w="full">
      <VStack gap={4} position="relative" zIndex={1}>
        <Box
          w="60px"
          h="60px"
          bg="white"
          borderRadius="xl"
          display="flex"
          align="center"
          justify="center"
          boxShadow="lg"
        >
          <Icon.LiaStoreSolid size={64} color="#3b82f6" />
        </Box>

        <Text fontSize="xl" fontWeight="bold" color="gray.800">
          はじめての店舗を追加してみましょう
        </Text>

        <Text fontSize="sm" color="gray.600">
          店舗情報を登録して、管理を始めましょう
        </Text>
      </VStack>

      <Link href="/coinLaundry/new" style={{ width: "100%" }}>
        <Button
          w="full"
          size="lg"
          bg="blue.500"
          color="white"
          fontWeight="bold"
          borderRadius="xl"
          py={7}
          fontSize="lg"
          boxShadow="0 4px 14px rgba(59, 130, 246, 0.4)"
          _hover={{
            bg: "blue.600",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(59, 130, 246, 0.5)",
          }}
          _active={{
            transform: "translateY(0)",
          }}
          transition="all 0.2s"
        >
          <Icon.LuPlus size={24} /> 店舗を追加
        </Button>
      </Link>

      <Box p={4} bg="gray.50" borderRadius="lg" textAlign="center">
        <Text fontSize="xs" color="gray.500">
          後からでも店舗は追加できます
        </Text>
      </Box>
    </VStack>
  );
};

export default FinishPage;
