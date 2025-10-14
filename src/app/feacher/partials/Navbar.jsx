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
      px={8}
      py={4}
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
            <Link href="/coinLaundry" passHref>
              My Store
            </Link>
          </li>
          <li>
            <Link href="/collectMoney" passHref>
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
