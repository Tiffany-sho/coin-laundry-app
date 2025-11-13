"use client";

import { Button, Card, Field, Input, Stack, Box, Text } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useActionState } from "react";
import Link from "next/link";
import ProviderForm from "../ProviderForm/ProviderForm";

export default function AuthForm({ mode, action }) {
  const initState = {
    message: null,
    error: null,
  };

  const [state, formAction] = useActionState(action, initState);
  const isLogin = mode === "login";
  const title = isLogin ? "ログイン" : "サインアップ";
  const buttonText = isLogin ? "ログイン" : "サインアップ";
  const description = isLogin
    ? "アカウント情報を入力してログインしてください"
    : "新しいアカウントを作成するために情報を入力してください";
  const linkText = isLogin
    ? "アカウントをお持ちでない方"
    : "既にアカウントをお持ちの方";
  const linkHref = isLogin ? "/auth/signup" : "/auth/login";
  const linkLabel = isLogin ? "サインアップ" : "ログイン";

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
              {title}
            </Card.Title>
            <Card.Description color="blue.50" fontSize="sm">
              {description}
            </Card.Description>
          </Card.Header>

          <Card.Body py={8} px={6}>
            <Stack gap="6" w="full">
              {state?.error && <Text color="red.600">{state.error}</Text>}
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

              <Field.Root>
                <Field.Label
                  htmlFor="password"
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  パスワード
                </Field.Label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="パスワード"
                  required
                  size="lg"
                  borderRadius="md"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                />
              </Field.Root>
              <Text fontSize="sm" color="gray.600">
                <Link href="/auth/forgetPassword" passHref>
                  <Text
                    as="span"
                    color="blue.500"
                    fontWeight="semibold"
                    _hover={{
                      color: "blue.600",
                      textDecoration: "underline",
                    }}
                  >
                    パスワードを忘れた場合
                  </Text>
                </Link>
              </Text>
            </Stack>
          </Card.Body>

          <Card.Footer flexDirection="column" gap={4} px={6} pb={6}>
            <Button
              variant="solid"
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
              {buttonText}
            </Button>

            <Box textAlign="center" w="full">
              <Text fontSize="sm" color="gray.600">
                {linkText}？{" "}
                <Link href={linkHref} passHref>
                  <Text
                    as="span"
                    color="blue.500"
                    fontWeight="semibold"
                    _hover={{
                      color: "blue.600",
                      textDecoration: "underline",
                    }}
                  >
                    {linkLabel}
                  </Text>
                </Link>
              </Text>
            </Box>
            <ProviderForm title={title} />
          </Card.Footer>
        </Card.Root>
      </form>
    </Box>
  );
}
