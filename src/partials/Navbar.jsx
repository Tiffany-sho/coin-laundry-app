import { Box, Flex, Heading, HStack } from "@chakra-ui/react";
import Link from "next/link";

const Navbar = () => {
  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={10}
      bgColor="gray.700"
      color="white"
      boxShadow="md"
      px={8} // padding-left & padding-right (padding: 1rem 2rem; の2rem部分)
      py={4} // padding-top & padding-bottom (padding: 1rem 2rem; の1rem部分)
    >
      <Flex justify="space-between" align="center">
        <Heading as="h1" size="2xl" fontWeight="bold">
          <Link href="/">CoinLandry</Link>
        </Heading>

        <HStack
          as="ul"
          listStyleType="none"
          spacing={6}
          gap={6}
          fontWeight="bold"
        >
          <li>
            <Link href="/" passHref>
              Home
            </Link>
          </li>
          <li>
            <Link href="/coinLaundry" passHref>
              My Store
            </Link>
          </li>
          <li>
            <Link href="/" passHref>
              Collect Money
            </Link>
          </li>
          <li>
            <Link href="/" passHref>
              My Page
            </Link>
          </li>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
