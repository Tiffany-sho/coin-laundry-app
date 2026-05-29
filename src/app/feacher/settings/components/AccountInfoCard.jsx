import { Card, VStack, HStack, Text, Box, Flex, Heading, Badge } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import { PLAN_NAMES } from "@/functions/plans";

const ROLE_LABEL = {
  admin:     "店舗管理者",
  collecter: "集金担当者",
  viewer:    "閲覧者",
};

const PLAN_COLOR = {
  free: { bg: "gray.100",  color: "gray.700"  },
  pro:  { bg: "cyan.50",   color: "cyan.700"  },
  max:  { bg: "purple.50", color: "purple.700" },
};

function InfoRow({ icon, label, children }) {
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
        {children}
      </Box>
    </HStack>
  );
}

export default function AccountInfoCard({ user, profile, myRole, plan }) {
  const planKey = plan ?? "free";
  const planName = PLAN_NAMES[planKey] ?? "Free";
  const planColor = PLAN_COLOR[planKey] ?? PLAN_COLOR.free;

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
              <Text>詳細</Text>
            </HStack>
          </Link>
        </HStack>

        <VStack align="stretch" gap={0}>
          <InfoRow icon={<Icon.LuAtSign size={16} />} label="ユーザー名">
            <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)"
              overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {profile?.username || "—"}
            </Text>
          </InfoRow>

          <InfoRow icon={<Icon.LuCrown size={16} />} label="役割">
            <Badge bg="var(--teal-pale)" color="var(--teal-deeper)"
              px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold">
              {ROLE_LABEL[myRole] ?? "閲覧者"}
            </Badge>
          </InfoRow>

          <HStack gap={3} py={3}>
            <Flex
              w="36px" h="36px"
              bg="var(--teal-pale)"
              borderRadius="lg"
              align="center" justify="center"
              color="var(--teal)"
              flexShrink={0}
            >
              <Icon.LuZap size={16} />
            </Flex>
            <Box flex={1} minW={0}>
              <Text fontSize="xs" color="var(--text-muted)" mb={0.5}>プラン</Text>
              <Badge
                bg={planColor.bg} color={planColor.color}
                px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold"
              >
                {planName}
              </Badge>
            </Box>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
