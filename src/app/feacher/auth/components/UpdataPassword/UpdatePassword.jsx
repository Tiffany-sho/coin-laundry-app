import { Button, Card, Field, Input, Stack, Box } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";

export default function ChangePassword({ action }) {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <form>
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
            </Stack>
          </Card.Body>

          <Card.Footer flexDirection="column" gap={4} px={6} pb={6}>
            <Button
              variant="solid"
              colorScheme="blue"
              formAction={action}
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
              変更
            </Button>
          </Card.Footer>
        </Card.Root>
      </form>
    </Box>
  );
}
