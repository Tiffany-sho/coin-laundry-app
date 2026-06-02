"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Checkbox,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import { deleteMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { showToast } from "@/functions/makeToast/toast";

export default function ResetRoleClient({ orgDetails }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const { orgName, storeCount, memberCount } = orgDetails;

  const handleDelete = async () => {
    if (!confirmed) return;
    setLoading(true);

    const { error } = await deleteMyOrganization();
    if (error) {
      showToast("error", error);
      setLoading(false);
      return;
    }

    showToast("success", "組織を削除しました。役割がリセットされました。");
    router.push("/");
    router.refresh();
  };

  return (
    <VStack align="stretch" gap={6}>
      {/* ヘッダー */}
      <HStack gap={3}>
        <Link href="/settings">
          <Flex
            w="36px" h="36px" align="center" justify="center"
            borderRadius="lg" border="1px solid" borderColor="cyan.100"
            color="var(--text-muted)" cursor="pointer" transition="all 0.2s"
            _hover={{ bg: "var(--teal-pale)", color: "var(--teal)" }}
          >
            <Icon.LuChevronLeft size={20} />
          </Flex>
        </Link>
        <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
          役割をリセット
        </Heading>
      </HStack>

      {/* 説明 */}
      <Box
        p={4} bg="cyan.50" borderRadius="xl"
        border="1px solid" borderColor="cyan.100"
      >
        <HStack gap={3} align="start">
          <Box color="var(--teal)" flexShrink={0} mt={0.5}>
            <Icon.LuInfo size={18} />
          </Box>
          <Text fontSize="sm" color="var(--text-main)" lineHeight="1.7">
            誤って「店舗管理者」として登録してしまった場合、このページから組織を削除して役割をリセットできます。
            リセット後は組織に参加していない状態になるので、管理者から招待を受けて「集金担当者」として参加し直してください。
          </Text>
        </HStack>
      </Box>

      {/* 現在の状態 */}
      <Box bg="var(--card-bg)" borderRadius="xl" border="1px solid" borderColor="cyan.100"
        boxShadow="var(--shadow-sm)" overflow="hidden">
        <Box p={5} borderBottom="1px solid" borderColor="var(--divider)">
          <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper)">現在の状態</Text>
        </Box>
        <VStack align="stretch" gap={0} divideY="1px">
          <HStack justify="space-between" p={4}>
            <Text fontSize="sm" color="var(--text-muted)">役割</Text>
            <HStack gap={1.5}>
              <Icon.LuCrown size={14} color="var(--teal)" />
              <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">店舗管理者</Text>
            </HStack>
          </HStack>
          <HStack justify="space-between" p={4}>
            <Text fontSize="sm" color="var(--text-muted)">組織名</Text>
            <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">{orgName}</Text>
          </HStack>
          <HStack justify="space-between" p={4}>
            <Text fontSize="sm" color="var(--text-muted)">登録店舗数</Text>
            <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">{storeCount} 店舗</Text>
          </HStack>
          <HStack justify="space-between" p={4}>
            <Text fontSize="sm" color="var(--text-muted)">メンバー数</Text>
            <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">{memberCount} 人</Text>
          </HStack>
        </VStack>
      </Box>

      {/* 削除される内容 */}
      <Box bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.200" p={5}>
        <HStack gap={2} mb={4}>
          <Icon.LuTriangleAlert size={18} color="#E53E3E" />
          <Text fontSize="sm" fontWeight="bold" color="red.600">削除されるデータ（元に戻せません）</Text>
        </HStack>
        <VStack align="stretch" gap={2.5}>
          {[
            `組織「${orgName}」`,
            `${storeCount} 店舗の全データ（集金記録・在庫・機器情報）`,
            `${memberCount} 人分の組織所属情報`,
            "未承諾の招待リンク",
            "アクションログ",
          ].map((item) => (
            <HStack key={item} gap={2.5} align="start">
              <Box color="red.400" flexShrink={0} mt={0.5}>
                <Icon.LuX size={14} />
              </Box>
              <Text fontSize="sm" color="red.700">{item}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* 確認チェックボックス */}
      <Box
        p={4} bg="var(--card-bg)" borderRadius="xl"
        border="2px solid" borderColor={confirmed ? "red.400" : "var(--divider)"}
        transition="border-color 0.2s"
        cursor="pointer"
        onClick={() => setConfirmed((v) => !v)}
      >
        <HStack gap={3} align="start">
          <Checkbox.Root
            checked={confirmed}
            onCheckedChange={(e) => setConfirmed(!!e.checked)}
            colorPalette="red"
            mt={0.5}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control borderColor={confirmed ? "red.400" : "gray.300"} />
          </Checkbox.Root>
          <Text fontSize="sm" color="var(--text-main)" lineHeight="1.7">
            上記の内容を理解しました。組織と全データを完全に削除することに同意します。
          </Text>
        </HStack>
      </Box>

      {/* 実行ボタン */}
      <VStack gap={3}>
        <Button
          w="full" py={4}
          bg={confirmed ? "red.500" : "gray.200"}
          color={confirmed ? "white" : "gray.400"}
          fontWeight="bold" borderRadius="xl"
          fontSize="md"
          cursor={confirmed ? "pointer" : "not-allowed"}
          disabled={!confirmed || loading}
          onClick={handleDelete}
          transition="all 0.2s"
          _hover={confirmed ? { bg: "red.600", transform: "translateY(-1px)" } : {}}
        >
          {loading ? "削除中..." : "組織を削除して役割をリセット"}
        </Button>
        <Link href="/settings" style={{ width: "100%" }}>
          <Button
            w="full" variant="outline"
            borderColor="cyan.200" color="var(--text-muted)"
            borderRadius="xl" fontWeight="semibold"
            _hover={{ bg: "var(--teal-pale)" }}
          >
            キャンセル
          </Button>
        </Link>
      </VStack>
    </VStack>
  );
}
