import { Box, VStack, Skeleton } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <VStack align="stretch" gap={4}>
        <Skeleton h="32px" w="120px" borderRadius="lg" mb={2} />
        <Skeleton h="220px" borderRadius="xl" />
        <Skeleton h="130px" borderRadius="xl" />
        <Skeleton h="200px" borderRadius="xl" />
        <Skeleton h="160px" borderRadius="xl" />
      </VStack>
    </Box>
  );
}
