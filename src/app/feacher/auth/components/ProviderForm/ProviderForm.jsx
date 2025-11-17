"use client";

import { createClient } from "@/utils/supabase/client";
import { Button, Stack, Box, Text } from "@chakra-ui/react";
import * as Icon from "./Icon";

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
          bg="gray.300"
        />
        <Text
          position="relative"
          textAlign="center"
          fontSize="sm"
          color="gray.500"
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
          borderColor="gray.300"
          bg="white"
          fontWeight="medium"
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
            outline: "none",
          }}
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
          borderColor="gray.300"
          bg="white"
          fontWeight="medium"
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
            outline: "none",
          }}
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
