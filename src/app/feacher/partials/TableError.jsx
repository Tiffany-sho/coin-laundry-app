import { Table, Flex, Text, Button, Box } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const TableError = ({
  message = "データの読み込みに失敗しました",
  columnCount = 3,
  onRetry,
}) => {
  return (
    <Table.Body>
      <Table.Row>
        <Table.Cell colSpan={columnCount} py={12} bg="red.50">
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap={5}
            animation="fadeIn 0.5s ease-in"
            sx={{
              "@keyframes fadeIn": {
                "0%": { opacity: 0, transform: "translateY(10px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Box
              position="relative"
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
                w="60px"
                h="60px"
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
                <Icon.CiCircleAlert size={36} color="#DC2626" />
              </Box>
            </Box>

            <Box textAlign="center" maxW="500px" px={4}>
              <Text fontSize="lg" fontWeight="bold" color="red.700" mb={2}>
                エラーが発生しました
              </Text>
              <Text fontSize="sm" color="red.600" lineHeight="1.6">
                {message}
              </Text>
            </Box>

            {onRetry && (
              <Button
                size="md"
                bg="red.500"
                color="white"
                onClick={onRetry}
                _hover={{
                  bg: "red.600",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s"
                gap={2}
                px={5}
                borderRadius="full"
                fontWeight="semibold"
                mt={2}
              >
                <Icon.LuRefreshCw />
                再読み込み
              </Button>
            )}
          </Flex>
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  );
};

export default TableError;
