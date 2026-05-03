"use client";

import { HStack, Heading, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useEffect, useState } from "react";

const getGreeting = (hour) => {
  if (hour < 11) return "おはようございます";
  if (hour < 17) return "こんにちは";
  return "こんばんは";
};

const getCurrentDate = () => {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const today = new Date(
    new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
  );
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const day = days[today.getDay()];
  return `${year}年${month}月${date}日（${day}）`;
};

const GreetingHeader = ({ username = "集金担当者" }) => {
  const [greeting, setGreeting] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(getGreeting(hour));
    setDateStr(getCurrentDate());
  }, []);

  return (
    <>
      <Heading size={{ base: "lg", md: "xl" }} color="var(--text-main, #1E3A5F)" mb={1}>
        {greeting}、{username}さん
      </Heading>
      <HStack gap={2} color="var(--text-muted, #64748B)">
        <Icon.LuCalendar size={16} />
        <Text fontSize={{ base: "sm", md: "md" }}>{dateStr}</Text>
      </HStack>
    </>
  );
};

export default GreetingHeader;
