import { Box, Button, Flex, Heading, HStack } from "@chakra-ui/react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const Navbar = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      bg="gray.700"
      color="white"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      px={{ base: 4, md: 8 }}
      py={4}
    >
      <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
        <Heading
          as="h1"
          size={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          letterSpacing="tight"
        >
          <Link href="/">CoinLaundry</Link>
        </Heading>

        <HStack
          as="ul"
          listStyleType="none"
          spacing={{ base: 3, md: 6 }}
          fontWeight="semibold"
          fontSize={{ base: "sm", md: "md" }}
        >
          <Box as="li">
            <Link href="/coinLaundry" passHref>
              <Box
                as="span"
                display="block"
                px={4}
                py={2}
                borderRadius="md"
                transition="all 0.2s"
                _hover={{
                  bg: "whiteAlpha.200",
                  color: "blue.300",
                }}
                cursor="pointer"
              >
                My store
              </Box>
            </Link>
          </Box>

          {user && (
            <Box as="li">
              <Link href="/collectMoney" passHref>
                <Box
                  as="span"
                  display="block"
                  px={4}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                  _hover={{
                    bg: "whiteAlpha.200",
                    color: "blue.300",
                  }}
                  cursor="pointer"
                >
                  Collect money
                </Box>
              </Link>
            </Box>
          )}

          {user && (
            <Box as="li">
              <Link href="/account" passHref>
                <Box
                  as="span"
                  display="block"
                  px={4}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                  _hover={{
                    bg: "whiteAlpha.200",
                    color: "blue.300",
                  }}
                  cursor="pointer"
                >
                  My page
                </Box>
              </Link>
            </Box>
          )}

          {!user && (
            <Box as="li">
              <Link href="/auth/login" passHref>
                <Box
                  as="span"
                  display="block"
                  px={4}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                  _hover={{
                    bg: "whiteAlpha.200",
                    color: "blue.300",
                  }}
                  cursor="pointer"
                >
                  Sign in
                </Box>
              </Link>
            </Box>
          )}

          {!user && (
            <Box as="li">
              <Link href="/auth/signup" passHref>
                <Box
                  as="span"
                  display="block"
                  px={4}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                  border="1px solid"
                  _hover={{
                    bg: "whiteAlpha.200",
                    color: "blue.300",
                  }}
                  cursor="pointer"
                >
                  Sign up
                </Box>
              </Link>
            </Box>
          )}

          {user && (
            <Box as="li">
              <form action="/api/auth/logout" method="post">
                <Button
                  type="submit"
                  colorScheme="red"
                  variant="solid"
                  size="sm"
                  _hover={{
                    bg: "red.500",
                    color: "white",
                  }}
                >
                  Sign out
                </Button>
              </form>
            </Box>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
