"use client";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useEffect, useState } from "react";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const DAY_COLOR = ["#EF4444", null, null, null, null, null, "#3B82F6"];

const getGreeting = (hour) => {
  if (hour < 11) return "おはようございます";
  if (hour < 17) return "こんにちは";
  return "こんばんは";
};

const getDateInfo = () => {
  const today = new Date(new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    date: today.getDate(),
    dayIndex: today.getDay(),
    day: DAYS[today.getDay()],
  };
};

const GreetingHeader = ({ username = "集金担当者" }) => {
  const [greeting, setGreeting] = useState("");
  const [dateInfo, setDateInfo] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(getGreeting(hour));
    setDateInfo(getDateInfo());
  }, []);

  const dayColor = dateInfo
    ? (DAY_COLOR[dateInfo.dayIndex] ?? "var(--text-muted, #64748B)")
    : "var(--text-muted, #64748B)";

  return (
    <Box>
      <Heading size={{ base: "lg", md: "xl" }} color="var(--text-main, #1E3A5F)" mb={1}>
        {greeting}、{username}さん
      </Heading>
      {dateInfo && (
        <HStack gap={1} align="center">
          <Box color="var(--teal, #0891B2)">
            <Icon.LuCalendar size={14} />
          </Box>
          <Text fontSize={{ base: "sm", md: "md" }} color="var(--text-muted, #64748B)">
            {dateInfo.year}年{dateInfo.month}月{dateInfo.date}日
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="bold"
            color={dayColor}
          >
            （{dateInfo.day}）
          </Text>
        </HStack>
      )}
    </Box>
  );
};

export default GreetingHeader;
