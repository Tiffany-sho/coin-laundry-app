import { Card, HStack, VStack, Text, Box, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

export default function DangerActionsCard() {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="red.200">
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack gap={2} mb={5}>
          <Icon.LuTriangleAlert size={18} color="#E53E3E" />
          <Heading as="h2" fontSize="md" fontWeight="bold" color="red.600">
            注意が必要な操作
          </Heading>
        </HStack>
        <VStack align="stretch" gap={3}>
          <Link href="/settings/reset-role">
            <HStack
              justify="space-between" p={4}
              borderRadius="lg" border="1px solid" borderColor="red.200"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "red.50", borderColor: "red.300" }}
            >
              <HStack gap={3}>
                <Flex w="40px" h="40px" bg="red.50" borderRadius="lg"
                  align="center" justify="center" color="red.500" flexShrink={0}>
                  <Icon.LuRefreshCcw size={20} />
                </Flex>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="red.700">役割をリセット</Text>
                  <Text fontSize="xs" color="red.400">
                    誤って店舗管理者で登録した場合に使用（組織・データが削除されます）
                  </Text>
                </Box>
              </HStack>
              <Icon.LuChevronRight color="#FC8181" />
            </HStack>
          </Link>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
