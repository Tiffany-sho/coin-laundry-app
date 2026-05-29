"use client";
import { useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  Dialog,
  Portal,
  CloseButton,
  Heading,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { updateStockState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { showToast } from "@/functions/makeToast/toast";

function StockControl({ label, value, onChange, canEdit }) {
  return (
    <Box p={4} borderRadius="lg" border="1px solid" borderColor="cyan.100" w="full">
      <VStack gap={3} align="stretch">
        <Heading size="sm" color="cyan.900">{label}</Heading>
        {canEdit ? (
          <HStack justify="center" gap={4}>
            <IconButton
              variant="solid"
              size="lg"
              bg="gray.600"
              borderRadius="full"
              onClick={() => onChange((prev) => Math.max(0, prev - 1))}
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
              onClick={() => onChange((prev) => prev + 1)}
            >
              <Icon.LuPlus />
            </IconButton>
          </HStack>
        ) : (
          <Text fontSize="3xl" fontWeight="bold" color="cyan.900" textAlign="center">{value}</Text>
        )}
      </VStack>
    </Box>
  );
}

export default function InventoryStoreCard({ stock, canEdit }) {
  const [detergent, setDetergent] = useState(stock.detergent ?? 0);
  const [softener, setSoftener] = useState(stock.softener ?? 0);
  const [editDet, setEditDet] = useState(detergent);
  const [editSof, setEditSof] = useState(softener);
  const [isSaving, setIsSaving] = useState(false);

  const isLow = detergent < 2 || softener < 2;

  const handleOpen = () => {
    setEditDet(detergent);
    setEditSof(softener);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateStockState(stock.laundryId, {
      detergent: editDet,
      softener: editSof,
    });
    if (error) {
      showToast("error", `${stock.laundryName}店の在庫更新に失敗しました`);
    } else {
      setDetergent(editDet);
      setSoftener(editSof);
      showToast("success", `${stock.laundryName}店の在庫を更新しました`);
    }
    setIsSaving(false);
  };

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
            <VStack align="start" gap={1}>
              <Text fontWeight="bold" fontSize="sm" color="var(--text-main)">
                {stock.laundryName}店
              </Text>
              <HStack gap={3}>
                <Text
                  fontSize="xs"
                  color={detergent < 2 ? "orange.600" : "cyan.700"}
                  fontWeight="medium"
                >
                  洗剤: {detergent}
                </Text>
                <Text fontSize="xs" color="var(--text-faint)">/</Text>
                <Text
                  fontSize="xs"
                  color={softener < 2 ? "orange.600" : "cyan.700"}
                  fontWeight="medium"
                >
                  柔軟剤: {softener}
                </Text>
              </HStack>
            </VStack>
            <Box
              bg={isLow ? "orange.500" : "cyan.500"}
              color="white"
              borderRadius="full"
              p={1.5}
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
              <VStack gap={6}>
                <StockControl
                  label="洗剤（ソープ）"
                  value={editDet}
                  onChange={setEditDet}
                  canEdit={canEdit}
                />
                <StockControl
                  label="柔軟剤（ソフター）"
                  value={editSof}
                  onChange={setEditSof}
                  canEdit={canEdit}
                />
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
