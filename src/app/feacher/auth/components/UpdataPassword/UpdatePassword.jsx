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
      bg="gray.50"
      p={{ base: 2, md: 4 }}
    >
      <Box w="full" maxW="28rem">
        <form>
          <Card.Root
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.200"
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
                新しいパスワードを入力してください
              </Text>
            </Card.Header>

            <Card.Body p={{ base: 6, md: 8 }}>
              <Field.Root>
                <Field.Label
                  htmlFor="password"
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.700"
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
                      color="gray.500"
                      _hover={{
                        color: "gray.700",
                        bg: "transparent",
                      }}
                      _focus={{
                        outline: "none",
                      }}
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
                    border="2px solid"
                    borderColor="gray.400"
                    borderRadius="lg"
                    py={3}
                    px={4}
                    pr={12}
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
                変更
              </Button>
            </Card.Footer>
          </Card.Root>
        </form>
      </Box>
    </Flex>
  );
}
