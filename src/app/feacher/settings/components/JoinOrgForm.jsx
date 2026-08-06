"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import {
  requestJoinOrg,
  getMyJoinRequest,
  cancelMyJoinRequest,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

/**
 * 組織への参加を申請する（013、2026-08-06）。
 *
 * ⚠️ **入力は管理者のメールアドレスだけ。** 参加パスワードは廃止した。
 *    admin が一度配れば誰でも使える**無期限の合鍵**だったうえ、
 *    入力できた時点で**即座にメンバーになれて**いた。
 *    **今は承認が唯一の関所。**
 *
 * ⚠️ **「参加する」ではなく「申請する」。** 押した直後にはまだ入れていない。
 *    文言を戻すと、承認待ちの人が「参加できたのに何も見えない」と誤解する。
 *
 * ⚠️ **アプリ（`app/join-organization.tsx`）にも同じ画面がある。**
 *    片方だけ直すと、同じ操作の手順が Web とアプリで食い違う。
 */
export default function JoinOrgForm() {
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  /** 保留中の申請。⚠️ 無いことは正常（`null`） */
  const [pending, setPending] = useState(null);
  const [checking, setChecking] = useState(true);

  /*
    ⚠️ **開いた時点で保留中を引く。** 引かないと、申請済みの人がこの画面を
       開き直すたびに空のフォームを見て、**同じ申請を何度も送ろうとする**
       （サーバは「すでに申請中です」で弾くので、エラーだけ見せることになる）。
  */
  useEffect(() => {
    let alive = true;
    getMyJoinRequest().then((res) => {
      if (!alive) return;
      if (res.data) setPending(res.data);
      setChecking(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;

    setLoading(true);
    setError(null);

    const { data, error: err } = await requestJoinOrg(adminEmail.trim());

    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setPending({ orgName: data?.orgName ?? null, createdAt: Date.now() });
  };

  const handleCancel = async () => {
    setLoading(true);
    const { error: err } = await cancelMyJoinRequest();
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setPending(null);
  };

  const shell = (children) => (
    <Card.Root
      w="full"
      bg="var(--card-bg, #FFFFFF)"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      border="1px solid"
      borderColor="cyan.100"
    >
      <Card.Body p={{ base: 5, md: 6 }}>{children}</Card.Body>
    </Card.Root>
  );

  if (checking) return shell(<Text fontSize="sm" color="var(--text-muted)">確認中...</Text>);

  /*
    ⚠️ **承認されるまでここに留まる。** 「完了しました」と出さないこと。
       承認は相手の操作なので、いつ通るか分からない。
  */
  if (pending) {
    return shell(
      <VStack align="center" gap={3} py={4} textAlign="center">
        <Box bg="var(--teal, #0891B2)" color="white" borderRadius="full" p={2}>
          <Icon.LuClock size={20} />
        </Box>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
          参加を申請しました
        </Heading>
        <Text fontSize="sm" color="var(--text-muted)" lineHeight="1.8">
          {pending.orgName ? `「${pending.orgName}」の` : ""}
          店舗管理者が承認すると参加できます。
          <br />
          承認されたらこのページを再読み込みしてください。
        </Text>
        {error && (
          <HStack gap={1.5} color="red.500" fontSize="sm">
            <Icon.LuX size={14} />
            <Text>{error}</Text>
          </HStack>
        )}
        <HStack gap={2}>
          <Button
            size="sm"
            colorPalette="cyan"
            borderRadius="full"
            onClick={() => window.location.reload()}
          >
            <Icon.LuRefreshCw size={14} />
            再読み込み
          </Button>
          {/* ⚠️ 取り下げを必ず置く。別の組織へ申請し直す手段がこれしか無い */}
          <Button
            size="sm"
            variant="ghost"
            borderRadius="full"
            loading={loading}
            onClick={handleCancel}
          >
            申請を取り下げる
          </Button>
        </HStack>
      </VStack>
    );
  }

  return shell(
    <>
      <HStack gap={2} mb={5}>
        <Box color="var(--teal)">
          <Icon.LuBuilding2 size={18} />
        </Box>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
          組織に参加する
        </Heading>
      </HStack>

      <Text fontSize="sm" color="var(--text-muted)" mb={4} lineHeight="1.8">
        管理者のメールアドレスを入力して申請してください。
        組織の店舗管理者が承認すると参加できます。
      </Text>

      <form onSubmit={handleSubmit}>
        <VStack align="stretch" gap={4}>
          <VStack align="stretch" gap={1.5}>
            <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)">
              管理者のメールアドレス
            </Text>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              borderRadius="lg"
              borderColor="cyan.100"
              _focusVisible={{ borderColor: "cyan.400" }}
              required
            />
          </VStack>

          {error && (
            <HStack gap={1.5} color="red.500" fontSize="sm">
              <Icon.LuX size={14} />
              <Text>{error}</Text>
            </HStack>
          )}

          <Button
            type="submit"
            colorPalette="cyan"
            borderRadius="full"
            fontWeight="semibold"
            loading={loading}
            loadingText="送信中..."
            w="full"
          >
            <Icon.LuUserCheck size={16} />
            参加を申請する
          </Button>
        </VStack>
      </form>
    </>
  );
}
