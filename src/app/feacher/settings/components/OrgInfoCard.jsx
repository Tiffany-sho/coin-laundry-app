import { Card, HStack, Text, Box, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

export default function OrgInfoCard({ org }) {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack justify="space-between" mb={5}>
          <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
            組織
          </Heading>
          <Link href="/settings/organization/edit">
            <HStack
              gap={1.5} px={3} py={1.5}
              borderRadius="lg" border="1px solid" borderColor="cyan.100"
              color="var(--teal)" fontSize="sm" fontWeight="semibold"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
            >
              <Icon.LuSettings size={14} />
              <Text>管理</Text>
            </HStack>
          </Link>
        </HStack>

        <HStack gap={3} p={4} bg="var(--teal-pale)" borderRadius="lg"
          border="1px solid" borderColor="cyan.100">
          <Flex w="40px" h="40px" bg="var(--card-bg, white)" borderRadius="lg"
            align="center" justify="center" color="var(--teal)"
            flexShrink={0} boxShadow="var(--shadow-sm)">
            <Icon.LuBuilding2 size={20} />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper)">{org?.name}</Text>
            <Text fontSize="xs" color="var(--text-muted)">組織名</Text>
          </Box>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
