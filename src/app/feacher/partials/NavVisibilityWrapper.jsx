"use client";

import { usePathname } from "next/navigation";
import { isAppLegalPath } from "@/app/feacher/partials/appLegalPaths";

const HIDDEN_NAV_PATTERNS = [/^\/collectMoney\/[^/]+\/newData$/];

export default function NavVisibilityWrapper({ children }) {
  const pathname = usePathname();
  if (HIDDEN_NAV_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return null;
  }
  // ⚠️ iOS アプリの WebView 用ページ。ナビを出すとプラン画面へ辿れてしまう
  //    （appLegalPaths.js のコメント参照）
  if (isAppLegalPath(pathname)) {
    return null;
  }
  return children;
}
