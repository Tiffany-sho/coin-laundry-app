import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      bg="gray.900"
      color="gray.300"
      pt={12}
      zIndex="1300"
      position="relative"
    >
      <Stack alignItems="center">
        <Heading size="sm" color="white" mb={3}>
          サポート
        </Heading>
        <HStack alignItems="center" spacing={2} fontSize="sm">
          <Text as="a" href="#" _hover={{ color: "blue.400" }} cursor="pointer">
            お問い合わせ
          </Text>
          <Text as="a" href="#" _hover={{ color: "blue.400" }} cursor="pointer">
            FAQ
          </Text>
        </HStack>
      </Stack>
    </Box>
  );
};

export default Footer;
