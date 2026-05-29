import { Card, HStack, Text, Box, Flex, Heading, Badge } from "@chakra-ui/react";
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

function InfoCell({ icon, label, children }) {
  return (
    <Box flex={1} minW={0} textAlign="center">
      <Flex
        w="36px" h="36px"
        bg="var(--teal-pale)"
        borderRadius="lg"
        align="center" justify="center"
        color="var(--teal)"
        mx="auto" mb={1.5}
      >
        {icon}
      </Flex>
      <Text fontSize="xs" color="var(--text-muted)" mb={1}>{label}</Text>
      {children}
    </Box>
  );
}

export default function AccountInfoCard({ profile, myRole, plan }) {
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

        <HStack gap={4} align="start" justify="space-around"
          p={4} bg="var(--app-bg, #F0F9FF)" borderRadius="xl">
          <InfoCell icon={<Icon.LuAtSign size={16} />} label="ユーザー名">
            <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)"
              overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {profile?.username || "—"}
            </Text>
          </InfoCell>

          <Box w="1px" alignSelf="stretch" bg="var(--divider)" />

          <InfoCell icon={<Icon.LuCrown size={16} />} label="役割">
            <Badge bg="var(--teal-pale)" color="var(--teal-deeper)"
              px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold">
              {ROLE_LABEL[myRole] ?? "閲覧者"}
            </Badge>
          </InfoCell>

          <Box w="1px" alignSelf="stretch" bg="var(--divider)" />

          <InfoCell icon={<Icon.LuZap size={16} />} label="プラン">
            <Badge
              bg={planColor.bg} color={planColor.color}
              px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold"
            >
              {planName}
            </Badge>
          </InfoCell>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
