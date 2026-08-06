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

  Flex,
  Separator,
  Switch,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import {
  getMyOrganization,
  getOrganizationMembers,
  getJoinRequests,
  decideJoinRequest,
  updateOrganizationName,
  updateOrganizationExpensesEnabled,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { showToast } from "@/functions/makeToast/toast";
import MemberList from "./MemberList";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";

export default function OrganizationSettings({ currentUserId, currentUsername }) {
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  /** 保留中の参加申請（013）。⚠️ 店舗管理者でなければ常に空 */
  const [invitations, setInvitations] = useState([]);
  const [decidingId, setDecidingId] = useState(null);
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
      /* ⚠️ 店舗管理者でなければ空配列が返る（エラーではない）。下で件数 0 として扱う */
      getJoinRequests(),
      getStores(),
    ]);
    if (orgRes.data) {
      setOrg(orgRes.data);
      setOrgName(orgRes.data.name);
    }
    if (membersRes.data) setMembers(membersRes.data);
    setMyRole(membersRes.myRole ?? null);
    if (storesRes?.data) setStores(storesRes.data);
    /*
      ⚠️ **失敗を握り潰さない。** `if (invRes.data)` としか見ていなかったため、
         PostgREST の埋め込みエラー（`profiles` への外部キーが 2 本あって
         関係を決められない）が**「申請 0 件」と見分けが付かなかった。**
         セクションごと出ないので、**画面には何の手掛かりも残らない。**
      ⚠️ **`data` が空配列のときは正常**（admin でない／申請が無い）。
         エラーのときだけ出すこと。
    */
    setInvitations(invRes.data ?? []);
    if (invRes.error) showToast("error", invRes.error);
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

  /**
   * 参加申請を承認・却下する（013）。
   * ⚠️ **`decision` と `role` を取り違えないこと。** 却下では `role` を使わない。
   */
  const handleDecide = async (id, decision, role) => {
    setDecidingId(id);
    const { data, error } = await decideJoinRequest(id, decision, role);
    if (error) {
      showToast("error", error);
    } else if (decision === "reject") {
      showToast("success", "申請を却下しました");
      fetchAll();
    } else {
      showToast("success", `${data.name} さんを追加しました`);
      fetchAll();
    }
    setDecidingId(null);
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
            {/*
              ⚠️ **ボタンにしないこと**（2026-08-06 に直した）。
                 それまでは `記録する` / `記録しない` を**現在の状態として**
                 ボタンに出していたが、**ボタンは「押すとこうなる」と読まれる。**
                 有効なときに「記録する」と出るので、押すと止まる＝**表示と操作が
                 正反対**になっていた。見出しも「経費を記録する」で重複していた。
              ⚠️ アプリ（`src/components/settings/ExpensesSection.tsx`）は
                 最初からスイッチ。**同じ設定が Web とアプリで別の形にならないこと。**
              ⚠️ **保存中に disabled にしない。** 応答を待つ間トグルが動かないと
                 「固まってから切り替わる」ように見える（アプリ側と同じ判断）。
                 誤操作はやめるときの確認ダイアログで防いでいる。
            */}
            <Flex align="center" gap={2} flexShrink={0}>
              {savingExpenses && <Spinner size="xs" color="var(--teal, #0891B2)" />}
              <Switch.Root
                checked={org.expensesEnabled}
                onCheckedChange={handleToggleExpenses}
                disabled={myRole !== "admin"}
                size="lg"
                aria-label="経費を記録する"
              >
                <Switch.HiddenInput />
                <Switch.Control
                  bg={org.expensesEnabled ? "var(--teal, #0891B2)" : "gray.300"}
                  _hover={{
                    bg: org.expensesEnabled ? "var(--teal-dark, #0E7490)" : "gray.400",
                  }}
                  transition="all 0.2s"
                >
                  <Switch.Thumb bg="white" shadow="md" />
                </Switch.Control>
              </Switch.Root>
            </Flex>
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

      {/*
        ⚠️ **メール招待は 2026-08-06 に廃止した**（013）。相手が未登録だと送れず、
           届かない・期限切れ・迷惑メール、と詰まりどころが多かった。
           **今はメンバーを増やす経路が「申請 → 承認」の 1 本だけ。**
        ⚠️ **「招待する」フォームを足し直さないこと。** 足すと経路が 2 つに戻り、
           プランの人数制限を 2 か所で見ることになる。
      */}

      {/*
        参加申請（013）。⚠️ **店舗管理者（admin）にしか出ない。**
        `getJoinRequests` が admin 以外へ空配列を返すので、ここは件数だけ見ればよい。
        ⚠️ **オーナー限定にしない**（2026-08-06 に owner_id から変えた）。
           オーナーは組織を作った 1 人だけで譲渡する手段が無いため、
           限定すると**オーナー不在の間は誰も組織に参加できなくなる。**
      */}
      {invitations.length > 0 && (
        <>
          <Separator borderColor="var(--divider, #F1F5F9)" />
          <Box>
            <Heading as="h3" fontSize="md" color="var(--teal-deeper, #155E75)" mb={1}>
              参加申請（{invitations.length}件）
            </Heading>
            <Text fontSize="xs" color="var(--text-muted)" mb={3} lineHeight="1.7">
              権限を選んで承認すると、その人が組織に加わります。
            </Text>
            <VStack align="stretch" gap={2}>
              {invitations.map((req) => (
                <Box
                  key={req.id}
                  p={3}
                  bg="yellow.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="yellow.200"
                >
                  <VStack align="stretch" gap={2}>
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="medium" color="var(--text-main, #1E3A5F)">
                        {req.name}
                      </Text>
                      <Text fontSize="2xs" color="var(--text-faint, #94A3B8)">
                        {new Date(req.createdAt).toLocaleDateString("ja-JP")} 申請
                      </Text>
                    </VStack>
                    {/*
                      ⚠️ **承認は権限とセットで押させる。** 「承認」だけにすると
                         あとからメンバー管理で直す手間が必ず発生する。
                      ⚠️ **`admin` を選択肢に入れない。** 承認だけで管理者を増やせてしまう。
                         昇格はメンバー管理から行う。
                    */}
                    <HStack gap={2} flexWrap="wrap">
                      <Button
                        size="xs"
                        colorPalette="cyan"
                        loading={decidingId === req.id}
                        onClick={() => handleDecide(req.id, "approve", "collecter")}
                      >
                        集金担当者として承認
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette="cyan"
                        loading={decidingId === req.id}
                        onClick={() => handleDecide(req.id, "approve", "viewer")}
                      >
                        閲覧者として承認
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        color="red.400"
                        _hover={{ bg: "red.50" }}
                        loading={decidingId === req.id}
                        onClick={() => handleDecide(req.id, "reject")}
                      >
                        <Icon.LuX size={14} />
                        却下
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </>
      )}
    </VStack>
  );
}
