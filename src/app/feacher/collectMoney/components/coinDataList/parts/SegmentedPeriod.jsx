"use client";

import { Box, HStack, Input, Slider, Text, VStack } from "@chakra-ui/react";
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
  return `${y}-${m}-${day}`;
};

const dateStrToEpoch = (str) => {
  const [y, m, d] = str.split("-").map(Number);
  return getEpochTimeInSeconds(y, m, d);
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

  const startVal = epochToSliderVal(startEpoch > 0 ? startEpoch : 0);
  const endVal = endEpoch === null ? MAX_MONTHS : epochToSliderVal(endEpoch);

  const startDateStr = startEpoch > 0 ? epochToDateStr(startEpoch) : "";
  const endDateStr =
    endEpoch !== null ? epochToDateStr(endEpoch) : epochToDateStr(todayEpoch());

  const handleSliderChange = ([newStart, newEnd]) => {
    setStartEpoch(sliderToStart(newStart));
    setEndEpoch(sliderToEnd(newEnd));
  };

  return (
    <Box w="100%" pt={1}>
      <VStack gap={4} align="stretch">
        {/* 日付インプット */}
        <HStack gap={2} align="center">
          <VStack gap={0} flex={1}>
            <Text fontSize="2xs" color="fg.muted" alignSelf="flex-start">
              開始日
            </Text>
            <Input
              type="date"
              size="sm"
              value={startDateStr}
              onChange={(e) => {
                if (e.target.value) {
                  setStartEpoch(dateStrToEpoch(e.target.value));
                } else {
                  setStartEpoch(0);
                }
              }}
            />
          </VStack>
          <Text color="fg.muted" pt={4}>
            〜
          </Text>
          <VStack gap={0} flex={1}>
            <Text fontSize="2xs" color="fg.muted" alignSelf="flex-start">
              終了日
            </Text>
            <Input
              type="date"
              size="sm"
              value={endDateStr}
              onChange={(e) => {
                if (e.target.value) {
                  // 選択日の翌日0時を上限（その日を含む）
                  setEndEpoch(dateStrToEpoch(e.target.value) + 86400000);
                } else {
                  setEndEpoch(null);
                }
              }}
            />
          </VStack>
        </HStack>

        {/* 範囲スライダー */}
        <Slider.Root
          min={0}
          max={MAX_MONTHS}
          step={1}
          value={[startVal, endVal]}
          onValueChange={(e) => handleSliderChange(e.value)}
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
