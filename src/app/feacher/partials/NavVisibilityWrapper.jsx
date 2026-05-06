"use client";

import { usePathname } from "next/navigation";

const HIDDEN_NAV_PATTERNS = [/^\/collectMoney\/[^/]+\/newData$/];

export default function NavVisibilityWrapper({ children }) {
  const pathname = usePathname();
  if (HIDDEN_NAV_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return null;
  }
  return children;
}
