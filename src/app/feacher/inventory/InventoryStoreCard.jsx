"use client";
import { useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  Input,
  Dialog,
  Portal,
  CloseButton,
  Heading,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { updateStockState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { showToast } from "@/functions/makeToast/toast";

function CountControl({ value, onChange, canEdit }) {
  if (!canEdit) {
    return (
      <Text fontSize="3xl" fontWeight="bold" color="cyan.900" textAlign="center">
        {value}
      </Text>
    );
  }
  return (
    <HStack justify="center" gap={4}>
      <IconButton
        variant="solid"
        size="lg"
        bg="gray.600"
        borderRadius="full"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
      >
        <Icon.LuMinus />
      </IconButton>
      <Box
        bg="var(--card-bg, #FFFFFF)"
        px={8}
        py={4}
        borderRadius="lg"
        border="2px solid"
        borderColor="cyan.200"
        minW="100px"
        textAlign="center"
      >
        <Text fontSize="3xl" fontWeight="bold" color="cyan.900">{value}</Text>
      </Box>
      <IconButton
        variant="solid"
        size="lg"
        bg="gray.600"
        borderRadius="full"
        onClick={() => onChange(value + 1)}
      >
        <Icon.LuPlus />
      </IconButton>
    </HStack>
  );
}

function StockRow({ label, value, onChange, canEdit }) {
  return (
    <Box p={4} borderRadius="lg" border="1px solid" borderColor="cyan.100" w="full">
      <VStack gap={3} align="stretch">
        <Heading size="sm" color="cyan.900">{label}</Heading>
        <CountControl value={value} onChange={onChange} canEdit={canEdit} />
      </VStack>
    </Box>
  );
}

function ExtraStockRow({ item, onChange, onRemove, canEdit }) {
  return (
    <Box p={4} borderRadius="lg" border="1px solid" borderColor="cyan.100" w="full">
      <VStack gap={3} align="stretch">
        <HStack gap={2}>
          {canEdit ? (
            <Input
              value={item.name}
              onChange={(e) => onChange({ ...item, name: e.target.value })}
              placeholder="在庫名（例: 漂白剤）"
              size="sm"
              borderRadius="md"
              focusBorderColor="cyan.400"
              flex={1}
            />
          ) : (
            <Heading size="sm" color="cyan.900" flex={1}>
              {item.name || "（名前なし）"}
            </Heading>
          )}
          {canEdit && (
            <IconButton
              size="sm"
              variant="ghost"
              color="red.400"
              borderRadius="full"
              onClick={onRemove}
              aria-label="削除"
            >
              <Icon.LuTrash2 />
            </IconButton>
          )}
        </HStack>
        <CountControl
          value={item.count}
          onChange={(v) => onChange({ ...item, count: v })}
          canEdit={canEdit}
        />
      </VStack>
    </Box>
  );
}

export default function InventoryStoreCard({ stock, canEdit }) {
  const [detergent, setDetergent] = useState(stock.detergent ?? 0);
  const [softener, setSoftener] = useState(stock.softener ?? 0);
  const [extraStocks, setExtraStocks] = useState(stock.extra_stocks ?? []);

  const [editDet, setEditDet] = useState(detergent);
  const [editSof, setEditSof] = useState(softener);
  const [editExtras, setEditExtras] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  const isLow =
    detergent < 2 ||
    softener < 2 ||
    extraStocks.some((s) => s.count < 2);

  const handleOpen = () => {
    setEditDet(detergent);
    setEditSof(softener);
    setEditExtras(extraStocks.map((s) => ({ ...s })));
  };

  const addExtraItem = () => {
    setEditExtras((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", count: 0 },
    ]);
  };

  const updateExtraItem = (updated) => {
    setEditExtras((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const removeExtraItem = (id) => {
    setEditExtras((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateStockState(stock.laundryId, {
      detergent: editDet,
      softener: editSof,
      extra_stocks: editExtras,
    });
    if (error) {
      showToast("error", `${stock.laundryName}店の在庫更新に失敗しました`);
    } else {
      setDetergent(editDet);
      setSoftener(editSof);
      setExtraStocks(editExtras);
      showToast("success", `${stock.laundryName}店の在庫を更新しました`);
    }
    setIsSaving(false);
  };

  const displayItems = [
    { label: "洗剤", value: detergent, isLow: detergent < 2 },
    { label: "柔軟剤", value: softener, isLow: softener < 2 },
    ...extraStocks.map((s) => ({
      label: s.name || "—",
      value: s.count,
      isLow: s.count < 2,
    })),
  ];

  return (
    <Dialog.Root onOpenChange={(e) => { if (e.open) handleOpen(); }}>
      <Dialog.Trigger asChild>
        <Box
          bg={isLow ? "orange.50" : "cyan.50"}
          border="2px solid"
          borderColor={isLow ? "orange.200" : "cyan.200"}
          borderRadius="xl"
          p={4}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "md",
            bg: isLow ? "orange.100" : "cyan.100",
          }}
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={1} flex={1} minW={0}>
              <Text fontWeight="bold" fontSize="sm" color="var(--text-main)">
                {stock.laundryName}店
              </Text>
              <HStack gap={2} flexWrap="wrap">
                {displayItems.map((item, i) => (
                  <Text
                    key={i}
                    fontSize="xs"
                    color={item.isLow ? "orange.600" : "cyan.700"}
                    fontWeight="medium"
                    whiteSpace="nowrap"
                  >
                    {item.label}: {item.value}
                  </Text>
                ))}
              </HStack>
            </VStack>
            <Box
              bg={isLow ? "orange.500" : "cyan.500"}
              color="white"
              borderRadius="full"
              p={1.5}
              flexShrink={0}
            >
              {isLow ? <Icon.CiCircleAlert size={16} /> : <Icon.LuCheck size={16} />}
            </Box>
          </HStack>
        </Box>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="xl"
            maxW="md"
            bg="var(--card-bg, #FFFFFF)"
            boxShadow="xl"
          >
            <Dialog.Header
              bg="var(--teal-pale)"
              borderBottom="1px solid"
              borderColor="cyan.200"
              p={6}
            >
              <Dialog.Title fontSize="xl" fontWeight="bold" color="cyan.900">
                在庫管理（{stock.laundryName}店）
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                bg="var(--card-bg)"
                borderRadius="full"
                _hover={{ bg: "cyan.100" }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={6}>
              <VStack gap={4}>
                <StockRow
                  label="洗剤（ソープ）"
                  value={editDet}
                  onChange={setEditDet}
                  canEdit={canEdit}
                />
                <StockRow
                  label="柔軟剤（ソフター）"
                  value={editSof}
                  onChange={setEditSof}
                  canEdit={canEdit}
                />

                <Box w="full" borderTop="1px solid" borderColor="cyan.100" pt={2}>
                  <Text fontSize="xs" color="var(--text-muted)" fontWeight="semibold" mb={3}>
                    その他の在庫
                  </Text>
                  <VStack gap={4} align="stretch">
                    {editExtras.map((item) => (
                      <ExtraStockRow
                        key={item.id}
                        item={item}
                        onChange={updateExtraItem}
                        onRemove={() => removeExtraItem(item.id)}
                        canEdit={canEdit}
                      />
                    ))}
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        borderRadius="full"
                        borderColor="cyan.300"
                        color="cyan.600"
                        onClick={addExtraItem}
                        w="full"
                      >
                        <Icon.LuPlus size={14} />
                        在庫を追加
                      </Button>
                    )}
                    {!canEdit && editExtras.length === 0 && (
                      <Text fontSize="xs" color="var(--text-faint)" textAlign="center">
                        追加の在庫はありません
                      </Text>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              borderTop="1px solid"
              borderColor="cyan.200"
              p={6}
              gap={3}
            >
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" size="lg" borderRadius="full">
                  {canEdit ? "キャンセル" : "閉じる"}
                </Button>
              </Dialog.ActionTrigger>
              {canEdit && (
                <Dialog.ActionTrigger asChild>
                  <Button
                    size="lg"
                    onClick={handleSave}
                    loading={isSaving}
                    borderRadius="full"
                    px={8}
                    color="white"
                    style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                    boxShadow="0 4px 14px rgba(8,145,178,0.28)"
                  >
                    保存
                  </Button>
                </Dialog.ActionTrigger>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
