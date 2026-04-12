import { Box, HStack, IconButton, Text, VStack, Heading } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const StockCounter = ({ label, value, onChange }) => {
  return (
    <Box p={4} borderRadius="lg" border="1px solid">
      <VStack align="stretch" gap={3}>
        <Heading size="sm" color="green.900">
          {label}
        </Heading>
        <HStack justify="center" gap={4}>
          <IconButton
            variant="solid"
            size="lg"
            bg="gray.600"
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
            minW="100px"
            textAlign="center"
          >
            <Text fontSize="3xl" fontWeight="bold" color="green.900">
              {value}
            </Text>
          </Box>
          <IconButton
            variant="solid"
            size="lg"
            bg="gray.600"
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
