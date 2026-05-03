"use client";

import { createClient } from "@/utils/supabase/client";
import { Button, Stack, Box, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

export default function ProviderForm({ title }) {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Box w="full">
      <Box position="relative" py={4}>
        <Box
          position="absolute"
          top="50%"
          left="0"
          right="0"
          height="1px"
          bg="var(--divider, #F1F5F9)"
        />
        <Text
          position="relative"
          textAlign="center"
          fontSize="sm"
          color="var(--text-faint, #94A3B8)"
          bg="white"
          px={4}
          mx="auto"
          width="fit-content"
        >
          または
        </Text>
      </Box>

      <Stack gap={3} w="full">
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          size="lg"
          w="full"
          borderColor="var(--divider, #F1F5F9)"
          bg="white"
          color="var(--text-main, #1E3A5F)"
          fontWeight="medium"
          _hover={{
            borderColor: "cyan.300",
            bg: "cyan.50",
          }}
          _focus={{
            borderColor: "cyan.500",
            boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
            outline: "none",
          }}
          transition="all 0.18s"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Icon.FcGoogle size={20} />
            <Text>Googleで{title}</Text>
          </Box>
        </Button>

        <Button
          onClick={handleGitHubLogin}
          variant="outline"
          size="lg"
          w="full"
          borderColor="var(--divider, #F1F5F9)"
          bg="white"
          color="var(--text-main, #1E3A5F)"
          fontWeight="medium"
          _hover={{
            borderColor: "cyan.300",
            bg: "cyan.50",
          }}
          _focus={{
            borderColor: "cyan.500",
            boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
            outline: "none",
          }}
          transition="all 0.18s"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Icon.IoLogoGithub size={20} />
            <Text>GitHubで{title}</Text>
          </Box>
        </Button>
      </Stack>
    </Box>
  );
}
