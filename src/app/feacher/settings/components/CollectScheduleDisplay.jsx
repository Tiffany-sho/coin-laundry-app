import { Box, Card, Heading, Text, HStack, Flex } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CollectScheduleDisplay({ schedule }) {
  const hasSchedule = schedule?.type && schedule?.days?.length > 0;

  const scheduleText = hasSchedule
    ? schedule.type === "weekly"
      ? `毎週 ${[...schedule.days].sort((a, b) => a - b).map((i) => WEEKDAYS[i]).join("・")}曜日`
      : `毎月 ${[...schedule.days].sort((a, b) => a - b).join("・")}日`
    : "設定なし";

  return (
    <Card.Root
      w="full"
      bg="var(--card-bg, #FFFFFF)"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      border="1px solid"
      borderColor="cyan.100"
    >
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack justify="space-between" mb={4}>
          <HStack gap={2}>
            <Box color="var(--teal)">
              <Icon.LuCalendarClock size={18} />
            </Box>
            <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
              集金スケジュール
            </Heading>
          </HStack>
          <Link href="/settings/collect-schedule/edit">
            <Button size="sm" variant="outline" colorPalette="cyan" borderRadius="full">
              <Icon.LuPencil size={13} />
              編集
            </Button>
          </Link>
        </HStack>

        <Flex
          align="center"
          gap={2}
          p={3}
          bg={hasSchedule ? "var(--teal-pale)" : "gray.50"}
          borderRadius="lg"
          border="1px solid"
          borderColor={hasSchedule ? "cyan.100" : "gray.200"}
        >
          <Box color={hasSchedule ? "var(--teal)" : "var(--text-faint)"} flexShrink={0}>
            <Icon.LuCalendarDays size={14} />
          </Box>
          <Text
            fontSize="sm"
            color={hasSchedule ? "var(--teal-deeper)" : "var(--text-faint)"}
            fontWeight={hasSchedule ? "medium" : "normal"}
          >
            {scheduleText}
          </Text>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
