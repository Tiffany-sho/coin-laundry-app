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
  updateOrganizationExpensesEnabled,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { showToast } from "@/functions/makeToast/toast";
import MemberList from "./MemberList";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import InviteForm from "./InviteForm";

export default function OrganizationSettings({ currentUserId, currentUsername }) {
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingExpenses, setSavingExpenses] = useState(false);
  /* 担当店舗の割り当てに使う。⚠️ 管理者から取るので全店舗が入る */
  const [stores, setStores] = useState([]);
  const [myRole, setMyRole] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [orgRes, membersRes, invRes, storesRes] = await Promise.all([
      getMyOrganization(),
      getOrganizationMembers(),
      getOrganizationInvitations(),
      getStores(),
    ]);
    if (orgRes.data) {
      setOrg(orgRes.data);
      setOrgName(orgRes.data.name);
    }
    if (membersRes.data) setMembers(membersRes.data);
    setMyRole(membersRes.myRole ?? null);
    if (storesRes?.data) setStores(storesRes.data);
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

  /**
   * 経費を記録するかの切り替え（012）。
   *
   * ⚠️ **やめるときだけ確認する。** 組織の全員の収益ページから「月別利益」と
   *    経費の入口が消えるため。始めるときは増える方向なので確認しない。
   */
  const handleToggleExpenses = async () => {
    const next = !org.expensesEnabled;
    if (
      !next &&
      !window.confirm(
        "経費の記録をやめますか？\n\n収益ページから「月別利益」と経費の入口が消えます。登録済みの経費は消えないので、いつでも元に戻せます。"
      )
    ) {
      return;
    }

    setSavingExpenses(true);
    const { error } = await updateOrganizationExpensesEnabled(next);
    if (error) {
      showToast("error", error);
    } else {
      showToast("success", next ? "経費を記録します" : "経費の記録をやめました");
      fetchAll();
    }
    setSavingExpenses(false);
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
        <Spinner color="var(--teal, #0891B2)" />
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
          <Heading as="h3" fontSize="md" color="var(--teal-deeper, #155E75)">
            組織情報
          </Heading>
        </HStack>
        <Box p={4} bg="var(--teal-pale, #CFFAFE)" borderRadius="lg" border="1px solid" borderColor="cyan.100">
          {editingName ? (
            <HStack>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                fontSize="sm"
                bg="var(--card-bg, #FFFFFF)"
                borderRadius="lg"
                borderColor="cyan.100"
                _focus={{ borderColor: "var(--teal, #0891B2)", boxShadow: "0 0 0 3px rgba(8,145,178,0.1)" }}
              />
              <Button
                size="sm"
                style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
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
              <Text fontWeight="semibold" color="var(--teal-deeper, #155E75)">
                {org.name}
              </Text>
              <Button
                size="xs"
                variant="ghost"
                color="var(--teal, #0891B2)"
                onClick={() => setEditingName(true)}
              >
                <Icon.LuPencil size={14} />
                &nbsp;編集
              </Button>
            </HStack>
          )}
        </Box>
      </Box>

      <Separator borderColor="var(--divider, #F1F5F9)" />

      {/*
        経費を記録するか（012）。初期設定で聞いた答えをここで変えられる。

        ⚠️ **切っても経費のデータは消えない。** 表示の設定なので、戻せば以前の
           記録がそのまま出る。**その旨を必ず画面に書く**（消えると思われると
           怖くて誰も触らなくなる）。
        ⚠️ **変更できるのは admin だけ**（Server Action 側でも弾いている）。
      */}
      <Box>
        <HStack justify="space-between" mb={3}>
          <Heading as="h3" fontSize="md" color="var(--teal-deeper, #155E75)">
            経費
          </Heading>
        </HStack>
        <Box
          p={4}
          bg="var(--teal-pale, #CFFAFE)"
          borderRadius="lg"
          border="1px solid"
          borderColor="cyan.100"
        >
          <HStack justify="space-between" align="start" gap={4}>
            <Box>
              <Text fontWeight="semibold" color="var(--teal-deeper, #155E75)">
                経費を記録する
              </Text>
              <Text fontSize="xs" color="var(--text-muted)" mt={1} lineHeight="1.7">
                家賃・仕入れなどの支出を登録すると、収益ページに「月別利益」が出ます。
                {myRole === "admin"
                  ? "やめても登録済みの経費は消えないので、いつでも戻せます。"
                  : "変更できるのは管理者だけです。"}
              </Text>
            </Box>
            <Button
              size="sm"
              flexShrink={0}
              variant={org.expensesEnabled ? "solid" : "outline"}
              colorPalette="cyan"
              borderRadius="full"
              disabled={myRole !== "admin" || savingExpenses}
              onClick={handleToggleExpenses}
            >
              {savingExpenses ? (
                <Spinner size="xs" />
              ) : org.expensesEnabled ? (
                "記録する"
              ) : (
                "記録しない"
              )}
            </Button>
          </HStack>
        </Box>
      </Box>

      <Separator borderColor="var(--divider, #F1F5F9)" />

      {/* メンバー一覧 */}
      <Box>
        <HStack justify="space-between" mb={3}>
          <Heading as="h3" fontSize="md" color="var(--teal-deeper, #155E75)">
            メンバー（{members.length}名）
          </Heading>
        </HStack>
        <MemberList
          members={members}
          currentUserId={currentUserId}
          onChanged={fetchAll}
          stores={stores}
          canAssign={myRole === "admin"}
        />
      </Box>

      <Separator borderColor="var(--divider, #F1F5F9)" />

      {/* 招待フォーム */}
      <InviteForm
        orgName={org.name}
        inviterName={currentUsername}
        onInvited={fetchAll}
      />

      {/* 保留中の招待 */}
      {invitations.length > 0 && (
        <>
          <Separator borderColor="var(--divider, #F1F5F9)" />
          <Box>
            <Heading as="h3" fontSize="md" color="var(--teal-deeper, #155E75)" mb={3}>
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
                      <Text fontSize="sm" fontWeight="medium" color="var(--text-main, #1E3A5F)">
                        {inv.email}
                      </Text>
                      <HStack gap={2}>
                        <Badge fontSize="2xs" colorPalette="yellow" variant="subtle">
                          {inv.role === "collecter" ? "集金担当者" : "閲覧者"}
                        </Badge>
                        <Text fontSize="2xs" color="var(--text-faint, #94A3B8)">
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
