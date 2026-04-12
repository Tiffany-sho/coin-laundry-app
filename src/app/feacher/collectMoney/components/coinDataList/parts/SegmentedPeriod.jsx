"use client";

import { Box, Slider, Text, VStack } from "@chakra-ui/react";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";

const STEPS = [
  { label: "1ヶ月", months: 1 },
  { label: "3ヶ月", months: 3 },
  { label: "6ヶ月", months: 6 },
  { label: "1年", months: 12 },
  { label: "2年", months: 24 },
  { label: "3年", months: 36 },
  { label: "5年", months: 60 },
  { label: "全期間", months: null },
];

const DEFAULT_INDEX = 2; // 6ヶ月

const PeriodSlider = () => {
  const { startEpoch, setStartEpoch, setEndEpoch } = useUploadPage();

  // 現在の startEpoch からスライダーのインデックスを逆引き
  const currentIndex = (() => {
    if (startEpoch === 0) return STEPS.length - 1; // 全期間
    for (let i = 0; i < STEPS.length - 1; i++) {
      const epoch = changeEpocFromNowYearMonth(-STEPS[i].months);
      if (Math.abs(startEpoch - epoch) < 1000 * 60 * 60 * 24) return i;
    }
    return DEFAULT_INDEX;
  })();

  const handleChange = (index) => {
    const { months } = STEPS[index];
    if (months === null) {
      setStartEpoch(0);
    } else {
      setStartEpoch(changeEpocFromNowYearMonth(-months));
    }
    setEndEpoch(null);
  };

  const selectedLabel = STEPS[currentIndex]?.label ?? STEPS[DEFAULT_INDEX].label;

  return (
    <Box ml="auto" w={{ base: "100%", md: "320px" }}>
      <VStack gap={1} align="stretch">
        <Text fontSize="xs" color="fg.muted" textAlign="right">
          表示期間：<Text as="span" fontWeight="bold" color="fg">{selectedLabel}</Text>
        </Text>
        <Slider.Root
          min={0}
          max={STEPS.length - 1}
          step={1}
          value={[currentIndex]}
          onValueChange={(e) => handleChange(e.value[0])}
          colorPalette="blue"
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
          </Slider.Control>
          <Slider.MarkerGroup>
            {STEPS.map((step, i) => (
              <Slider.Marker key={i} value={i}>
                <Slider.MarkerIndicator />
                <Text
                  fontSize="2xs"
                  color={i === currentIndex ? "blue.500" : "fg.muted"}
                  fontWeight={i === currentIndex ? "bold" : "normal"}
                  whiteSpace="nowrap"
                >
                  {step.label}
                </Text>
              </Slider.Marker>
            ))}
          </Slider.MarkerGroup>
        </Slider.Root>
      </VStack>
    </Box>
  );
};

export default PeriodSlider;
