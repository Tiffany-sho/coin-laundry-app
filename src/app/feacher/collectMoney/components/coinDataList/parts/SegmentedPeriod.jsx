"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
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
  LuSlidersHorizontal,
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
  const {
    startEpoch, setStartEpoch,
    endEpoch, setEndEpoch,
    storeNames,
    selectedStores, setSelectedStores,
  } = useUploadPage();

  const appliedStartVal = epochToSliderVal(startEpoch > 0 ? startEpoch : 0);
  const appliedEndVal =
    endEpoch === null ? MAX_MONTHS : epochToSliderVal(endEpoch);

  const [draftVal, setDraftVal] = useState([appliedStartVal, appliedEndVal]);
  const [draftStores, setDraftStores] = useState([]);
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
      setDraftStores(
        selectedStores.length > 0 ? [...selectedStores] : [...storeNames]
      );
    }
    setOpen(e.open);
  };

  const toggleStore = (name) => {
    setDraftStores((prev) => {
      if (prev.includes(name)) {
        if (prev.length <= 1) return prev; // 最後の1店舗は外せない
        return prev.filter((n) => n !== name);
      }
      return [...prev, name];
    });
  };

  const selectAll = () => setDraftStores([...storeNames]);

  const handleApply = () => {
    setStartEpoch(sliderToStart(draftVal[0]));
    setEndEpoch(sliderToEnd(draftVal[1]));
    // 全店舗選択 or 空 → フィルタ解除
    setSelectedStores(
      draftStores.length === 0 || draftStores.length === storeNames.length
        ? []
        : draftStores
    );
    setOpen(false);
  };

  // endEpoch のエポック往復変換で +1 のズレが生じるため effectiveEndVal で補正する
  const shiftApplied = (direction) => {
    const effectiveEndVal = endEpoch === null ? MAX_MONTHS : appliedEndVal - 1;
    const span = effectiveEndVal - appliedStartVal;
    let newStart, newEnd;
    if (direction === "prev") {
      newStart = Math.max(0, appliedStartVal - span);
      newEnd = newStart + span;
    } else {
      newEnd = Math.min(MAX_MONTHS, effectiveEndVal + span);
      newStart = newEnd - span;
    }
    setStartEpoch(sliderToStart(newStart));
    setEndEpoch(sliderToEnd(newEnd));
  };

  const canGoPrev = appliedStartVal > 0;
  const canGoNext = appliedEndVal < MAX_MONTHS;
  const isFilterActive = selectedStores.length > 0;
  const allDraftSelected = draftStores.length === storeNames.length;

  return (
    <Box w="100%">
      {/* 1行目：絞り込みボタン＋適用済み期間テキスト */}
      <HStack justify="center" align="center" gap={2} mb={2} flexWrap="wrap">
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <Button size="sm" variant="subtle" position="relative">
              <LuSlidersHorizontal />
              絞り込み
              {isFilterActive && (
                <Box
                  as="span"
                  position="absolute"
                  top="4px"
                  right="4px"
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg="cyan.500"
                />
              )}
            </Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content minW={{ base: "calc(100vw - 32px)", sm: "360px" }}>
                <Popover.Arrow />
                <Popover.Body p={4}>
                  <VStack gap={4} align="stretch">
                    {/* 期間セクション */}
                    <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)" letterSpacing="0.05em">
                      期間
                    </Text>

                    <HStack justify="center" gap={1} align="flex-end">
                      <VStack gap={0} align="flex-start">
                        <Text fontSize="2xs" color="var(--text-muted)">
                          開始日
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {draftStartStr}
                        </Text>
                      </VStack>
                      <Text color="var(--text-muted)" pb="1px" lineHeight="1">
                        〜
                      </Text>
                      <VStack gap={0} align="flex-start">
                        <Text fontSize="2xs" color="var(--text-muted)">
                          終了日
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {draftEndStr}
                        </Text>
                      </VStack>
                    </HStack>

                    <Slider.Root
                      min={0}
                      max={MAX_MONTHS}
                      step={1}
                      value={draftVal}
                      onValueChange={(e) => setDraftVal(e.value)}
                      colorPalette="cyan"
                    >
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="2xs" color="var(--text-muted)">
                          5年前
                        </Text>
                        <Text fontSize="2xs" color="var(--text-muted)">
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

                    {/* 表示店舗セクション（データがある場合のみ） */}
                    {storeNames.length > 0 && (
                      <>
                        <Box borderTop="1px solid" borderColor="var(--divider)" />
                        <VStack gap={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)" letterSpacing="0.05em">
                              表示店舗
                            </Text>
                            {!allDraftSelected && (
                              <Text
                                fontSize="xs"
                                color="cyan.600"
                                cursor="pointer"
                                onClick={selectAll}
                                _hover={{ textDecoration: "underline" }}
                              >
                                全て選択
                              </Text>
                            )}
                          </HStack>
                          <Flex gap={2} flexWrap="wrap">
                            {storeNames.map((name) => {
                              const isSelected = draftStores.includes(name);
                              return (
                                <Box
                                  key={name}
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                  fontSize="xs"
                                  cursor="pointer"
                                  border="1.5px solid"
                                  bg={isSelected ? "cyan.50" : "transparent"}
                                  borderColor={isSelected ? "cyan.400" : "gray.200"}
                                  color={isSelected ? "cyan.700" : "var(--text-muted)"}
                                  onClick={() => toggleStore(name)}
                                  transition="all 0.15s"
                                  maxW="120px"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                  userSelect="none"
                                >
                                  {name}
                                </Box>
                              );
                            })}
                          </Flex>
                        </VStack>
                      </>
                    )}

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
          <Text color="var(--text-muted)" lineHeight="1">
            〜
          </Text>
          <Text fontSize="sm" fontWeight="semibold">
            {appliedEndStr}
          </Text>
        </HStack>

        {/* 店舗フィルター中の表示 */}
        {isFilterActive && (
          <Text fontSize="xs" color="cyan.600">
            {selectedStores.length}店舗表示中
          </Text>
        )}
      </HStack>

      {/* 2行目：シフトボタン */}
      <HStack justify="space-between" align="center">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => shiftApplied("prev")}
          disabled={!canGoPrev}
        >
          <LuChevronLeft />
          <Text hideBelow="sm">前の期間</Text>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => shiftApplied("next")}
          disabled={!canGoNext}
        >
          <Text hideBelow="sm">次の期間</Text>
          <LuChevronRight />
        </Button>
      </HStack>
    </Box>
  );
};

export default PeriodRangeSlider;
