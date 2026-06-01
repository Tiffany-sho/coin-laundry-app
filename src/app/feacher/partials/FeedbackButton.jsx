"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Fieldset,
  IconButton,
  Portal,
  RadioCard,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { sendFeedback } from "@/app/api/supabaseFunctions/feedback/action";
import { showToast } from "@/functions/makeToast/toast";

const TYPES = [
  { value: "bug",     label: "バグ報告",   icon: <Icon.CiCircleAlert size={16} /> },
  { value: "feature", label: "機能の提案", icon: <Icon.LuZap size={16} /> },
  { value: "other",   label: "その他",     icon: <Icon.BiMessageSquareDetail size={16} /> },
];

export default function FeedbackButton() {
  const [type, setType] = useState("bug");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement="center" motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>
        <IconButton
          position="fixed"
          right={{ base: "16px", md: "24px" }}
          bottom={{
            base: "calc(90px + env(safe-area-inset-bottom, 0px) + 12px)",
            md: "24px",
          }}
          zIndex={9000}
          aria-label="フィードバックを送る"
          borderRadius="full"
          w="48px"
          h="48px"
          style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
          color="white"
          boxShadow="0 4px 16px rgba(8,145,178,0.40)"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(8,145,178,0.50)" }}
          _active={{ transform: "translateY(0)" }}
          transition="all 0.2s"
        >
          <Icon.BiMessageSquareDetail size={20} />
        </IconButton>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="var(--card-bg, #FFFFFF)"
            borderRadius="20px"
            boxShadow="0 12px 40px rgba(14,116,144,0.18)"
            maxW="480px"
            w="calc(100vw - 32px)"
          >
            <Dialog.Header
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
              color="white"
              py={4}
              px={5}
              borderTopRadius="20px"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Icon.BiMessageSquareDetail size={18} />
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  フィードバック
                </Dialog.Title>
              </Box>
              <Text fontSize="xs" color="rgba(255,255,255,0.75)" mt={0.5}>
                バグ報告・機能提案をお気軽にどうぞ
              </Text>
            </Dialog.Header>

            <Dialog.Body p={5}>
              <Stack gap={5}>
                <Fieldset.Root>
                  <Fieldset.Legend fontSize="sm" fontWeight="semibold" color="var(--text-muted)" mb={2}>
                    種類
                  </Fieldset.Legend>
                  <RadioCard.Root
                    value={type}
                    onValueChange={(e) => setType(e.value)}
                    orientation="horizontal"
                  >
                    <Stack direction="row" gap={2} wrap="wrap">
                      {TYPES.map((t) => (
                        <RadioCard.Item key={t.value} value={t.value} flex="1" minW="100px">
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
                              <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                gap={1}
                                color={type === t.value ? "var(--teal)" : "var(--text-muted)"}
                              >
                                {t.icon}
                                <Text fontSize="11px" fontWeight="semibold">
                                  {t.label}
                                </Text>
                              </Box>
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
                    placeholder="具体的に教えていただけると助かります"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    resize="none"
                    border="1.5px solid"
                    borderColor="var(--divider)"
                    borderRadius="lg"
                    fontSize="sm"
                    bg="white"
                    _focusVisible={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                  />
                </Fieldset.Root>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer
              py={4}
              px={5}
              bg="var(--app-bg)"
              borderTop="1px solid"
              borderColor="var(--divider)"
              borderBottomRadius="20px"
              gap={3}
              justifyContent="flex-end"
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  borderColor="var(--divider)"
                  color="var(--text-muted)"
                  borderRadius="lg"
                  fontWeight="semibold"
                  disabled={loading}
                  _hover={{ bg: "gray.50" }}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                color="white"
                fontWeight="bold"
                borderRadius="lg"
                px={6}
                style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                boxShadow="0 4px 14px rgba(8,145,178,0.28)"
                _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
                _disabled={{ opacity: 0.6, cursor: "not-allowed", transform: "none" }}
                transition="all 0.2s"
              >
                {loading ? <Spinner size="sm" /> : "送信する"}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={3}
                right={3}
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
                disabled={loading}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
