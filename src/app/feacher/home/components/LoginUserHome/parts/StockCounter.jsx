import { Box, HStack, IconButton, Text, VStack, Heading } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const StockCounter = ({ label, value, onChange }) => {
  return (
    <Box
      p={4}
      borderRadius="14px"
      border="2px solid"
      borderColor="var(--divider, #F1F5F9)"
      bg="var(--app-bg, #F0F9FF)"
    >
      <VStack align="stretch" gap={3}>
        <Heading size="sm" color="var(--text-main, #1E3A5F)">
          {label}
        </Heading>
        <HStack justify="center" gap={4}>
          <IconButton
            variant="solid"
            size="lg"
            style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
            color="white"
            onClick={() => onChange(Math.max(0, value - 1))}
            disabled={value <= 0}
            borderRadius="full"
          >
            <Icon.LuMinus />
          </IconButton>
          <Box
            bg="white"
            px={8}
            py={4}
            borderRadius="lg"
            border="2px solid"
            borderColor="var(--divider, #F1F5F9)"
            minW="100px"
            textAlign="center"
          >
            <Text fontSize="3xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
              {value}
            </Text>
          </Box>
          <IconButton
            variant="solid"
            size="lg"
            style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
            color="white"
            onClick={() => onChange(value + 1)}
            borderRadius="full"
          >
            <Icon.LuPlus />
          </IconButton>
        </HStack>
      </VStack>
    </Box>
  );
};

export default StockCounter;
