"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Portal,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { getEpochTimeInSeconds } from "@/date";

export default function EpochTimeSelector({
  epoc,
  setEpoc,
  submitFunc = () => {},
}) {
  const date = new Date(epoc);
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [day, setDay] = useState(date.getDate());
  const [isEditing, setIsEditing] = useState(false);

  // コレクションの作成
  const years = createListCollection({
    items: Array.from({ length: 61 }, (_, i) => {
      const y = date.getFullYear() - 50 + i;
      return { label: `${y}`, value: y.toString() };
    }),
  });

  const months = createListCollection({
    items: Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      return { label: `${m}`, value: m.toString() };
    }),
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = createListCollection({
    items: Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return { label: `${d}`, value: d.toString() };
    }),
  });

  const selectedDate = new Date(year, month - 1, day);

  const formatDate = (date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const clickHandler = () => {
    setIsEditing(false);
    const epocTime = getEpochTimeInSeconds(year, month, day);
    setEpoc(epocTime);
    submitFunc(epocTime);
  };

  return (
    <Box>
      {!isEditing ? (
        <Box
          onClick={() => setIsEditing(true)}
          cursor="pointer"
          borderRadius="xl"
          p={2}
          transition="all 0.2s"
          _hover={{ bg: "gray.50" }}
        >
          <Text fontSize="md" fontWeight="bold">
            {formatDate(selectedDate)}
          </Text>
          <Text fontSize="sm" opacity={0.75} mt={2}>
            クリックして変更
          </Text>
        </Box>
      ) : (
        <Box bg="gray.50" borderRadius="xl" p={6}>
          <Text fontSize="sm" color="gray.600" mb={3}>
            日付を選択
          </Text>

          <HStack gap={3} mb={4} flexDirection={{ base: "column", md: "row" }}>
            <Select.Root
              collection={years}
              value={[year.toString()]}
              onValueChange={(e) => setYear(Number(e.value[0]))}
              size="md"
              width="full"
            >
              <Select.Label>年</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content maxH="300px">
                    {years.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            <Select.Root
              collection={months}
              value={[month.toString()]}
              onValueChange={(e) => setMonth(Number(e.value[0]))}
              size="md"
              width="full"
            >
              <Select.Label>月</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content maxH="300px">
                    {months.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            {/* 日の選択 */}
            <Select.Root
              collection={days}
              value={[day.toString()]}
              onValueChange={(e) => setDay(Number(e.value[0]))}
              size="md"
              width="full"
            >
              <Select.Label>日</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content maxH="300px">
                    {days.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </HStack>

          <Button
            onClick={clickHandler}
            width="full"
            bg="black"
            color="white"
            borderRadius="md"
            _hover={{ bg: "gray.800" }}
            _active={{ bg: "gray.900" }}
          >
            確定
          </Button>
        </Box>
      )}
    </Box>
  );
}
