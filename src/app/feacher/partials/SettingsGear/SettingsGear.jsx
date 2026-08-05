"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

/**
 * 設定への入口。**スマホのときだけ、全ページの右上に固定で出る**（2026-08-05）。
 *
 * ⚠️ **これがフッターの「設定」の代わり。** アプリが 2026-08-03 に設定を
 *    タブからホームの歯車へ移したのと同じ形にしてある。
 *
 * ⚠️ **消すとスマホから設定へ二度と辿り着けない。** 上部ナビは 769px 以下で
 *    `display: none`（`Navbar.module.css`）なので、**この歯車が唯一の入口。**
 *    その奥にサインアウト・組織の設定・プラン・通知がすべてある。
 *    ⚠️ フッターから「設定」を外した以上、**ここを条件で隠さないこと。**
 *
 * ⚠️ **しまう幅は上部ナビと 1px の狂いもなく揃える。** 上部ナビは
 *    `Navber.module.css` が `@media (max-width: 769px)` で隠しているので、
 *    ここは `min-width: 770px` で隠す。**Chakra の `md` / `lg` を使わないこと**
 *    （md=768px なので **768〜769px でどちらも出ない**幅ができる）。
 *
 * ⚠️ **設定ページ自身では出さない。** すでにそこに居るので押しても何も起きず、
 *    ページの見出しに重なるだけになる。
 */
export default function SettingsGear() {
  const pathname = usePathname();
  if (pathname.startsWith("/settings")) return null;

  return (
    <Box
      /* ⚠️ 770px 以上では上部ナビに「設定」がある。幅は Navber.module.css と揃える */
      css={{ "@media (min-width: 770px)": { display: "none" } }}
      position="fixed"
      top="calc(env(safe-area-inset-top, 0px) + 12px)"
      right="12px"
      /*
        ⚠️ **z-index はフッターナビ（1000 前後）より上、ダイアログより下。**
           上げすぎるとモーダルの上に歯車が浮く。
      */
      zIndex="900"
    >
      <Link href="/settings" aria-label="設定">
        <Box
          w="40px"
          h="40px"
          borderRadius="full"
          bg="var(--card-bg, #FFFFFF)"
          border="1px solid"
          borderColor="cyan.100"
          boxShadow="0 2px 10px rgba(15,23,42,0.12)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="var(--teal, #0891B2)"
          transition="all 0.2s"
          _hover={{ bg: "cyan.50" }}
          _active={{ transform: "scale(0.94)" }}
        >
          <Icon.LuSettings size={19} />
        </Box>
      </Link>
    </Box>
  );
}
