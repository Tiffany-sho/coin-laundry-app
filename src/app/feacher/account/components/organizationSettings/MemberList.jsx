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
import MemberStoreAssign from "./MemberStoreAssign";

const ROLE_INFO = {
  admin:     { label: "店舗管理者", bg: "var(--teal-pale, #CFFAFE)", color: "var(--teal-deeper, #155E75)" },
  collecter: { label: "集金担当者", bg: "cyan.100",                   color: "var(--teal-deeper, #155E75)" },
  viewer:    { label: "閲覧者",     bg: "gray.100",                   color: "gray.700" },
};

export default function MemberList({
  members,
  currentUserId,
  onChanged,
  /** 割り当てに使う店舗の一覧。⚠️ 管理者から取るので全店舗が入っている */
  stores = [],
  /** 見ている人が管理者か。担当店舗の割り当ては管理者にしか出さない */
  canAssign = false,
}) {
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
        const isOwner = member.role === "admin";
        const isLoading = loadingId === member.user_id;

        return (
          <Box
            key={member.id}
            p={3}
            bg="var(--card-bg, #FFFFFF)"
            borderRadius="lg"
            border="1px solid"
            borderColor="cyan.100"
          >
            <HStack justify="space-between" align="center">
              <HStack gap={3}>
                <Flex
                  w="36px"
                  h="36px"
                  bg="var(--teal-pale, #CFFAFE)"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  color="var(--teal, #0891B2)"
                  flexShrink={0}
                >
                  <Icon.LuUser size={16} />
                </Flex>
                <Box>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                      {profile?.username || profile?.full_name || "ユーザー"}
                    </Text>
                    {isMe && (
                      <Badge fontSize="2xs" colorPalette="cyan" variant="subtle">
                        あなた
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="var(--text-muted, #64748B)">
                    {profile?.full_name || ""}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={2}>
                {isOwner || isMe ? (
                  <Badge
                    bg={roleInfo.bg}
                    color={roleInfo.color}
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

            {/* ⚠️ 管理者の行には出さない。管理者は常に全店舗で行を持たないため、
                   出すと「未設定」に見えてしまう */}
            {canAssign && !isOwner && (
              <MemberStoreAssign
                userId={member.user_id}
                userName={profile?.username || profile?.full_name || "このメンバー"}
                stores={stores}
                assigned={member.storeIds ?? []}
                onChanged={onChanged}
              />
            )}
          </Box>
        );
      })}
    </VStack>
  );
}
