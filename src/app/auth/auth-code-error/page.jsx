import { Card, Box, Button, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function AuthCodeError() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <Card.Root maxW="md" w="full" boxShadow="xl" borderRadius="xl">
        <Card.Header bg="red.500" color="white" py={6} textAlign="center">
          <Card.Title fontSize="2xl" fontWeight="bold">
            認証エラー
          </Card.Title>
        </Card.Header>

        <Card.Body py={8} px={6} textAlign="center">
          <Text mb={4}>認証リンクが無効または期限切れです。</Text>
          <Text fontSize="sm" color="gray.600">
            もう一度パスワードリセットを行ってください。
          </Text>
        </Card.Body>

        <Card.Footer px={6} pb={6}>
          <Button
            as={Link}
            href="/auth/login"
            colorScheme="blue"
            w="full"
            size="lg"
          >
            ログインページに戻る
          </Button>
        </Card.Footer>
      </Card.Root>
    </Box>
  );
}
