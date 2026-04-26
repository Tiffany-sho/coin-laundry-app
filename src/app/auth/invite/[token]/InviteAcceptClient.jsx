"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  HStack,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { acceptInvitation } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { showToast } from "@/functions/makeToast/toast";

const ROLE_INFO = {
  owner:    { label: "店舗管理者", color: "purple" },
  collecter: { label: "集金担当者", color: "blue" },
  viewer:   { label: "閲覧者",     color: "gray" },
};

export default function InviteAcceptClient({ token, invitation }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const roleInfo = ROLE_INFO[invitation.role] ?? ROLE_INFO.viewer;

  const handleAccept = async () => {
    setLoading(true);
    const { error } = await acceptInvitation(token);
    if (error) {
      showToast("error", error);
      setLoading(false);
      return;
    }
    showToast("success", `${invitation.organizations.name} に参加しました`);
    router.push("/");
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        p={{ base: 6, md: 10 }}
        maxW="440px"
        w="full"
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack align="stretch" gap={6}>
          <VStack align="center" gap={3}>
            <Flex
              w="64px"
              h="64px"
              bg="blue.50"
              borderRadius="full"
              align="center"
              justify="center"
              color="blue.500"
              fontSize="2xl"
            >
              <Icon.LuUsers />
            </Flex>
            <Heading fontSize="xl" color="gray.800" textAlign="center">
              組織への招待
            </Heading>
          </VStack>

          <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
            <VStack align="stretch" gap={2}>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">組織名</Text>
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  {invitation.organizations?.name}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">招待者</Text>
                <Text fontSize="sm" color="gray.700">
                  {invitation.profiles?.username ?? "オーナー"}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">役割</Text>
                <Badge
                  bg={`${roleInfo.color}.100`}
                  color={`${roleInfo.color}.800`}
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                >
                  {roleInfo.label}
                </Badge>
              </HStack>
            </VStack>
          </Box>

          <Button
            w="full"
            bg="blue.500"
            color="white"
            fontWeight="bold"
            borderRadius="lg"
            py={6}
            onClick={handleAccept}
            disabled={loading}
            _hover={{ bg: "blue.600" }}
          >
            {loading ? <Spinner size="sm" /> : <Icon.LuUserCheck />}
            &nbsp;招待を承認する
          </Button>

          <Button
            variant="ghost"
            w="full"
            color="gray.500"
            onClick={() => router.push("/")}
            disabled={loading}
          >
            キャンセル
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
