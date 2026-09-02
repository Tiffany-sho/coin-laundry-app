"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  Flex,
  Heading,
  HStack,
  Input,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { createClient } from "@/utils/supabase/client";
import { deleteAccount } from "@/app/api/supabaseFunctions/supabaseDatabase/account/action";

/**
 * アカウント削除（App Store Guideline 5.1.1(v) の Web 版）。
 *
 * iOS 版と同じ 3 段構え：影響の説明 → 本人確認 → 確認ダイアログ。
 * ⚠️ **チェックボックスを外さないこと。** 本人確認だけを条件にすると、
 *    ブラウザのオートフィルでパスワード欄が埋まり、読まずに押せてしまう。
 */
export default function DeleteAccountClient({ summary, email, verifyBy }) {
  const [password, setPassword] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = !!summary?.isOwner;
  const orgName = summary?.orgName ?? null;
  const storeCount = summary?.storeCount ?? 0;
  const fundCount = summary?.fundCount ?? 0;

  const filled =
    verifyBy === "password" ? password.length > 0 : emailInput.trim().length > 0;
  const canProceed = acknowledged && filled && !submitting;

  /**
   * 本人確認。⚠️ **ここを素通りさせないこと。** 開きっぱなしの端末を触った人が
   * アカウントを消せてしまう。通らなければ確認ダイアログも出さない。
   */
  async function verify() {
    if (verifyBy === "password") {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError("パスワードが違います");
        return false;
      }
      return true;
    }

    if (emailInput.trim().toLowerCase() !== (email ?? "").toLowerCase()) {
      setError("メールアドレスが一致しません");
      return false;
    }
    return true;
  }

  async function handleVerifyAndConfirm() {
    setError(null);
    setSubmitting(true);
    const ok = await verify();
    setSubmitting(false);
    if (ok) setConfirming(true);
  }

  async function handleDelete() {
    setSubmitting(true);
    const { error: deleteError } = await deleteAccount();

    if (deleteError) {
      setError(
        typeof deleteError === "string"
          ? deleteError
          : (deleteError.msg ?? "削除に失敗しました")
      );
      setSubmitting(false);
      setConfirming(false);
      return;
    }

    /*
      ⚠️ **`/api/auth/logout` に流さないこと。** auth ユーザーはもう存在せず、
         あちらは `getUser()` が null を返して signOut を呼ばないため、
         期限切れのクッキーが残ったままになる。ローカルのセッションを直接落とす。
      ⚠️ router.push ではなく location で全体を読み直す。RSC のキャッシュに
         削除済みユーザーの画面が残る。
    */
    try {
      await createClient().auth.signOut({ scope: "local" });
    } catch {
      // ここで失敗しても削除自体は終わっている。遷移は続ける
    }
    window.location.href = "/";
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* ヘッダー */}
      <HStack gap={3}>
        <Link href="/settings">
          <Flex
            w="36px" h="36px" align="center" justify="center"
            borderRadius="lg" border="1px solid" borderColor="cyan.100"
            color="var(--text-muted, #64748B)" cursor="pointer" transition="all 0.2s"
            _hover={{ bg: "var(--teal-pale, #CFFAFE)", color: "var(--teal, #0891B2)" }}
          >
            <Icon.LuChevronLeft size={20} />
          </Flex>
        </Link>
        <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper, #155E75)">
          アカウントを削除
        </Heading>
      </HStack>

      {/* 何が消えるか */}
      <Box bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.200" p={5}>
        <HStack gap={2} mb={4}>
          <Icon.LuTriangleAlert size={18} color="#E53E3E" />
          <Text fontSize="sm" fontWeight="bold" color="red.600">
            削除すると元に戻せません
          </Text>
        </HStack>

        {isOwner ? (
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" color="red.700" lineHeight="1.7">
              あなたは「{orgName}」のオーナーです。削除すると組織ごと消えます。
            </Text>
            <VStack align="stretch" gap={0} divideY="1px" borderColor="red.200">
              <SummaryRow label="削除される店舗" value={`${storeCount} 件`} />
              <SummaryRow label="削除される集金記録" value={`${fundCount} 件`} />
            </VStack>
            <Text fontSize="xs" color="red.600" lineHeight="1.7">
              他のメンバーもこの組織のデータを見られなくなります。
            </Text>
          </VStack>
        ) : orgName ? (
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" color="red.700" lineHeight="1.7">
              「{orgName}」から抜けます。組織のデータは残ります。
            </Text>
            <VStack align="stretch" gap={0} divideY="1px" borderColor="red.200">
              <SummaryRow label="あなたの集金記録" value={`${fundCount} 件`} />
            </VStack>
            <Text fontSize="xs" color="red.600" lineHeight="1.7">
              集金記録は組織の売上履歴として残り、集金者は「退会済みユーザー」と表示されます。
            </Text>
          </VStack>
        ) : (
          <Text fontSize="sm" color="red.700" lineHeight="1.7">
            プロフィールとログイン情報が削除されます。
          </Text>
        )}
      </Box>

      {/* 本人確認 */}
      <Box
        bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
        border="1px solid" borderColor="cyan.100" boxShadow="var(--shadow-sm, 0 2px 12px rgba(8,145,178,0.08))" p={5}
      >
        {verifyBy === "password" ? (
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="bold" color="var(--text-main, #1E3A5F)">
              確認のためパスワードを入力してください
            </Text>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              minH="48px"
              borderColor="var(--divider, #F1F5F9)"
              _focusVisible={{ borderColor: "cyan.400" }}
            />
          </VStack>
        ) : (
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="bold" color="var(--text-main, #1E3A5F)">
              確認のためメールアドレスを入力してください
            </Text>
            {/* パスワードを持たない（Google / GitHub で登録した）アカウント向け */}
            <Text fontSize="xs" color="var(--text-muted, #64748B)" lineHeight="1.7">
              このアカウントのメールアドレス（{email}）をそのまま入力してください。
            </Text>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={email}
              autoComplete="off"
              minH="48px"
              borderColor="var(--divider, #F1F5F9)"
              _focusVisible={{ borderColor: "cyan.400" }}
            />
          </VStack>
        )}

        {error && (
          <Text fontSize="sm" color="red.500" mt={3}>
            {error}
          </Text>
        )}
      </Box>

      {/*
        押す前に必ず1つ意思表示させる。オートフィルで素通りするのを防ぐ。
        ⚠️ **外側の Box に onClick を付けて中に Checkbox を置かないこと。**
           チェックボックス本体を押すと onCheckedChange と Box の onClick が
           両方走って 2 回トグルし、**チェックが入らない**（ResetRoleClient が
           その形になっている）。Checkbox.Root 自体をカード全体にする。
      */}
      <Checkbox.Root
        checked={acknowledged}
        onCheckedChange={(e) => setAcknowledged(!!e.checked)}
        colorPalette="red"
        w="full" p={4} gap={3} alignItems="start"
        bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
        border="2px solid" borderColor={acknowledged ? "red.400" : "var(--divider, #F1F5F9)"}
        transition="border-color 0.2s"
        cursor="pointer"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control mt={0.5} borderColor={acknowledged ? "red.400" : "gray.300"} />
        <Checkbox.Label
          fontSize="sm" fontWeight="normal"
          color="var(--text-main, #1E3A5F)" lineHeight="1.7"
        >
          削除すると元に戻せないこと、上記のデータが消えることを理解しました。
        </Checkbox.Label>
      </Checkbox.Root>

      {/*
        ⚠️ 削除ボタンは必ずここ（最下部）に置くこと。
           画面を開いた直後の指の位置に入れない。iOS 版と同じ方針。
      */}
      <VStack gap={3} mt={6}>
        <Button
          w="full" py={4}
          bg={canProceed ? "red.500" : "gray.200"}
          color={canProceed ? "white" : "gray.400"}
          fontWeight="bold" borderRadius="xl" fontSize="md"
          cursor={canProceed ? "pointer" : "not-allowed"}
          disabled={!canProceed}
          onClick={handleVerifyAndConfirm}
          transition="all 0.2s"
          _hover={canProceed ? { bg: "red.600", transform: "translateY(-1px)" } : {}}
        >
          {submitting && !confirming ? "確認中..." : "アカウントを削除する"}
        </Button>
        <Text fontSize="xs" color="var(--text-faint, #94A3B8)" textAlign="center">
          この操作は取り消せません。押すともう一度確認します。
        </Text>
        <Link href="/settings" style={{ width: "100%" }}>
          <Button
            w="full" variant="outline"
            borderColor="cyan.200" color="var(--text-muted, #64748B)"
            borderRadius="xl" fontWeight="semibold"
            _hover={{ bg: "var(--teal-pale, #CFFAFE)" }}
          >
            キャンセル
          </Button>
        </Link>
      </VStack>

      {/* 最後の確認 */}
      <Dialog.Root
        role="alertdialog"
        placement="center"
        open={confirming}
        onOpenChange={(e) => {
          if (!submitting) setConfirming(e.open);
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>アカウントを削除しますか？</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="sm" color="var(--text-main, #1E3A5F)" lineHeight="1.7">
                  この操作は取り消せません。
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setConfirming(false)}
                >
                  キャンセル
                </Button>
                <Button colorPalette="red" onClick={handleDelete} disabled={submitting}>
                  {submitting ? "削除中..." : "削除する"}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}

function SummaryRow({ label, value }) {
  return (
    <HStack justify="space-between" py={2.5}>
      <Text fontSize="sm" color="red.600">{label}</Text>
      <Text
        fontSize="sm" fontWeight="semibold" color="red.700"
        fontFamily="'Space Mono', monospace"
      >
        {value}
      </Text>
    </HStack>
  );
}
