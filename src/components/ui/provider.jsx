"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider } from "@/components/ui/color-mode";

export function Provider({ children }) {
  return (
    <ColorModeProvider forcedTheme="light">
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </ColorModeProvider>
  );
}
