"use client";

import { Button, Card, Field, Input, Stack, Box, Text, HStack } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useActionState } from "react";
import Link from "next/link";
import { LuChevronLeft } from "react-icons/lu";
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
      bg="var(--app-bg, #F0F9FF)"
      px={4}
    >
      <Box w="full" maxW="md">
        <Link href="/">
          <HStack gap={1} color="var(--text-muted)" fontSize="sm" mb={4} cursor="pointer"
            _hover={{ color: "var(--text-main)" }}>
            <LuChevronLeft size={16} />
            <Text>トップに戻る</Text>
          </HStack>
        </Link>
        <form action={formAction}>
        <Card.Root
          maxW="md"
          w="full"
          boxShadow="0 12px 40px rgba(14, 116, 144, 0.18)"
          borderRadius="2xl"
          overflow="hidden"
          border="1px solid rgba(8, 145, 178, 0.12)"
        >
          <Card.Header
            style={{ background: "linear-gradient(140deg, #0E7490 0%, #0891B2 55%, #06B6D4 100%)" }}
            color="white"
            py={7}
            px={8}
            textAlign="center"
          >
            <Card.Title fontSize="2xl" fontWeight="bold" mb={2}>
              {title}
            </Card.Title>
            <Card.Description color="rgba(255,255,255,0.75)" fontSize="sm">
              {description}
            </Card.Description>
          </Card.Header>

          <Card.Body py={8} px={6} bg="var(--card-bg, #FFFFFF)">
            <Stack gap="6" w="full">
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
              <Field.Root>
                <Field.Label
                  htmlFor="email"
                  fontSize="sm"
                  fontWeight="semibold"
                  color="var(--text-main, #1E3A5F)"
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
                  borderRadius="lg"
                  borderColor="var(--divider, #F1F5F9)"
                  _focus={{
                    borderColor: "cyan.500",
                    boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
                  }}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  htmlFor="password"
                  fontSize="sm"
                  fontWeight="semibold"
                  color="var(--text-main, #1E3A5F)"
                >
                  パスワード
                </Field.Label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="パスワード"
                  required
                  size="lg"
                  borderRadius="lg"
                  borderColor="var(--divider, #F1F5F9)"
                  _focus={{
                    borderColor: "cyan.500",
                    boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
                  }}
                />
              </Field.Root>

              {isLogin && (
                <Text fontSize="sm" color="var(--text-muted, #64748B)">
                  <Link href="/auth/forgetPassword" passHref>
                    <Text
                      as="span"
                      color="var(--teal, #0891B2)"
                      fontWeight="semibold"
                      _hover={{
                        color: "var(--teal-dark, #0E7490)",
                        textDecoration: "underline",
                      }}
                    >
                      パスワードを忘れた場合
                    </Text>
                  </Link>
                </Text>
              )}

              {!isLogin && (
                <Box>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      name="terms"
                      required
                      style={{ marginTop: "3px", accentColor: "var(--teal, #0891B2)", flexShrink: 0, width: "16px", height: "16px" }}
                    />
                    <Text fontSize="sm" color="var(--text-muted, #64748B)">
                      <Link href="/terms" target="_blank">
                        <Text as="span" color="var(--teal, #0891B2)" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                          利用規約
                        </Text>
                      </Link>
                      および
                      <Link href="/privacy" target="_blank">
                        <Text as="span" color="var(--teal, #0891B2)" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                          プライバシーポリシー
                        </Text>
                      </Link>
                      に同意する
                    </Text>
                  </label>
                </Box>
              )}
            </Stack>
          </Card.Body>

          <Card.Footer flexDirection="column" gap={4} px={6} pb={6} bg="var(--card-bg, #FFFFFF)">
            <Button
              type="submit"
              size="lg"
              w="full"
              fontWeight="bold"
              color="white"
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
              boxShadow="0 4px 14px rgba(8, 145, 178, 0.30)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(8, 145, 178, 0.40)",
              }}
              transition="all 0.2s"
            >
              {buttonText}
            </Button>

            <Box textAlign="center" w="full">
              <Text fontSize="sm" color="var(--text-muted, #64748B)">
                {linkText}？{" "}
                <Link href={linkHref} passHref>
                  <Text
                    as="span"
                    color="var(--teal, #0891B2)"
                    fontWeight="semibold"
                    _hover={{
                      color: "var(--teal-dark, #0E7490)",
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
    </Box>
  );
}
