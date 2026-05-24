"use client";

import { ChakraProvider, defaultSystem, Theme } from "@chakra-ui/react";
import { ColorModeProvider, useColorMode } from "@/components/ui/color-mode";

function ThemedApp(props) {
  const { colorMode } = useColorMode();
  return <Theme appearance={colorMode ?? "light"} {...props} />;
}

export function Provider(props) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        <ThemedApp {...props} />
      </ColorModeProvider>
    </ChakraProvider>
  );
}
