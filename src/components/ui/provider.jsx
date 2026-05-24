"use client";

import { ChakraProvider, defaultSystem, Theme } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function Provider(props) {
  const [appearance, setAppearance] = useState(() => {
    if (typeof window === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute("data-theme");
      setAppearance(attr === "dark" ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <ChakraProvider value={defaultSystem}>
      <Theme appearance={appearance} {...props} />
    </ChakraProvider>
  );
}
