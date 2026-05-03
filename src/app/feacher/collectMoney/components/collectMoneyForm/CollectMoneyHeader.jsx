import { Box, HStack, Heading } from "@chakra-ui/react";
import ChangeStores from "./parts/ChangeStores";

const CollectMoneyHeader = ({ storeName }) => {
  return (
    <Box
      py={{ base: 4, md: 6 }}
      px={{ base: 4, md: 8 }}
      w="full"
      bg="white"
      position="fixed"
      top="0"
      zIndex="1400"
      borderBottomWidth="1px"
      borderBottomColor="var(--divider, #F1F5F9)"
      shadow="sm"
    >
      <HStack justify="space-between" maxW="1200px" mx="auto">
        <Heading
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="var(--text-main, #1E3A5F)"
        >
          {storeName}店
        </Heading>
        <ChangeStores />
      </HStack>
    </Box>
  );
};

export default CollectMoneyHeader;
