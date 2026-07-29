"use client";

import Link from "next/link";
import { HStack, Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { isAppLegalPath } from "@/app/feacher/partials/appLegalPaths";
import { LuChevronLeft } from "react-icons/lu";

/**
 * 規約・ポリシーの「戻る」リンク。
 *
 * ⚠️ /app/* （iOS アプリの WebView から開くページ）では出さないこと。
 *    アプリ側のヘッダに戻るボタンがあるうえ、ここから /settings へ飛ばれると
 *    WebView の中に Web アプリ本体が開いてしまう（プラン画面まで辿れてしまう）。
 */
export default function LegalBackLink() {
  const pathname = usePathname();
  if (isAppLegalPath(pathname)) return null;

  return (
    <Link href="/settings">
      <HStack
        gap={1}
        color="var(--text-muted)"
        fontSize="sm"
        cursor="pointer"
        _hover={{ color: "var(--text-main)" }}
        flexShrink={0}
      >
        <LuChevronLeft size={16} />
        <Text>戻る</Text>
      </HStack>
    </Link>
  );
}
