"use client";

import { Switch, HStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useColorMode } from "@/components/ui/color-mode";

export default function DarkModeSetting() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <HStack gap={2}>
      <Icon.LuSun size={16} color="var(--text-muted)" />
      <Switch.Root
        checked={isDark}
        onCheckedChange={toggleColorMode}
        colorPalette="cyan"
        size="md"
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
      <Icon.LuMoon size={16} color="var(--text-muted)" />
    </HStack>
  );
}
