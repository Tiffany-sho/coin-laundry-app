import { Card, Button, HStack, Text, Box, Flex, Heading, VStack } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

export default function OtherActionsCard() {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)" mb={5}>
          その他
        </Heading>
        <VStack align="stretch" gap={3}>
          <Link href="/settings/log">
            <HStack
              justify="space-between" p={4}
              borderRadius="lg" border="1px solid" borderColor="cyan.100"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
            >
              <HStack gap={3}>
                <Flex w="40px" h="40px" bg="var(--teal-pale)" borderRadius="lg"
                  align="center" justify="center" color="var(--teal)">
                  <Icon.LuHistory size={20} />
                </Flex>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">アクションログ</Text>
                  <Text fontSize="xs" color="var(--text-muted)">操作履歴を確認できます</Text>
                </Box>
              </HStack>
              <Icon.LuChevronRight color="var(--text-faint)" />
            </HStack>
          </Link>

          <form action="/api/auth/logout" method="post">
            <Button
              type="submit" w="full" py={3.5} px={6}
              fontSize="md" fontWeight="semibold"
              bg="white" color="red.500"
              border="2px solid" borderColor="red.400"
              borderRadius="lg" cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "red.50" }} _active={{ bg: "red.100" }}
            >
              サインアウト
            </Button>
          </form>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
