import { Box, Flex, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const ChartEmpty = ({ message = "表示するデータがありません" }) => {
  return (
    <Box w="100%" h="400px" py={6} px={4}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100%"
        bg="gray.50"
        borderRadius="xl"
        borderWidth="2px"
        borderColor="gray.200"
        borderStyle="dashed"
        p={8}
        gap={6}
      >
        <Box
          position="relative"
          animation="float 3s ease-in-out infinite"
          sx={{
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-10px)" },
            },
          }}
        >
          <Box
            w="80px"
            h="80px"
            borderRadius="full"
            bg="gray.100"
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
              bg="gray.200"
              animation="pulse 2s ease-in-out infinite"
              sx={{
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    opacity: 0.5,
                  },
                  "50%": {
                    transform: "scale(1.3)",
                    opacity: 0,
                  },
                },
              }}
            />
            <Icon.VscGraphLine size={48} color="#6B7280" />
          </Box>
        </Box>

        <Box textAlign="center" maxW="400px">
          <Text fontSize="xl" fontWeight="bold" color="gray.700" mb={2}>
            データがありません
          </Text>
          <Text fontSize="md" color="gray.500" lineHeight="1.6">
            {message}
          </Text>
        </Box>

        {/* 装飾用の浮遊要素 */}
        <Box
          position="absolute"
          top="15%"
          right="15%"
          w="40px"
          h="40px"
          borderRadius="full"
          bg="gray.200"
          opacity={0.3}
          animation="float 4s ease-in-out infinite"
          sx={{
            animationDelay: "0.5s",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-10px)" },
            },
          }}
        />
        <Box
          position="absolute"
          bottom="20%"
          left="20%"
          w="30px"
          h="30px"
          borderRadius="full"
          bg="gray.200"
          opacity={0.2}
          animation="float 5s ease-in-out infinite"
          sx={{
            animationDelay: "1.5s",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-10px)" },
            },
          }}
        />
      </Flex>
    </Box>
  );
};

export default ChartEmpty;
