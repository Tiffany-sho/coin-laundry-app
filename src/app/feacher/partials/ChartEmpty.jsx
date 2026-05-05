import { Box, Flex, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const CHART_HEIGHT = "300px";

const ChartEmpty = ({ message = "表示するデータがありません" }) => {
  return (
    <Box w="100%" h={CHART_HEIGHT} py={4} px={4}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100%"
        bg="gray.50"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        borderStyle="dashed"
        p={6}
        gap={4}
        position="relative"
        overflow="hidden"
      >
        <Box
          animation="float 3s ease-in-out infinite"
          sx={{
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-8px)" },
            },
          }}
        >
          <Box
            w="64px"
            h="64px"
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
                  "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                  "50%": { transform: "scale(1.3)", opacity: 0 },
                },
              }}
            />
            <Icon.VscGraphLine size={36} color="#94A3B8" />
          </Box>
        </Box>

        <Box textAlign="center">
          <Text fontSize="md" fontWeight="bold" color="gray.600" mb={1}>
            データがありません
          </Text>
          <Text fontSize="sm" color="gray.400" lineHeight="1.6">
            {message}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default ChartEmpty;
