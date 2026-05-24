"use client";

import { useState } from "react";
import { RadioCard, HStack, Text, VStack } from "@chakra-ui/react";
import { setCollectMethod } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { showToast } from "@/functions/makeToast/toast";

const ITEMS = [
  { value: "machines", label: "機械別集金", description: "各機械の収益を個別に記録" },
  { value: "total",    label: "まとめて集金", description: "総額のみを記録" },
];

export default function CollectMethodSetting({ defaultValue }) {
  const [value, setValue] = useState(defaultValue || "machines");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const next = e.value;
    setValue(next);
    setLoading(true);
    const { error } = await setCollectMethod(next);
    setLoading(false);
    if (error) {
      showToast("error", "集金方法の更新に失敗しました");
    } else {
      showToast("success", "集金方法を更新しました");
    }
  };

  return (
    <RadioCard.Root value={value} onValueChange={handleChange} size="sm" disabled={loading}>
      <HStack gap={3} align="stretch">
        {ITEMS.map((item) => (
          <RadioCard.Item
            key={item.value}
            value={item.value}
            flex={1}
            borderRadius="lg"
            border="2px solid"
            borderColor={value === item.value ? "cyan.300" : "cyan.100"}
            bg={value === item.value ? "var(--teal-pale)" : "transparent"}
            cursor="pointer"
            transition="all 0.2s"
          >
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl p={3}>
              <RadioCard.ItemContent>
                <VStack align="start" gap={0.5}>
                  <RadioCard.ItemText fontSize="sm" fontWeight="bold" color="var(--text-main)">
                    {item.label}
                  </RadioCard.ItemText>
                  <Text fontSize="xs" color="var(--text-muted)" lineHeight="1.4">
                    {item.description}
                  </Text>
                </VStack>
              </RadioCard.ItemContent>
            </RadioCard.ItemControl>
          </RadioCard.Item>
        ))}
      </HStack>
    </RadioCard.Root>
  );
}
