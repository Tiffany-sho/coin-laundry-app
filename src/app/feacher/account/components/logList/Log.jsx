import Link from "next/link";
import {
  countActionMessages,
  getMessagesPage,
  getOrgMessagesPage,
} from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import TableEmpty from "@/app/feacher/partials/TableEmpty";
import { createNowData } from "@/functions/makeDate/date";
import { Table, Box, Badge, HStack, Text, Flex } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

/**
 * 1 ページの件数。
 *
 * ⚠️ **必ず範囲を切って引くこと。** 以前は全件を引いていたが、
 *    `.limit()` も `.range()` も無い select は **PostgREST の 1000 行上限で
 *    エラーも警告も出ないまま打ち切られる**（supabase/config.toml の max_rows）。
 *    アクションログは操作のたびに増えるので、必ず到達する。実際 2026-07-31 時点で
 *    既に 800 行あった。打ち切られても「古い履歴が消えた」ようにしか見えず、
 *    気づく手段が無い。
 */
const PAGE_SIZE = 50;

const Log = async ({ orgId, userId, currentUserId, page = 1 }) => {
  const current = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const offset = (current - 1) * PAGE_SIZE;

  const [result, total] = await Promise.all([
    orgId
      ? getOrgMessagesPage(orgId, offset, PAGE_SIZE)
      : getMessagesPage(userId, offset, PAGE_SIZE),
    // ⚠️ 件数は別に数える（head: true）。行を引き直すと上限を避けた意味が無い
    countActionMessages({ orgId, userId }),
  ]);

  const { data, error } = result;

  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const basePath = "/settings/log";

  return (
    <Box
      bg="var(--card-bg, #FFFFFF)"
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
            {/* ⚠️ 総数は count で数えた値。data.length を出すと 1 ページ分になる */}
            <Text fontSize="xs" color="whiteAlpha.800">
              {total}件の履歴
              {lastPage > 1 && `（${current} / ${lastPage} ページ）`}
            </Text>
          </Box>
        </HStack>
      </Box>

      <Box overflowX="auto">
        {data.length === 0 ? (
          /* ⚠️ 「1 件も無い」と「そのページに無い」を分ける。
                URL の page は手で書き換えられるので、範囲外を開いたときに
                「まだありません」と出すと履歴ごと消えたように見える */
          <TableEmpty
            columnCount={3}
            message={
              total > 0
                ? `このページには履歴がありません（全${total}件 / ${lastPage}ページ）`
                : "まだアクションログがありません"
            }
          />
        ) : (
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
                    {item.user === currentUserId ? (
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
                        {item.profiles?.username ||
                          item.profiles?.full_name ||
                          "他のユーザー"}
                      </Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
        </Table.Root>
        )}
      </Box>

      {data.length === 0 && total > 0 && (
        <Box bg="var(--teal-pale, #CFFAFE)" p={3} borderTop="1px solid" borderColor="cyan.100">
          <Flex justify="center">
            <PageLink href={`${basePath}?page=1`} label="最初のページへ" />
          </Flex>
        </Box>
      )}

      {data.length > 0 && (
        <Box bg="var(--teal-pale, #CFFAFE)" p={3} borderTop="1px solid" borderColor="cyan.100">
          <Flex justify="space-between" align="center" gap={3} wrap="wrap">
            <Text fontSize="xs" color="var(--teal-dark, #0E7490)">
              最新のアクションが上に表示されます
            </Text>

            {/* ページ送り。⚠️ Link にしてあるのはサーバーコンポーネントのままにするため
                （クライアント側の状態を持たせると、この画面だけ JS が要る） */}
            {lastPage > 1 && (
              <HStack gap={2}>
                <PageLink
                  href={`${basePath}?page=${current - 1}`}
                  disabled={current <= 1}
                  label="前へ"
                />
                <Text fontSize="xs" color="var(--teal-deeper, #155E75)" minW="60px" textAlign="center">
                  {current} / {lastPage}
                </Text>
                <PageLink
                  href={`${basePath}?page=${current + 1}`}
                  disabled={current >= lastPage}
                  label="次へ"
                />
              </HStack>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

/**
 * ページ送りの 1 ボタン。
 * ⚠️ 端では**リンクにしない**（押せそうに見えて何も起きないのを避ける）。
 */
const PageLink = ({ href, disabled, label }) => {
  const style = {
    fontSize: "12px",
    fontWeight: "bold",
    padding: "4px 12px",
    borderRadius: "999px",
    border: "1px solid var(--cyan-200, #A5F3FC)",
  };

  if (disabled) {
    return (
      <Box as="span" {...style} color="var(--text-faint, #94A3B8)" opacity={0.5}>
        {label}
      </Box>
    );
  }

  return (
    <Link href={href} style={{ ...style, color: "var(--teal-deeper, #155E75)" }}>
      {label}
    </Link>
  );
};

export default Log;
