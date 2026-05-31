"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Flex,
  Grid,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { updateCollectSchedule } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { toaster } from "@/components/ui/toaster";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const TYPE_OPTIONS = [
  { value: null, label: "設定なし" },
  { value: "weekly", label: "毎週" },
  { value: "monthly", label: "毎月" },
];

export default function CollectScheduleCard({ schedule: initialSchedule }) {
  const [type, setType] = useState(initialSchedule?.type ?? null);
  const [days, setDays] = useState(initialSchedule?.days ?? []);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleDay = (d) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setDays([]);
  };

  const handleSave = () => {
    startTransition(async () => {
      const schedule = type === null ? null : { type, days };
      const { error } = await updateCollectSchedule(schedule);
      if (error) {
        toaster.create({ title: error, type: "error" });
      } else {
        toaster.create({ title: "集金スケジュールを保存しました", type: "success" });
        router.push("/settings");
      }
    });
  };

  const hasChange = () => {
    if (type !== (initialSchedule?.type ?? null)) return true;
    if (type === null) return false;
    const sortedNew = [...days].sort((a, b) => a - b);
    const sortedOld = [...(initialSchedule?.days ?? [])].sort((a, b) => a - b);
    return JSON.stringify(sortedNew) !== JSON.stringify(sortedOld);
  };

  const isSaveDisabled = !hasChange() || (type !== null && days.length === 0);

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
        <HStack justify="space-between" mb={5}>
          <HStack gap={2}>
            <Box color="var(--teal)">
              <Icon.LuCalendarClock size={18} />
            </Box>
            <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
              集金スケジュール
            </Heading>
          </HStack>
          <Text fontSize="xs" color="var(--text-muted)">管理者のみ</Text>
        </HStack>

        <VStack align="stretch" gap={4}>
          {/* タイプ選択 */}
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)" mb={2}>
              集金サイクル
            </Text>
            <HStack gap={2}>
              {TYPE_OPTIONS.map((opt) => (
                <Button
                  key={String(opt.value)}
                  size="sm"
                  variant={type === opt.value ? "solid" : "outline"}
                  colorPalette={type === opt.value ? "cyan" : "gray"}
                  borderRadius="full"
                  onClick={() => handleTypeChange(opt.value)}
                  flex={1}
                  fontSize="xs"
                >
                  {opt.label}
                </Button>
              ))}
            </HStack>
          </Box>

          {/* 毎週：曜日選択 */}
          {type === "weekly" && (
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)" mb={2}>
                集金曜日（複数選択可）
              </Text>
              <HStack gap={1.5} flexWrap="wrap">
                {WEEKDAYS.map((label, i) => {
                  const isSelected = days.includes(i);
                  const isSun = i === 0;
                  const isSat = i === 6;
                  return (
                    <Button
                      key={i}
                      size="sm"
                      w="36px"
                      h="36px"
                      p={0}
                      borderRadius="full"
                      variant={isSelected ? "solid" : "outline"}
                      colorPalette={isSelected ? "cyan" : "gray"}
                      color={!isSelected ? (isSun ? "#EF4444" : isSat ? "#3B82F6" : undefined) : undefined}
                      onClick={() => toggleDay(i)}
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {label}
                    </Button>
                  );
                })}
              </HStack>
            </Box>
          )}

          {/* 毎月：日付選択 */}
          {type === "monthly" && (
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)" mb={2}>
                集金日（複数選択可）
              </Text>
              <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                {MONTH_DAYS.map((d) => {
                  const isSelected = days.includes(d);
                  return (
                    <Button
                      key={d}
                      size="xs"
                      h="32px"
                      p={0}
                      borderRadius="md"
                      variant={isSelected ? "solid" : "outline"}
                      colorPalette={isSelected ? "cyan" : "gray"}
                      onClick={() => toggleDay(d)}
                      fontSize="xs"
                    >
                      {d}
                    </Button>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* 選択中のスケジュール表示 */}
          {type !== null && days.length > 0 && (
            <Flex
              align="center"
              gap={2}
              p={3}
              bg="var(--teal-pale)"
              borderRadius="lg"
              border="1px solid"
              borderColor="cyan.100"
            >
              <Box color="var(--teal)" flexShrink={0}>
                <Icon.LuCalendarDays size={14} />
              </Box>
              <Text fontSize="xs" color="var(--teal-deeper)" fontWeight="medium">
                {type === "weekly"
                  ? `毎週 ${[...days].sort((a, b) => a - b).map((i) => WEEKDAYS[i]).join("・")}曜日`
                  : `毎月 ${[...days].sort((a, b) => a - b).join("・")}日`}
              </Text>
            </Flex>
          )}

          {/* 保存ボタン */}
          <Button
            colorPalette="cyan"
            borderRadius="full"
            size="md"
            fontWeight="semibold"
            onClick={handleSave}
            loading={isPending}
            disabled={isSaveDisabled}
          >
            <Icon.LuCheck />
            保存する
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
