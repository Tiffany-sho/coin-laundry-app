"use client";

import { useActionState } from "react";
import {
  Box,
  Button,
  Card,
  Field,
  Input,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";

const initState = {
  message: null,
  error: null,
};

export default function SendEmail({ action }) {
  const [state, formAction] = useActionState(action, initState);

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={{ base: 2, md: 4 }}
      bg="var(--app-bg, #F0F9FF)"
    >
      <Box w="full" maxW="28rem">
        <form action={formAction}>
          <Card.Root
            bg="white"
            borderRadius="2xl"
            boxShadow="0 12px 40px rgba(14, 116, 144, 0.18)"
            overflow="hidden"
            border="1px solid rgba(8, 145, 178, 0.12)"
          >
            <Card.Header
              style={{ background: "linear-gradient(140deg, #0E7490 0%, #0891B2 55%, #06B6D4 100%)" }}
              color="white"
              p={{ base: 6, md: 8 }}
              textAlign="center"
            >
              <Card.Title
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                mb={2}
              >
                パスワード変更
              </Card.Title>
              <Text color="rgba(255,255,255,0.75)" fontSize="sm" mt={2}>
                登録されているメールアドレスを入力してください
              </Text>
            </Card.Header>

            <Card.Body p={{ base: 6, md: 8 }}>
              <VStack align="stretch" gap={6}>
                {state?.error && (
                  <Box
                    p={3}
                    bg="red.50"
                    borderLeft="4px solid"
                    borderColor="red.400"
                    borderRadius="md"
                  >
                    <Text color="red.700" fontSize="sm" fontWeight="medium">
                      {state.error}
                    </Text>
                  </Box>
                )}

                {state?.message && (
                  <Box
                    p={3}
                    bg="cyan.50"
                    borderLeft="4px solid"
                    borderColor="cyan.400"
                    borderRadius="md"
                  >
                    <Text color="cyan.800" fontSize="sm" fontWeight="medium">
                      {state.message}
                    </Text>
                  </Box>
                )}

                <Field.Root>
                  <Field.Label
                    htmlFor="email"
                    fontSize="sm"
                    fontWeight="semibold"
                    color="var(--text-main, #1E3A5F)"
                    mb={2}
                  >
                    メールアドレス
                  </Field.Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    border="1.5px solid"
                    borderColor="var(--divider, #F1F5F9)"
                    borderRadius="lg"
                    py={3}
                    px={4}
                    fontSize="md"
                    bg="white"
                    color="var(--text-main, #1E3A5F)"
                    transition="all 0.2s"
                    _focus={{
                      borderColor: "cyan.500",
                      boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
                      outline: "none",
                    }}
                    _placeholder={{
                      color: "var(--text-faint, #94A3B8)",
                    }}
                  />
                </Field.Root>
              </VStack>
            </Card.Body>

            <Card.Footer p={{ base: 4, md: 6 }} pt={0}>
              <Button
                type="submit"
                w="full"
                py={3.5}
                px={6}
                fontSize="md"
                fontWeight="bold"
                color="white"
                style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                border="none"
                borderRadius="lg"
                cursor="pointer"
                transition="all 0.2s"
                boxShadow="0 4px 14px rgba(8, 145, 178, 0.28)"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(8, 145, 178, 0.40)",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                  transform: "none",
                }}
              >
                送信
              </Button>
            </Card.Footer>
          </Card.Root>
        </form>
      </Box>
    </Flex>
  );
}
