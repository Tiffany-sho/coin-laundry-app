"use client";

import { ChakraProvider, defaultSystem, Theme } from "@chakra-ui/react";

export function Provider(props) {
  return (
    <ChakraProvider value={defaultSystem}>
      <Theme appearance="light" {...props} />
    </ChakraProvider>
  );
}
