import { getMessage } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import TableEmpty from "@/app/feacher/partials/TableEmpty";
import { createNowData } from "@/functions/makeDate/date";
import { Table, Box, Badge, HStack, Text, Flex } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const Log = async ({ id }) => {
  const { data, error } = await getMessage(id);
  const { user } = await getUser();

  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      overflow="hidden"
      border="1px solid"
      borderColor="cyan.100"
    >
      <Box
        style={{ background: "linear-gradient(135deg, #0E7490 0%, #0891B2 55%, #06B6D4 100%)" }}
        color="white"
        p={4}
        borderBottom="1px solid rgba(8,145,178,0.2)"
      >
        <HStack gap={3}>
          <Flex
            w="40px"
            h="40px"
            bg="whiteAlpha.200"
            borderRadius="lg"
            align="center"
            justify="center"
          >
            <Icon.LuHistory size={24} />
          </Flex>
          <Box>
            <Text fontSize="lg" fontWeight="bold">
              アクションログ
            </Text>
            <Text fontSize="xs" color="whiteAlpha.800">
              {data.length}件の履歴
            </Text>
          </Box>
        </HStack>
      </Box>

      <Box overflowX="auto">
        <Table.Root size="sm" variant="line">
          <Table.Header bg="var(--teal-pale, #CFFAFE)">
            <Table.Row>
              <Table.ColumnHeader
                fontSize="xs"
                fontWeight="bold"
                color="var(--teal-deeper, #155E75)"
                textTransform="uppercase"
                py={3}
                px={4}
              >
                <HStack gap={2}>
                  <Icon.LuCalendar size={14} />
                  <Text>日付</Text>
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="xs"
                fontWeight="bold"
                color="var(--teal-deeper, #155E75)"
                textTransform="uppercase"
                py={3}
                px={4}
              >
                <HStack gap={2}>
                  <Icon.LuFileText size={14} />
                  <Text>内容</Text>
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="xs"
                fontWeight="bold"
                color="var(--teal-deeper, #155E75)"
                textTransform="uppercase"
                textAlign="end"
                py={3}
                px={4}
              >
                <HStack gap={2} justify="flex-end">
                  <Icon.LuUser size={14} />
                  <Text>ユーザ</Text>
                </HStack>
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          {data.length === 0 ? (
            <TableEmpty
              columnCount={3}
              message="まだアクションログがありません"
            />
          ) : (
            <Table.Body>
              {data.map((item, index) => (
                <Table.Row
                  key={item.id}
                  transition="all 0.2s"
                  _hover={{ bg: "cyan.50" }}
                  bg={index % 2 === 0 ? "white" : "var(--app-bg, #F0F9FF)"}
                >
                  <Table.Cell py={4} px={4}>
                    <HStack gap={2}>
                      <Box w="8px" h="8px" bg="var(--teal, #0891B2)" borderRadius="full" />
                      <Text fontSize="sm" color="var(--text-main, #1E3A5F)" fontWeight="medium">
                        {createNowData(item.date)}
                      </Text>
                    </HStack>
                  </Table.Cell>

                  <Table.Cell py={4} px={4}>
                    <Text fontSize="sm" color="var(--text-main, #1E3A5F)" lineHeight="1.5">
                      {item.message}
                    </Text>
                  </Table.Cell>

                  <Table.Cell textAlign="end" py={4} px={4}>
                    {item.user === user.id ? (
                      <Badge
                        bg="cyan.100"
                        color="var(--teal-deeper, #155E75)"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="semibold"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Icon.LuUserCheck size={12} />
                        あなた
                      </Badge>
                    ) : (
                      <Badge
                        bg="gray.100"
                        color="gray.700"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="semibold"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Icon.LuUsers size={12} />
                        他のユーザー
                      </Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          )}
        </Table.Root>
      </Box>

      {data.length > 0 && (
        <Box bg="var(--teal-pale, #CFFAFE)" p={3} borderTop="1px solid" borderColor="cyan.100">
          <Flex justify="space-between" align="center">
            <Text fontSize="xs" color="var(--teal-dark, #0E7490)">
              最新のアクションが上に表示されます
            </Text>
            <HStack gap={4}>
              <HStack gap={1}>
                <Box w="8px" h="8px" bg="var(--teal, #0891B2)" borderRadius="full" />
                <Text fontSize="xs" color="var(--teal-deeper, #155E75)">
                  アクティブ
                </Text>
              </HStack>
            </HStack>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default Log;
