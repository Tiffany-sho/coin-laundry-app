import { Box, Button, HStack, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const DraftBanner = ({ savedAt, onRestore, onDiscard }) => {
  const savedTime = savedAt
    ? new Date(savedAt).toLocaleString("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Box
      p={4}
      bg="amber.50"
      borderWidth="1px"
      borderColor="amber.300"
      borderRadius="xl"
      shadow="sm"
    >
      <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={3}>
        <HStack gap={2}>
          <Icon.LuCalendar size={18} color="amber.600" />
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="amber.800">
              一時保存データがあります
            </Text>
            {savedTime && (
              <Text fontSize="xs" color="amber.600">
                保存日時: {savedTime}
              </Text>
            )}
          </Box>
        </HStack>

        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            borderColor="amber.400"
            color="amber.700"
            bg="white"
            borderRadius="lg"
            fontWeight="semibold"
            onClick={onDiscard}
            _hover={{ bg: "amber.50", borderColor: "amber.500" }}
          >
            削除
          </Button>
          <Button
            size="sm"
            bg="amber.500"
            color="white"
            borderRadius="lg"
            fontWeight="semibold"
            onClick={onRestore}
            _hover={{ bg: "amber.600" }}
          >
            復元する
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default DraftBanner;
