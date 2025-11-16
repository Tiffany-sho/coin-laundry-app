import { Box, Flex, Text } from "@chakra-ui/react";
import { TbCoinYenFilled } from "@/app/feacher/Icon";

const PageLoading = () => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="gray.100"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        direction="column"
        align="center"
        gap={6}
        p={8}
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        maxW="400px"
        w="90%"
      >
        <Box
          position="relative"
          w="80px"
          h="80px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            position="absolute"
            w="full"
            h="full"
            borderWidth="4px"
            borderColor="teal.200"
            borderTopColor="teal.500"
            borderRadius="full"
            animation="spin 1s linear infinite"
            sx={{
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />

          <Box
            color="teal.500"
            fontSize="40px"
            animation="pulse 1.5s ease-in-out infinite"
            sx={{
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.7, transform: "scale(0.95)" },
              },
            }}
          >
            <TbCoinYenFilled />
          </Box>
        </Box>

        {/* テキスト */}
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={2}>
            読み込み中...
          </Text>
          <Text fontSize="sm" color="gray.500">
            データを取得しています
          </Text>
        </Box>

        <Flex gap={2}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="8px"
              h="8px"
              bg="teal.500"
              borderRadius="full"
              animation={`bounce 1.4s ease-in-out ${i * 0.2}s infinite`}
              sx={{
                "@keyframes bounce": {
                  "0%, 80%, 100%": { transform: "scale(0)" },
                  "40%": { transform: "scale(1)" },
                },
              }}
            />
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export default PageLoading;
