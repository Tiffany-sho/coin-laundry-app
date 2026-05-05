import { Box, Flex, Text, Button } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const CHART_HEIGHT = "300px";

const ChartError = ({
  message = "データの読み込みに失敗しました",
  onRetry,
}) => {
  return (
    <Box w="100%" h={CHART_HEIGHT} py={4} px={4}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100%"
        bg="red.50"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="red.200"
        p={6}
        gap={4}
        position="relative"
        overflow="hidden"
      >
        <Box
          animation="shake 0.5s ease-in-out"
          sx={{
            "@keyframes shake": {
              "0%, 100%": { transform: "translateX(0)" },
              "25%": { transform: "translateX(-8px)" },
              "75%": { transform: "translateX(8px)" },
            },
          }}
        >
          <Box
            w="64px"
            h="64px"
            borderRadius="full"
            bg="red.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <Box
              position="absolute"
              w="100%"
              h="100%"
              borderRadius="full"
              bg="red.200"
              animation="pulse 2s ease-in-out infinite"
              sx={{
                "@keyframes pulse": {
                  "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                  "50%": { transform: "scale(1.2)", opacity: 0 },
                },
              }}
            />
            <Icon.CiCircleAlert size={36} color="#DC2626" />
          </Box>
        </Box>

        <Box textAlign="center">
          <Text fontSize="md" fontWeight="bold" color="red.700" mb={1}>
            エラーが発生しました
          </Text>
          <Text fontSize="sm" color="red.500" lineHeight="1.6">
            {message}
          </Text>
        </Box>

        {onRetry && (
          <Button
            size="sm"
            bg="red.500"
            color="white"
            onClick={onRetry}
            _hover={{ bg: "red.600" }}
            gap={2}
            px={5}
            borderRadius="full"
            fontWeight="semibold"
          >
            <Icon.LuRefreshCw />
            再読み込み
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default ChartError;
