"use client";

import { useState } from "react";
import {
  Box,
  Button,
  HStack,
  Popover,
  Portal,
  Slider,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuCalendar,
} from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import {
  changeEpocFromNowYearMonth,
  getEpochTimeInSeconds,
} from "@/functions/makeDate/date";

const EPOCH_OFFSET = 32400000;
const MAX_MONTHS = 60;

const epochToDateStr = (epoch) => {
  const d = new Date(epoch + EPOCH_OFFSET);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
};

const epochToSliderVal = (epoch) => {
  if (!epoch) return 0;
  const d = new Date(epoch + EPOCH_OFFSET);
  const now = new Date();
  const months =
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth());
  return Math.max(0, Math.min(MAX_MONTHS, MAX_MONTHS - months));
};

const sliderToStart = (val) => changeEpocFromNowYearMonth(val - MAX_MONTHS);

const sliderToEndDisplay = (val) => {
  const monthStart = new Date(sliderToStart(val) + EPOCH_OFFSET);
  const lastDay = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  );
  return getEpochTimeInSeconds(
    lastDay.getFullYear(),
    lastDay.getMonth() + 1,
    lastDay.getDate()
  );
};

const sliderToEnd = (val) =>
  val >= MAX_MONTHS ? null : changeEpocFromNowYearMonth(val - MAX_MONTHS + 1);

const todayEpoch = () => {
  const t = new Date();
  return getEpochTimeInSeconds(t.getFullYear(), t.getMonth() + 1, t.getDate());
};

const PeriodRangeSlider = () => {
  const { startEpoch, setStartEpoch, endEpoch, setEndEpoch } = useUploadPage();

  const appliedStartVal = epochToSliderVal(startEpoch > 0 ? startEpoch : 0);
  const appliedEndVal =
    endEpoch === null ? MAX_MONTHS : epochToSliderVal(endEpoch);

  const [draftVal, setDraftVal] = useState([appliedStartVal, appliedEndVal]);
  const [open, setOpen] = useState(false);

  const appliedStartStr =
    appliedStartVal > 0
      ? epochToDateStr(sliderToStart(appliedStartVal))
      : "全期間";
  const appliedEndStr =
    appliedEndVal < MAX_MONTHS
      ? epochToDateStr(sliderToEndDisplay(appliedEndVal))
      : epochToDateStr(todayEpoch());

  const draftStartStr =
    draftVal[0] > 0 ? epochToDateStr(sliderToStart(draftVal[0])) : "全期間";
  const draftEndStr =
    draftVal[1] < MAX_MONTHS
      ? epochToDateStr(sliderToEndDisplay(draftVal[1]))
      : epochToDateStr(todayEpoch());

  const handleOpenChange = (e) => {
    if (e.open) {
      setDraftVal([appliedStartVal, appliedEndVal]);
    }
    setOpen(e.open);
  };

  const handleApply = () => {
    setStartEpoch(sliderToStart(draftVal[0]));
    setEndEpoch(sliderToEnd(draftVal[1]));
    setOpen(false);
  };

  const shift = (direction) => {
    const span = draftVal[1] - draftVal[0];
    let newStart, newEnd;
    if (direction === "prev") {
      newStart = Math.max(0, draftVal[0] - span - 1);
      newEnd = newStart + span;
    } else {
      newEnd = Math.min(MAX_MONTHS, draftVal[1] + span + 1);
      newStart = newEnd - span;
    }
    setDraftVal([newStart, newEnd]);
  };

  const canGoPrev = draftVal[0] > 0;
  const canGoNext = draftVal[1] < MAX_MONTHS;

  return (
    <Box w="100%">
      <HStack justify="space-between" align="center">
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <Button size="sm" variant="subtle">
              <LuCalendar />
              期間設定
            </Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content minW="360px">
                <Popover.Arrow />
                <Popover.Body p={4}>
                  <VStack gap={4} align="stretch">
                    {/* シフトボタン＋ドラフト期間表示 */}
                    <HStack justify="space-between" align="center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => shift("prev")}
                        disabled={!canGoPrev}
                      >
                        <LuChevronLeft />
                        前の期間
                      </Button>

                      <HStack gap={1} align="flex-end">
                        <VStack gap={0} align="flex-start">
                          <Text fontSize="2xs" color="fg.muted">
                            開始日
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {draftStartStr}
                          </Text>
                        </VStack>
                        <Text color="fg.muted" pb="1px" lineHeight="1">
                          〜
                        </Text>
                        <VStack gap={0} align="flex-start">
                          <Text fontSize="2xs" color="fg.muted">
                            終了日
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {draftEndStr}
                          </Text>
                        </VStack>
                      </HStack>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => shift("next")}
                        disabled={!canGoNext}
                      >
                        次の期間
                        <LuChevronRight />
                      </Button>
                    </HStack>

                    {/* 範囲スライダー */}
                    <Slider.Root
                      min={0}
                      max={MAX_MONTHS}
                      step={1}
                      value={draftVal}
                      onValueChange={(e) => setDraftVal(e.value)}
                      colorPalette="cyan"
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

                    {/* アクションボタン */}
                    <HStack justify="flex-end" gap={2} pt={1}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                      >
                        キャンセル
                      </Button>
                      <Button
                        size="sm"
                        colorPalette="cyan"
                        onClick={handleApply}
                      >
                        適用
                      </Button>
                    </HStack>
                  </VStack>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>

        {/* 適用済み期間の表示 */}
        <HStack gap={1} align="flex-end">
          <Text fontSize="sm" fontWeight="semibold">
            {appliedStartStr}
          </Text>
          <Text color="fg.muted" lineHeight="1">
            〜
          </Text>
          <Text fontSize="sm" fontWeight="semibold">
            {appliedEndStr}
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
};

export default PeriodRangeSlider;
