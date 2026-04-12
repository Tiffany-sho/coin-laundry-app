"use client";

import { useState } from "react";
import { Box, HStack, Slider, Text, VStack } from "@chakra-ui/react";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import {
  changeEpocFromNowYearMonth,
  getEpochTimeInSeconds,
} from "@/functions/makeDate/date";

const EPOCH_OFFSET = 32400000;
// スライダーの全体範囲：60ヶ月（5年）
const MAX_MONTHS = 60;

/* ── epoch ↔ 日付文字列 ────────────────────── */
const epochToDateStr = (epoch) => {
  const d = new Date(epoch + EPOCH_OFFSET);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
};

/* ── epoch ↔ スライダー値（0 = 5年前、60 = 今月）── */
const epochToSliderVal = (epoch) => {
  if (!epoch) return 0;
  const d = new Date(epoch + EPOCH_OFFSET);
  const now = new Date();
  const months =
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth());
  return Math.max(0, Math.min(MAX_MONTHS, MAX_MONTHS - months));
};

// スライダー値 → startEpoch（月初）
const sliderToStart = (val) => changeEpocFromNowYearMonth(val - MAX_MONTHS);

// スライダー値 → endEpoch（翌月初を上限として使用、MAX_MONTHS のときは null = 上限なし）
const sliderToEnd = (val) =>
  val >= MAX_MONTHS ? null : changeEpocFromNowYearMonth(val - MAX_MONTHS + 1);

/* ── 今日の epoch ── */
const todayEpoch = () => {
  const t = new Date();
  return getEpochTimeInSeconds(t.getFullYear(), t.getMonth() + 1, t.getDate());
};

const PeriodRangeSlider = () => {
  const { startEpoch, setStartEpoch, endEpoch, setEndEpoch } = useUploadPage();

  const contextStartVal = epochToSliderVal(startEpoch > 0 ? startEpoch : 0);
  const contextEndVal = endEpoch === null ? MAX_MONTHS : epochToSliderVal(endEpoch);

  // ドラッグ中はローカル state で表示のみ更新（フェッチは走らせない）
  const [localVal, setLocalVal] = useState([contextStartVal, contextEndVal]);

  const startDateStr =
    localVal[0] > 0 ? epochToDateStr(sliderToStart(localVal[0])) : "全期間";
  const endDateStr =
    localVal[1] < MAX_MONTHS
      ? epochToDateStr(sliderToStart(localVal[1]))
      : epochToDateStr(todayEpoch());

  // ドラッグ終了時だけコンテキストを更新 → チャートのフェッチが走る
  const handleChangeEnd = ([newStart, newEnd]) => {
    setStartEpoch(sliderToStart(newStart));
    setEndEpoch(sliderToEnd(newEnd));
  };

  return (
    <Box w="100%" pt={1}>
      <VStack gap={4} align="stretch">
        {/* 選択中の期間表示 */}
        <HStack justify="space-between">
          <VStack gap={0} align="flex-start">
            <Text fontSize="2xs" color="fg.muted">開始日</Text>
            <Text fontSize="sm" fontWeight="semibold">{startDateStr}</Text>
          </VStack>
          <Text color="fg.muted">〜</Text>
          <VStack gap={0} align="flex-end">
            <Text fontSize="2xs" color="fg.muted">終了日</Text>
            <Text fontSize="sm" fontWeight="semibold">{endDateStr}</Text>
          </VStack>
        </HStack>

        {/* 範囲スライダー */}
        <Slider.Root
          min={0}
          max={MAX_MONTHS}
          step={1}
          value={localVal}
          onValueChange={(e) => setLocalVal(e.value)}
          onValueChangeEnd={(e) => handleChangeEnd(e.value)}
          colorPalette="blue"
        >
          <HStack justify="space-between" mb={1}>
            <Text fontSize="2xs" color="fg.muted">
              5年前
            </Text>
            <Text fontSize="2xs" color="fg.muted">
              今月
            </Text>
          </HStack>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
            <Slider.Thumb index={1} />
          </Slider.Control>
        </Slider.Root>
      </VStack>
    </Box>
  );
};

export default PeriodRangeSlider;
