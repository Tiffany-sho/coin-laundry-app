"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Field,
  Input,
  Text,
  Flex,
  InputGroup,
  IconButton,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

export default function ChangePassword({ action }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="var(--app-bg, #F0F9FF)"
      p={{ base: 2, md: 4 }}
    >
      <Box w="full" maxW="28rem">
        <form>
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
                新しいパスワードを入力してください
              </Text>
            </Card.Header>

            <Card.Body p={{ base: 6, md: 8 }}>
              <Field.Root>
                <Field.Label
                  htmlFor="password"
                  fontSize="sm"
                  fontWeight="semibold"
                  color="var(--text-main, #1E3A5F)"
                  mb={2}
                >
                  新しいパスワード
                </Field.Label>
                <InputGroup
                  endElement={
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "パスワードを隠す" : "パスワードを表示"
                      }
                      color="var(--text-faint, #94A3B8)"
                      _hover={{
                        color: "var(--teal, #0891B2)",
                        bg: "transparent",
                      }}
                      _focus={{ outline: "none" }}
                    >
                      {showPassword ? (
                        <Icon.LuEyeOff size={20} />
                      ) : (
                        <Icon.LuEye size={20} />
                      )}
                    </IconButton>
                  }
                >
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="新しいパスワード"
                    required
                    border="1.5px solid"
                    borderColor="var(--divider, #F1F5F9)"
                    borderRadius="lg"
                    py={3}
                    px={4}
                    pr={12}
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
                </InputGroup>
              </Field.Root>
            </Card.Body>

            <Card.Footer p={{ base: 4, md: 6 }} pt={0}>
              <Button
                formAction={action}
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
                _active={{ transform: "translateY(0)" }}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                  transform: "none",
                }}
              >
                変更
              </Button>
            </Card.Footer>
          </Card.Root>
        </form>
      </Box>
    </Flex>
  );
}
