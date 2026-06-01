"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Fieldset,
  Flex,
  HStack,
  RadioCard,
  Spinner,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import { sendFeedback } from "@/app/api/supabaseFunctions/feedback/action";
import { showToast } from "@/functions/makeToast/toast";

const TYPES = [
  { value: "bug",     label: "バグ報告",   icon: <Icon.CiCircleAlert size={16} /> },
  { value: "feature", label: "機能の提案", icon: <Icon.LuZap size={16} /> },
  { value: "other",   label: "その他",     icon: <Icon.BiMessageSquareDetail size={16} /> },
];

export default function FeedbackForm() {
  const [type, setType] = useState("bug");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
    setSent(true);
  };

  return (
    <VStack align="stretch" gap={5}>
      {/* ヘッダー */}
      <HStack gap={3}>
        <Link href="/settings">
          <Flex
            w="36px" h="36px" borderRadius="lg" align="center" justify="center"
            border="1px solid" borderColor="var(--divider)"
            color="var(--text-muted)" cursor="pointer" transition="all 0.2s"
            _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300", color: "var(--teal)" }}
          >
            <Icon.LuChevronLeft size={18} />
          </Flex>
        </Link>
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="var(--teal-deeper)">フィードバック</Text>
          <Text fontSize="xs" color="var(--text-muted)">バグ報告・機能の提案をお気軽にどうぞ</Text>
        </Box>
      </HStack>

      {sent ? (
        /* 送信完了 */
        <Card.Root bg="var(--card-bg)" borderRadius="xl" boxShadow="var(--shadow-sm)"
          border="1px solid" borderColor="cyan.100">
          <Card.Body p={{ base: 6, md: 8 }}>
            <VStack gap={4} py={4}>
              <Flex
                w="64px" h="64px" borderRadius="full" bg="cyan.50"
                align="center" justify="center" color="var(--teal)">
                <Icon.LuCheck size={32} />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" color="var(--teal-deeper)">
                送信しました！
              </Text>
              <Text fontSize="sm" color="var(--text-muted)" textAlign="center" lineHeight="1.8">
                フィードバックありがとうございます。<br />
                内容を確認して改善に役立てます。
              </Text>
              <Button
                mt={2}
                variant="outline"
                borderColor="var(--divider)"
                color="var(--text-muted)"
                borderRadius="lg"
                onClick={() => { setSent(false); setDescription(""); setType("bug"); }}
                _hover={{ bg: "gray.50" }}
              >
                続けて送る
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : (
        /* フォーム */
        <Card.Root bg="var(--card-bg)" borderRadius="xl" boxShadow="var(--shadow-sm)"
          border="1px solid" borderColor="cyan.100">
          <Card.Body p={{ base: 5, md: 6 }}>
            <VStack align="stretch" gap={5}>
              <Fieldset.Root>
                <Fieldset.Legend fontSize="sm" fontWeight="semibold" color="var(--text-muted)" mb={2}>
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
                          p={3}
                          cursor="pointer"
                          transition="all 0.15s"
                          _hover={{ borderColor: "cyan.300", bg: "cyan.50" }}
                        >
                          <RadioCard.ItemContent>
                            <Flex direction="column" align="center" gap={1.5}
                              color={type === t.value ? "var(--teal)" : "var(--text-muted)"}>
                              {t.icon}
                              <Text fontSize="xs" fontWeight="semibold">{t.label}</Text>
                            </Flex>
                          </RadioCard.ItemContent>
                        </RadioCard.ItemControl>
                      </RadioCard.Item>
                    ))}
                  </Stack>
                </RadioCard.Root>
              </Fieldset.Root>

              <Fieldset.Root>
                <Fieldset.Legend fontSize="sm" fontWeight="semibold" color="var(--text-muted)" mb={2}>
                  内容 <Text as="span" color="red.400">*</Text>
                </Fieldset.Legend>
                <Textarea
                  placeholder="具体的に教えていただけると助かります&#10;&#10;例）〇〇の画面で△△しようとすると、××というエラーが出ます"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
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
                py={6}
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
      )}
    </VStack>
  );
}
