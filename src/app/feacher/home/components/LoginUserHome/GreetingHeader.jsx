"use client";

import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useEffect, useState } from "react";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

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

// WMO weather code → emoji + label
const WMO = {
  0:  { icon: "☀️",  label: "快晴" },
  1:  { icon: "🌤️", label: "晴れ" },
  2:  { icon: "⛅",  label: "曇りがち" },
  3:  { icon: "☁️",  label: "曇り" },
  45: { icon: "🌫️", label: "霧" },
  48: { icon: "🌫️", label: "霧" },
  51: { icon: "🌦️", label: "霧雨" },
  53: { icon: "🌦️", label: "霧雨" },
  55: { icon: "🌦️", label: "霧雨" },
  61: { icon: "🌧️", label: "雨" },
  63: { icon: "🌧️", label: "雨" },
  65: { icon: "🌧️", label: "大雨" },
  71: { icon: "❄️",  label: "雪" },
  73: { icon: "❄️",  label: "雪" },
  75: { icon: "❄️",  label: "大雪" },
  80: { icon: "🌧️", label: "にわか雨" },
  81: { icon: "🌧️", label: "にわか雨" },
  95: { icon: "⛈️",  label: "雷雨" },
  96: { icon: "⛈️",  label: "雷雨" },
  99: { icon: "⛈️",  label: "雷雨" },
};

const wmoInfo = (code) => WMO[code] ?? { icon: "🌡️", label: "" };

// 土→青、日→赤
const DAY_COLOR = ["#EF4444", null, null, null, null, null, "#3B82F6"];

const GreetingHeader = ({ username = "集金担当者" }) => {
  const [greeting, setGreeting] = useState("");
  const [dateInfo, setDateInfo] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(getGreeting(hour));
    setDateInfo(getDateInfo());
  }, []);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&timezone=Asia%2FTokyo`
          );
          if (!res.ok) return;
          const json = await res.json();
          const { temperature_2m, weather_code } = json.current;
          setWeather({ temp: Math.round(temperature_2m), ...wmoInfo(weather_code) });
        } catch {
          // fetch失敗はサイレントに無視
        }
      },
      () => {},
      { timeout: 8000 }
    );
  }, []);

  const dayColor = dateInfo
    ? (DAY_COLOR[dateInfo.dayIndex] ?? "var(--text-muted, #64748B)")
    : "var(--text-muted, #64748B)";

  return (
    <HStack justify="space-between" align="start">
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

      {weather && (
        <Box
          bg="var(--card-bg, #FFFFFF)"
          border="1px solid"
          borderColor="cyan.100"
          borderRadius="xl"
          px={3}
          py={2}
          textAlign="center"
          flexShrink={0}
          minW="60px"
        >
          <Text fontSize="xl" lineHeight={1}>{weather.icon}</Text>
          <Text fontSize="xs" fontWeight="bold" color="var(--text-main, #1E3A5F)" mt={0.5}>
            {weather.temp}°C
          </Text>
          <Text fontSize="2xs" color="var(--text-muted, #64748B)">{weather.label}</Text>
        </Box>
      )}
    </HStack>
  );
};

export default GreetingHeader;
