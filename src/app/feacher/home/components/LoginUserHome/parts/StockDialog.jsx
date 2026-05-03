"use client";

import {
  VStack,
  Text,
  HStack,
  Badge,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Box,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import StockCounter from "./StockCounter";
import { useStockEdit } from "./useStockEdit";

const getStockBadgeStyle = (count) => ({
  bg: count < 1 ? "red.500" : count < 2 ? "orange.200" : "green.200",
  color: count < 1 ? "white" : count < 2 ? "orange.800" : "green.800",
});

const StockDialog = ({ initialData }) => {
  const {
    currentData,
    detergent,
    softener,
    setDetergent,
    setSoftener,
    isSaving,
    handleSave,
    resetStock,
  } = useStockEdit(initialData);

  const isCritical = currentData.detergent < 1 || currentData.softener < 1;
  const borderColor = isCritical ? "red.200" : "orange.200";
  const hoverBg = isCritical ? "red.50" : "orange.50";
  const hoverBorderColor = isCritical ? "red.300" : "orange.300";
  const alertColor = isCritical
    ? "var(--chakra-colors-red-500)"
    : "var(--chakra-colors-orange-500)";

  return (
    <Dialog.Root
      onOpenChange={(e) => {
        if (e.open) resetStock();
      }}
    >
      <Dialog.Trigger asChild>
        <Box
          bg="white"
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg: hoverBg,
            transform: "translateY(-2px)",
            boxShadow: "md",
            borderColor: hoverBorderColor,
          }}
        >
          <VStack align="center" gap={2} textAlign="center">
            <HStack gap={2} justify="center">
              <Icon.CiCircleAlert color={alertColor} size={18} />
              <Text fontSize="sm" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                {currentData.laundryName}
              </Text>
              {isCritical && (
                <Badge
                  bg="red.500"
                  color="white"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontWeight="bold"
                >
                  緊急
                </Badge>
              )}
            </HStack>

            <HStack gap={2} flexWrap="wrap" justify="center">
              <Badge
                {...getStockBadgeStyle(currentData.detergent)}
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="md"
                fontWeight="semibold"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Icon.LuPackage size={12} />
                洗剤: {currentData.detergent}個
              </Badge>
              <Badge
                {...getStockBadgeStyle(currentData.softener)}
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="md"
                fontWeight="semibold"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Icon.LuPackage size={12} />
                柔軟剤: {currentData.softener}個
              </Badge>
            </HStack>

            <Text
              fontSize="xs"
              color={isCritical ? "red.700" : "orange.700"}
              fontWeight="medium"
              bg={isCritical ? "red.50" : "orange.50"}
              px={2}
              py={1}
              borderRadius="md"
            >
              {isCritical ? "至急補充してください" : "補充をおすすめします"}
            </Text>
          </VStack>
        </Box>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="20px"
            maxW="md"
            bg="white"
            boxShadow="0 12px 40px rgba(14,116,144,0.18)"
          >
            <Dialog.Header
              bg="var(--teal-pale, #CFFAFE)"
              borderBottom="1px solid rgba(8,145,178,0.15)"
              p={6}
            >
              <HStack gap={3}>
                <Box
                  style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                  color="white"
                  borderRadius="full"
                  p={2}
                >
                  <Icon.LuPackage size={20} />
                </Box>
                <Dialog.Title fontSize="xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
                  在庫管理（{currentData.laundryName}店）
                </Dialog.Title>
              </HStack>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                bg="white"
                borderRadius="full"
                _hover={{ bg: "cyan.50" }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={6}>
              <VStack align="stretch" gap={6}>
                <StockCounter
                  label="洗剤（ソープ）"
                  value={detergent}
                  onChange={setDetergent}
                />
                <StockCounter
                  label="柔軟剤（ソフター）"
                  value={softener}
                  onChange={setSoftener}
                />
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              borderTop="1px solid"
              borderColor="var(--divider, #F1F5F9)"
              p={6}
              gap={3}
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  borderRadius="full"
                  px={6}
                  borderColor="var(--divider, #F1F5F9)"
                  color="var(--text-muted, #64748B)"
                  _hover={{ bg: "var(--app-bg, #F0F9FF)" }}
                  onClick={resetStock}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
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
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
                  transition="all 0.2s"
                >
                  保存
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default StockDialog;
