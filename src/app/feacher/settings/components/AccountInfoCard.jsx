import { Card, VStack, HStack, Text, Box, Flex, Heading, Badge } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

const ROLE_LABEL = {
  admin:     "店舗管理者",
  collecter: "集金担当者",
  viewer:    "閲覧者",
};

function InfoRow({ icon, label, value }) {
  return (
    <HStack gap={3} py={3} borderBottom="1px solid" borderColor="var(--divider)">
      <Flex
        w="36px" h="36px"
        bg="var(--teal-pale)"
        borderRadius="lg"
        align="center" justify="center"
        color="var(--teal)"
        flexShrink={0}
      >
        {icon}
      </Flex>
      <Box flex={1} minW={0}>
        <Text fontSize="xs" color="var(--text-muted)" mb={0.5}>{label}</Text>
        <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)"
          overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {value || "—"}
        </Text>
      </Box>
    </HStack>
  );
}

export default function AccountInfoCard({ user, profile, myRole }) {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack justify="space-between" mb={5}>
          <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
            アカウント
          </Heading>
          <Link href="/settings/account/edit">
            <HStack
              gap={1.5} px={3} py={1.5}
              borderRadius="lg" border="1px solid" borderColor="cyan.100"
              color="var(--teal)" fontSize="sm" fontWeight="semibold"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
            >
              <Icon.LuPencil size={14} />
              <Text>編集</Text>
            </HStack>
          </Link>
        </HStack>

        <VStack align="stretch" gap={0}>
          <InfoRow icon={<Icon.LuMail size={16} />}   label="メールアドレス" value={user?.email} />
          <InfoRow icon={<Icon.LuUser size={16} />}   label="氏名"           value={profile?.full_name} />
          <InfoRow icon={<Icon.LuAtSign size={16} />} label="ユーザー名"     value={profile?.username} />
          <HStack gap={3} py={3}>
            <Flex w="36px" h="36px" bg="var(--teal-pale)" borderRadius="lg"
              align="center" justify="center" color="var(--teal)" flexShrink={0}>
              <Icon.LuCrown size={16} />
            </Flex>
            <Box>
              <Text fontSize="xs" color="var(--text-muted)" mb={0.5}>役割</Text>
              <Badge bg="var(--teal-pale)" color="var(--teal-deeper)"
                px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold">
                {ROLE_LABEL[myRole] ?? "閲覧者"}
              </Badge>
            </Box>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
