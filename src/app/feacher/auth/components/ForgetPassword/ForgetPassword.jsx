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
      bg="gray.50"
    >
      <Box w="full" maxW="28rem">
        <form action={formAction}>
          <Card.Root
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            overflow="hidden"
          >
            <Card.Header
              bg="gray.700"
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
              <Text color="whiteAlpha.900" fontSize="sm" mt={2}>
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
                    borderColor="red.500"
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
                    bg="green.50"
                    borderLeft="4px solid"
                    borderColor="green.500"
                    borderRadius="md"
                  >
                    <Text color="green.700" fontSize="sm" fontWeight="medium">
                      {state.message}
                    </Text>
                  </Box>
                )}

                <Field.Root>
                  <Field.Label
                    htmlFor="email"
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
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
                    border="2px solid"
                    borderColor="gray.400"
                    borderRadius="lg"
                    py={3}
                    px={4}
                    fontSize="md"
                    bg="white"
                    color="gray.800"
                    transition="all 0.2s"
                    _focus={{
                      borderColor: "gray.600",
                      boxShadow: "0 0 0 3px rgba(75, 85, 99, 0.15)",
                      outline: "none",
                    }}
                    _placeholder={{
                      color: "gray.400",
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
                bg="gray.700"
                border="none"
                borderRadius="lg"
                cursor="pointer"
                transition="all 0.3s ease"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.2)"
                _hover={{
                  bg: "gray.800",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
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
