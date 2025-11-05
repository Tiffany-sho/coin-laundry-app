"use client";

import { Button, Card, Field, Input, Stack, Box, Text } from "@chakra-ui/react";
import { useActionState } from "react";

const initState = {
  message: null,
  error: null,
};

export default function SendEmail({ action }) {
  const [state, formAction] = useActionState(action, initState);
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <form action={formAction}>
        <Card.Root
          maxW="md"
          w="full"
          boxShadow="xl"
          borderRadius="xl"
          overflow="hidden"
        >
          <Card.Header bg="gray.700" color="white" py={6} textAlign="center">
            <Card.Title fontSize="2xl" fontWeight="bold" mb={2}>
              パスワード変更
            </Card.Title>
            <Card.Description color="blue.50" fontSize="sm">
              ダミー
            </Card.Description>
          </Card.Header>

          <Card.Body py={8} px={6}>
            <Stack gap="6" w="full">
              {state?.error && <Text color="red.500">{state.error}</Text>}
              {state?.message && <Text color="green.500">{state.message}</Text>}
              <Field.Root>
                <Field.Label
                  htmlFor="email"
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  メールアドレス
                </Field.Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="メールアドレス"
                  required
                  size="lg"
                  borderRadius="md"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                />
              </Field.Root>
            </Stack>
          </Card.Body>

          <Card.Footer flexDirection="column" gap={4} px={6} pb={6}>
            <Button
              variant="solid"
              colorScheme="blue"
              type="submit"
              size="lg"
              w="full"
              fontWeight="bold"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              transition="all 0.2s"
            >
              送信
            </Button>
          </Card.Footer>
        </Card.Root>
      </form>
    </Box>
  );
}
