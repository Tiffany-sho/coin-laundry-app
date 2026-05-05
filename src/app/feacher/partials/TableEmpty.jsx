import { Table, Flex, Text, Box } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const TableEmpty = ({
  message = "表示するデータがありません",
  columnCount = 3,
}) => {
  return (
    <Table.Root>
      <Table.Body>
        <Table.Row>
          <Table.Cell colSpan={columnCount} py={10}>
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap={4}
              animation="fadeIn 0.5s ease-in"
              sx={{
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(8px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
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
                  w="56px"
                  h="56px"
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
                  <Icon.LuInbox size={32} color="#94A3B8" />
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
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
};

export default TableEmpty;
