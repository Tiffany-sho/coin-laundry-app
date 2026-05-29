import { Box, VStack, Heading, Text, Table } from "@chakra-ui/react";

export const metadata = {
  title: "特定商取引法に基づく表記 | Collecie",
};

const rows = [
  { label: "販売業者", value: "上田 将生" },
  { label: "所在地", value: "滋賀県野洲市" },
  { label: "電話番号", value: "090-1277-1729" },
  { label: "メールアドレス", value: "mituya1884tansan@gmail.com" },
  { label: "サービス名", value: "Collecie（コインランドリー集金管理サービス）" },
  {
    label: "販売価格",
    value: "Proプラン：¥780/月（税込）\nMaxプラン：¥2,980/月（税込）",
  },
  { label: "支払い方法", value: "クレジットカード（Visa / Mastercard / American Express 等）" },
  { label: "支払い時期", value: "ご契約月より毎月自動引き落とし" },
  { label: "サービス提供時期", value: "決済完了後、即時ご利用いただけます" },
  {
    label: "返品・返金について",
    value:
      "月額サービスの性質上、原則として返金は行いません。ただし、決済完了後7日以内にメール（mituya1884tansan@gmail.com）にてご申請いただいた場合に限り、返金対応いたします。",
  },
  {
    label: "解約について",
    value:
      "マイページの「プランを管理する」からいつでも解約できます。解約後も当月末まではサービスをご利用いただけます。",
  },
  { label: "動作環境", value: "最新版のChrome / Safari / Edge（スマートフォン・PCブラウザ）" },
];

export default function TokushohoPage() {
  return (
    <Box maxW="800px" mx="auto" p={{ base: 4, md: 8 }} pb={16}>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading
            as="h1"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="var(--teal-deeper)"
            mb={2}
          >
            特定商取引法に基づく表記
          </Heading>
          <Text fontSize="sm" color="var(--text-muted)">
            特定商取引に関する法律第11条に基づき、以下の事項を表示します。
          </Text>
        </Box>

        <Box
          bg="var(--card-bg, #FFFFFF)"
          borderRadius="xl"
          boxShadow="var(--shadow-sm)"
          border="1px solid"
          borderColor="cyan.100"
          overflow="hidden"
        >
          <Table.Root>
            <Table.Body>
              {rows.map(({ label, value }) => (
                <Table.Row key={label}>
                  <Table.Cell
                    w={{ base: "120px", md: "200px" }}
                    fontWeight="semibold"
                    fontSize="sm"
                    color="var(--text-main)"
                    bg="var(--app-bg, #F0F9FF)"
                    verticalAlign="top"
                    borderColor="var(--divider)"
                    py={4}
                    px={4}
                    whiteSpace="nowrap"
                  >
                    {label}
                  </Table.Cell>
                  <Table.Cell
                    fontSize="sm"
                    color="var(--text-muted)"
                    borderColor="var(--divider)"
                    py={4}
                    px={4}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {value}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <Text fontSize="xs" color="var(--text-faint)" textAlign="right">
          最終更新日：2026年5月29日
        </Text>
      </VStack>
    </Box>
  );
}
