import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      bg="gray.900"
      color="gray.300"
      py={2}
      zIndex="2000"
      position="relative"
    >
      <Box
        borderTop="1px"
        borderColor="gray.800"
        pt={8}
        textAlign="center"
        fontSize="sm"
        color="gray.500"
      >
        &copy;Collecie 2025
      </Box>
    </Box>
  );
};

export default Footer;
