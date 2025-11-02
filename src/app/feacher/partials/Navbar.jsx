import { Box, Flex, Heading, HStack } from "@chakra-ui/react";
import Link from "next/link";

const Navbar = () => {
  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      bgGradient="linear(to-r, gray.700, gray.800)"
      color="white"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      px={{ base: 4, md: 8 }}
      py={4}
      borderBottom="2px solid"
      bg="gray.600"
    >
      <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
        <Heading
          as="h1"
          size={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          letterSpacing="tight"
          transition="all 0.2s"
          _hover={{
            transform: "scale(1.05)",
            color: "blue.300",
          }}
        >
          <Link href="/">CoinLaundry</Link>
        </Heading>

        <HStack
          as="ul"
          listStyleType="none"
          spacing={{ base: 3, md: 6 }}
          gap={{ base: 3, md: 6 }}
          fontWeight="semibold"
          fontSize={{ base: "sm", md: "md" }}
        >
          <Box
            as="li"
            px={4}
            py={2}
            borderRadius="md"
            transition="all 0.2s"
            _hover={{
              bg: "whiteAlpha.200",
              transform: "translateY(-2px)",
              color: "blue.300",
            }}
            cursor="pointer"
          >
            <Link href="/coinLaundry" passHref>
              My Store
            </Link>
          </Box>
          <Box
            as="li"
            px={4}
            py={2}
            borderRadius="md"
            transition="all 0.2s"
            _hover={{
              bg: "whiteAlpha.200",
              transform: "translateY(-2px)",
              color: "blue.300",
            }}
            cursor="pointer"
          >
            <Link href="/collectMoney" passHref>
              Collect Money
            </Link>
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
