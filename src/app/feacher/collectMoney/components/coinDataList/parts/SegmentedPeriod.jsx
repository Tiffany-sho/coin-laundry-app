"use client";

import { HStack, VStack, Button, Text, Input, Box } from "@chakra-ui/react";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import {
  changeEpocFromNowYearMonth,
  getEpochTimeInSeconds,
} from "@/functions/makeDate/date";

const EPOCH_OFFSET = 32400000;

const epochToInputDate = (epoch) => {
  const date = new Date(epoch + EPOCH_OFFSET);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const inputDateToEpoch = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return getEpochTimeInSeconds(year, month, day);
};

const QUICK_PERIODS = [
  { label: "3ヶ月", months: 3 },
  { label: "6ヶ月", months: 6 },
  { label: "1年", months: 12 },
  { label: "全期間", months: null },
];

const PeriodPicker = () => {
  const { startEpoch, setStartEpoch, endEpoch, setEndEpoch } = useUploadPage();

  const handleQuickSelect = (months) => {
    if (months === null) {
      setStartEpoch(0);
    } else {
      setStartEpoch(changeEpocFromNowYearMonth(-months));
    }
    setEndEpoch(null);
  };

  const startDateValue = startEpoch > 0 ? epochToInputDate(startEpoch) : "";
  const endDateValue = endEpoch !== null ? epochToInputDate(endEpoch) : "";

  return (
    <Box ml="auto">
      <VStack align="flex-end" gap={2}>
        <HStack gap={1}>
          {QUICK_PERIODS.map(({ label, months }) => (
            <Button
              key={label}
              size="xs"
              variant="outline"
              colorPalette="blue"
              onClick={() => handleQuickSelect(months)}
            >
              {label}
            </Button>
          ))}
        </HStack>
        <HStack gap={2} align="center">
          <Input
            type="date"
            size="xs"
            w="130px"
            value={startDateValue}
            onChange={(e) => {
              if (e.target.value) {
                setStartEpoch(inputDateToEpoch(e.target.value));
              } else {
                setStartEpoch(0);
              }
            }}
          />
          <Text fontSize="sm" color="fg.muted">
            〜
          </Text>
          <Input
            type="date"
            size="xs"
            w="130px"
            value={endDateValue}
            onChange={(e) => {
              if (e.target.value) {
                // 終了日は選択日の終わり（翌日0時の直前）まで含める
                setEndEpoch(inputDateToEpoch(e.target.value) + 86400000 - 1);
              } else {
                setEndEpoch(null);
              }
            }}
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default PeriodPicker;
