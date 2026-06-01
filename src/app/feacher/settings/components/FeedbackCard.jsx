"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Fieldset,
  Flex,
  HStack,
  Heading,
  RadioCard,
  Spinner,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { sendFeedback } from "@/app/api/supabaseFunctions/feedback/action";
import { showToast } from "@/functions/makeToast/toast";

const TYPES = [
  { value: "bug",     label: "バグ報告",   icon: <Icon.CiCircleAlert size={15} /> },
  { value: "feature", label: "機能の提案", icon: <Icon.LuZap size={15} /> },
  { value: "other",   label: "その他",     icon: <Icon.BiMessageSquareDetail size={15} /> },
];

export default function FeedbackCard() {
  const [type, setType] = useState("bug");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      showToast("error", "内容を入力してください");
      return;
    }
    setLoading(true);
    const { error } = await sendFeedback({ type, description });
    setLoading(false);
    if (error) {
      showToast("error", error);
      return;
    }
    showToast("success", "フィードバックを送信しました。ありがとうございます！");
    setDescription("");
    setType("bug");
  };

  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack gap={3} mb={5}>
          <Flex w="36px" h="36px" bg="cyan.50" borderRadius="lg"
            align="center" justify="center" color="var(--teal)" flexShrink={0}>
            <Icon.BiMessageSquareDetail size={18} />
          </Flex>
          <Box>
            <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
              フィードバック
            </Heading>
            <Text fontSize="xs" color="var(--text-muted)">バグ報告・機能の提案をお気軽にどうぞ</Text>
          </Box>
        </HStack>

        <VStack align="stretch" gap={4}>
          <Fieldset.Root>
            <Fieldset.Legend fontSize="xs" fontWeight="semibold" color="var(--text-muted)" mb={2}>
              種類
            </Fieldset.Legend>
            <RadioCard.Root value={type} onValueChange={(e) => setType(e.value)}>
              <Stack direction="row" gap={2}>
                {TYPES.map((t) => (
                  <RadioCard.Item key={t.value} value={t.value} flex="1">
                    <RadioCard.ItemHiddenInput />
                    <RadioCard.ItemControl
                      border="1.5px solid"
                      borderColor={type === t.value ? "cyan.400" : "var(--divider)"}
                      bg={type === t.value ? "cyan.50" : "white"}
                      borderRadius="lg"
                      p={2.5}
                      cursor="pointer"
                      transition="all 0.15s"
                      _hover={{ borderColor: "cyan.300", bg: "cyan.50" }}
                    >
                      <RadioCard.ItemContent>
                        <Flex direction="column" align="center" gap={1}
                          color={type === t.value ? "var(--teal)" : "var(--text-muted)"}>
                          {t.icon}
                          <Text fontSize="11px" fontWeight="semibold">{t.label}</Text>
                        </Flex>
                      </RadioCard.ItemContent>
                    </RadioCard.ItemControl>
                  </RadioCard.Item>
                ))}
              </Stack>
            </RadioCard.Root>
          </Fieldset.Root>

          <Fieldset.Root>
            <Fieldset.Legend fontSize="xs" fontWeight="semibold" color="var(--text-muted)" mb={2}>
              内容 <Text as="span" color="red.400">*</Text>
            </Fieldset.Legend>
            <Textarea
              placeholder="具体的に教えていただけると助かります"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              resize="none"
              border="1.5px solid"
              borderColor="var(--divider)"
              borderRadius="lg"
              fontSize="sm"
              bg="white"
              _focusVisible={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
            />
          </Fieldset.Root>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            w="full"
            color="white"
            fontWeight="bold"
            borderRadius="lg"
            py={5}
            style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
            boxShadow="0 4px 14px rgba(8,145,178,0.28)"
            _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
            _disabled={{ opacity: 0.6, cursor: "not-allowed", transform: "none" }}
            transition="all 0.2s"
          >
            {loading ? <Spinner size="sm" /> : "送信する"}
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
