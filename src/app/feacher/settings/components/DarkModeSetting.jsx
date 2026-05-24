"use client";

import { useEffect, useState } from "react";
import { Switch, HStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

export default function DarkModeSetting() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("colorMode");
    setIsDark(stored === "dark");
  }, []);

  const handleToggle = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("colorMode", theme);
  };

  return (
    <HStack gap={2}>
      <Icon.LuSun size={16} color="var(--text-muted)" />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        colorPalette="cyan"
        size="md"
      />
      <Icon.LuMoon size={16} color="var(--text-muted)" />
    </HStack>
  );
}
