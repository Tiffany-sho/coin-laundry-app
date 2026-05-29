import { Card, HStack, VStack, Text, Box, Flex, Heading, Badge } from "@chakra-ui/react";
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

function Avatar({ avatarUrl, username }) {
  const initial = username ? username.charAt(0).toUpperCase() : "?";
  return (
    <Flex
      w="64px" h="64px"
      borderRadius="full"
      overflow="hidden"
      border="2px solid"
      borderColor="cyan.200"
      bg="var(--teal-pale)"
      align="center" justify="center"
      flexShrink={0}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Text color="var(--teal-deeper)" fontSize="xl" fontWeight="bold">{initial}</Text>
      )}
    </Flex>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <HStack gap={2.5} align="center">
      <Box color="var(--text-muted)" flexShrink={0}>{icon}</Box>
      <Text fontSize="xs" color="var(--text-muted)" flexShrink={0}>{label}:</Text>
      {children}
    </HStack>
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
        <HStack justify="space-between" mb={4}>
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

        <HStack gap={5} align="center"
          p={4} bg="var(--app-bg, #F0F9FF)" borderRadius="xl">
          <Avatar avatarUrl={profile?.avatar_url} username={profile?.username} />

          <VStack align="start" gap={2.5} flex={1} minW={0}>
            <InfoRow icon={<Icon.LuAtSign size={14} />} label="ユーザー名">
              <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)"
                overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {profile?.username || "—"}
              </Text>
            </InfoRow>

            <InfoRow icon={<Icon.LuCrown size={14} />} label="役割">
              <Badge bg="var(--teal-pale)" color="var(--teal-deeper)"
                px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold">
                {ROLE_LABEL[myRole] ?? "閲覧者"}
              </Badge>
            </InfoRow>

            <InfoRow icon={<Icon.LuZap size={14} />} label="プラン">
              <Badge
                bg={planColor.bg} color={planColor.color}
                px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold"
              >
                {planName}
              </Badge>
            </InfoRow>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
