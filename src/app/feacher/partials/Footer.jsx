import { Box, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";

const Footer = () => {
  return (
    <Box bg="gray.900" color="gray.300" zIndex="1200" position="relative" p={3}>
      <Box borderTop="1px" borderColor="gray.800" pt={2}>
        <HStack justify="center" gap={4} mb={1} flexWrap="wrap">
          <Link href="/terms">
            <Text fontSize="xs" color="gray.500" _hover={{ color: "gray.300" }} transition="color 0.2s">
              利用規約
            </Text>
          </Link>
          <Text fontSize="xs" color="gray.700">|</Text>
          <Link href="/tokushoho">
            <Text fontSize="xs" color="gray.500" _hover={{ color: "gray.300" }} transition="color 0.2s">
              特定商取引法に基づく表記
            </Text>
          </Link>
          <Text fontSize="xs" color="gray.700">|</Text>
          <Link href="/privacy">
            <Text fontSize="xs" color="gray.500" _hover={{ color: "gray.300" }} transition="color 0.2s">
              プライバシーポリシー
            </Text>
          </Link>
        </HStack>
        <Text textAlign="center" fontSize="xs" color="gray.600">
          &copy;Collecie 2025
        </Text>
      </Box>
    </Box>
  );
};

export default Footer;
