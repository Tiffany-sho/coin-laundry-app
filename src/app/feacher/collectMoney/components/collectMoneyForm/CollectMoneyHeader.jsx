import { Box, HStack, VStack, Heading, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import ChangeStores from "./parts/ChangeStores";

const CollectMoneyHeader = ({ storeName }) => {
  return (
    <Box
      py={{ base: 3, md: 4 }}
      px={{ base: 4, md: 8 }}
      w="full"
      bg="var(--card-bg, #FFFFFF)"
      position="fixed"
      top="0"
      zIndex="1400"
      borderBottomWidth="1px"
      borderBottomColor="var(--divider, #F1F5F9)"
      shadow="sm"
    >
      <HStack justify="space-between" maxW="1200px" mx="auto">
        <HStack gap={3}>
          <Box
            style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
            color="white"
            borderRadius="xl"
            p={2}
          >
            <Icon.PiHandCoinsLight size={22} />
          </Box>
          <VStack align="start" gap={0}>
            <Heading
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              color="var(--teal-deeper, #155E75)"
            >
              {storeName}店
            </Heading>
            <Text fontSize="xs" color="var(--text-muted, #64748B)">集金中</Text>
          </VStack>
        </HStack>
        <ChangeStores />
      </HStack>
    </Box>
  );
};

export default CollectMoneyHeader;
