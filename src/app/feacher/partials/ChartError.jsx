import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { BiErrorCircle } from "react-icons/bi";
import { LuRefreshCw } from "react-icons/lu";

const ChartError = ({
  message = "データの読み込みに失敗しました",
  onRetry,
}) => {
  return (
    <Box w="100%" h="400px" py={6} px={4}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100%"
        bg="red.50"
        borderRadius="xl"
        borderWidth="2px"
        borderColor="red.200"
        p={8}
        gap={6}
      >
        {/* エラーアイコン */}
        <Box
          position="relative"
          animation="shake 0.5s ease-in-out"
          sx={{
            "@keyframes shake": {
              "0%, 100%": { transform: "translateX(0)" },
              "25%": { transform: "translateX(-10px)" },
              "75%": { transform: "translateX(10px)" },
            },
          }}
        >
          <Box
            w="80px"
            h="80px"
            borderRadius="full"
            bg="red.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            {/* パルスエフェクト */}
            <Box
              position="absolute"
              w="100%"
              h="100%"
              borderRadius="full"
              bg="red.200"
              animation="pulse 2s ease-in-out infinite"
              sx={{
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    opacity: 0.5,
                  },
                  "50%": {
                    transform: "scale(1.2)",
                    opacity: 0,
                  },
                },
              }}
            />
            <BiErrorCircle size={48} color="#DC2626" />
          </Box>
        </Box>

        {/* エラーメッセージ */}
        <Box textAlign="center" maxW="400px">
          <Text fontSize="xl" fontWeight="bold" color="red.700" mb={2}>
            エラーが発生しました
          </Text>
          <Text fontSize="md" color="red.600" lineHeight="1.6">
            {message}
          </Text>
        </Box>

        {/* リトライボタン */}
        {onRetry && (
          <Button
            size="lg"
            bg="red.500"
            color="white"
            onClick={onRetry}
            _hover={{
              bg: "red.600",
              transform: "translateY(-2px)",
            }}
            transition="all 0.2s"
            gap={2}
            px={6}
            borderRadius="full"
            fontWeight="semibold"
          >
            <LuRefreshCw />
            再読み込み
          </Button>
        )}

        {/* 装飾的な要素 */}
        <Box
          position="absolute"
          top="20%"
          right="10%"
          w="40px"
          h="40px"
          borderRadius="full"
          bg="red.200"
          opacity={0.3}
          animation="float 3s ease-in-out infinite"
          sx={{
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-20px)" },
            },
          }}
        />
        <Box
          position="absolute"
          bottom="30%"
          left="15%"
          w="30px"
          h="30px"
          borderRadius="full"
          bg="red.200"
          opacity={0.2}
          animation="float 4s ease-in-out infinite"
          sx={{
            animationDelay: "1s",
          }}
        />
      </Flex>
    </Box>
  );
};

export default ChartError;
