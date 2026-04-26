"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Spinner,
  Badge,
  Flex,
  Separator,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import {
  getMyOrganization,
  getOrganizationMembers,
  getOrganizationInvitations,
  deleteInvitation,
  updateOrganizationName,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { showToast } from "@/functions/makeToast/toast";
import MemberList from "./MemberList";
import InviteForm from "./InviteForm";

export default function OrganizationSettings({ currentUserId, currentUsername }) {
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [orgRes, membersRes, invRes] = await Promise.all([
      getMyOrganization(),
      getOrganizationMembers(),
      getOrganizationInvitations(),
    ]);
    if (orgRes.data) {
      setOrg(orgRes.data);
      setOrgName(orgRes.data.name);
    }
    if (membersRes.data) setMembers(membersRes.data);
    if (invRes.data) setInvitations(invRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSaveName = async () => {
    setSavingName(true);
    const { error } = await updateOrganizationName(orgName);
    if (error) {
      showToast("error", error);
    } else {
      showToast("success", "組織名を更新しました");
      setEditingName(false);
      fetchAll();
    }
    setSavingName(false);
  };

  const handleDeleteInvitation = async (id) => {
    const { error } = await deleteInvitation(id);
    if (error) {
      showToast("error", error);
    } else {
      showToast("success", "招待を取り消しました");
      fetchAll();
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={8}>
        <Spinner color="blue.500" />
      </Flex>
    );
  }

  if (!org) {
    return (
      <Box p={4} bg="yellow.50" borderRadius="lg" border="1px solid" borderColor="yellow.200">
        <Text fontSize="sm" color="yellow.800">
          組織情報が見つかりません。ページをリロードしてください。
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* 組織名 */}
      <Box>
        <HStack justify="space-between" mb={3}>
          <Heading as="h3" fontSize="md" color="gray.700">
            組織情報
          </Heading>
        </HStack>
        <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
          {editingName ? (
            <HStack>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                fontSize="sm"
                bg="white"
                borderRadius="lg"
              />
              <Button
                size="sm"
                bg="blue.500"
                color="white"
                onClick={handleSaveName}
                disabled={savingName}
              >
                {savingName ? <Spinner size="xs" /> : "保存"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                キャンセル
              </Button>
            </HStack>
          ) : (
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.800">
                {org.name}
              </Text>
              <Button
                size="xs"
                variant="ghost"
                color="gray.500"
                onClick={() => setEditingName(true)}
              >
                <Icon.LuPencil size={14} />
                &nbsp;編集
              </Button>
            </HStack>
          )}
        </Box>
      </Box>

      <Separator />

      {/* メンバー一覧 */}
      <Box>
        <HStack justify="space-between" mb={3}>
          <Heading as="h3" fontSize="md" color="gray.700">
            メンバー（{members.length}名）
          </Heading>
        </HStack>
        <MemberList
          members={members}
          currentUserId={currentUserId}
          onChanged={fetchAll}
        />
      </Box>

      <Separator />

      {/* 招待フォーム */}
      <InviteForm
        orgName={org.name}
        inviterName={currentUsername}
        onInvited={fetchAll}
      />

      {/* 保留中の招待 */}
      {invitations.length > 0 && (
        <>
          <Separator />
          <Box>
            <Heading as="h3" fontSize="md" color="gray.700" mb={3}>
              保留中の招待
            </Heading>
            <VStack align="stretch" gap={2}>
              {invitations.map((inv) => (
                <Box
                  key={inv.id}
                  p={3}
                  bg="yellow.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="yellow.200"
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.800">
                        {inv.email}
                      </Text>
                      <HStack gap={2}>
                        <Badge fontSize="2xs" colorPalette="yellow" variant="subtle">
                          {inv.role === "collecter" ? "集金担当者" : "閲覧者"}
                        </Badge>
                        <Text fontSize="2xs" color="gray.400">
                          {new Date(inv.expires_at).toLocaleDateString("ja-JP")} 期限
                        </Text>
                      </HStack>
                    </VStack>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="red.400"
                      onClick={() => handleDeleteInvitation(inv.id)}
                      _hover={{ bg: "red.50" }}
                    >
                      <Icon.LuX size={14} />
                      取り消し
                    </Button>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </>
      )}
    </VStack>
  );
}
