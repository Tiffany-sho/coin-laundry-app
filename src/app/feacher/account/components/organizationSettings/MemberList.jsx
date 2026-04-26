"use client";

import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Flex,
  Spinner,
  NativeSelect,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import {
  removeMember,
  updateMemberRole,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { showToast } from "@/functions/makeToast/toast";

const ROLE_INFO = {
  owner:     { label: "店舗管理者", color: "purple" },
  collecter: { label: "集金担当者", color: "blue" },
  viewer:    { label: "閲覧者",     color: "gray" },
};

export default function MemberList({ members, currentUserId, onChanged }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    setLoadingId(userId);
    const { error } = await updateMemberRole(userId, newRole);
    if (error) {
      showToast("error", error);
    } else {
      showToast("success", "役割を更新しました");
      onChanged?.();
    }
    setLoadingId(null);
  };

  const handleRemove = async (userId, username) => {
    if (!confirm(`${username} をメンバーから削除しますか？`)) return;
    setLoadingId(userId);
    const { error } = await removeMember(userId);
    if (error) {
      showToast("error", error);
    } else {
      showToast("success", "メンバーを削除しました");
      onChanged?.();
    }
    setLoadingId(null);
  };

  return (
    <VStack align="stretch" gap={2}>
      {members.map((member) => {
        const profile = member.profiles;
        const roleInfo = ROLE_INFO[member.role] ?? ROLE_INFO.viewer;
        const isMe = member.user_id === currentUserId;
        const isOwner = member.role === "owner";
        const isLoading = loadingId === member.user_id;

        return (
          <Box
            key={member.id}
            p={3}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="center">
              <HStack gap={3}>
                <Flex
                  w="36px"
                  h="36px"
                  bg="blue.50"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  color="blue.500"
                  flexShrink={0}
                >
                  <Icon.LuUser size={16} />
                </Flex>
                <Box>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                      {profile?.username || profile?.full_name || "ユーザー"}
                    </Text>
                    {isMe && (
                      <Badge fontSize="2xs" colorPalette="green" variant="subtle">
                        あなた
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    {profile?.full_name || ""}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={2}>
                {isOwner || isMe ? (
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
                ) : (
                  <NativeSelect.Root w="120px">
                    <NativeSelect.Field
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                      fontSize="xs"
                      size="sm"
                      disabled={isLoading}
                    >
                      <option value="collecter">集金担当者</option>
                      <option value="viewer">閲覧者</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                )}

                {!isOwner && !isMe && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="red.400"
                    onClick={() =>
                      handleRemove(
                        member.user_id,
                        profile?.username || "このメンバー"
                      )
                    }
                    disabled={isLoading}
                    _hover={{ bg: "red.50" }}
                  >
                    {isLoading ? <Spinner size="xs" /> : <Icon.LuTrash2 size={14} />}
                  </Button>
                )}
              </HStack>
            </HStack>
          </Box>
        );
      })}
    </VStack>
  );
}
