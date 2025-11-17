import { Box } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box bg="gray.900" color="gray.300" zIndex="2000" position="relative" p={2}>
      <Box
        borderTop="1px"
        borderColor="gray.800"
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
