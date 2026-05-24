"use client";

import { useEffect } from "react";
import {
  VStack,
  Text,
  HStack,
  IconButton,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Box,
  Heading,
  Skeleton,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useNowLaundryNum } from "./useNowLaundryNum";

const NowLaundryNum = ({ id, onLoad, canEdit = true }) => {
  const {
    data,
    detergent,
    softener,
    setDetergent,
    setSoftener,
    isSaving,
    isLoading,
    handleSave,
    resetStock,
  } = useNowLaundryNum(id);

  useEffect(() => {
    if (!isLoading) onLoad?.();
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Skeleton borderRadius="lg" height="80px" />;

  if (!data)
    return (
      <Box
        bg="orange.50"
        p={3}
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="orange.500"
      >
        <Text fontSize="sm" color="red.600" fontWeight="medium">
          データを入手できませんでした
        </Text>
      </Box>
    );

  return (
    <Dialog.Root
      onOpenChange={(e) => {
        if (e.open) resetStock();
      }}
    >
      <Dialog.Trigger asChild>
        <Box
          bg={data.detergent > 1 && data.softener > 1 ? "cyan.50" : "orange.50"}
          p={3}
          borderRadius="lg"
          borderColor={
            data.detergent > 1 && data.softener > 1 ? "cyan.200" : "orange.200"
          }
          borderWidth="2px"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg: data.detergent > 1 && data.softener > 1 ? "cyan.100" : "orange.100",
            transform: "translateY(-2px)",
            boxShadow: "md",
          }}
        >
          <VStack align="stretch" gap={2}>
            <Box>
              <HStack>
                <Box
                  bg={
                    data.detergent > 1 && data.softener > 1
                      ? "cyan.500"
                      : "orange.500"
                  }
                  color="white"
                  borderRadius="full"
                  p={1}
                >
                  {data.detergent > 1 && data.softener > 1 ? (
                    <Icon.LuCheck size={14} />
                  ) : (
                    <Icon.CiCircleAlert size={14} />
                  )}
                </Box>
                <Text
                  fontSize="xs"
                  color={
                    data.detergent > 1 && data.softener > 1
                      ? "cyan.700"
                      : "orange.700"
                  }
                  fontWeight="semibold"
                >
                  {data.detergent > 1 && data.softener > 1 ? "在庫良好" : "在庫不足"}
                </Text>
              </HStack>

              <HStack gap={2} flexWrap="wrap">
                <Text
                  color={data.detergent > 1 ? "cyan.700" : "orange.700"}
                  fontSize="xs"
                  py={1}
                  borderRadius="md"
                  fontWeight="medium"
                >
                  洗剤: {data.detergent}
                </Text>
                <Text
                  color={
                    data.detergent > 1 && data.softener > 1
                      ? "cyan.700"
                      : "orange.700"
                  }
                  fontSize="xs"
                  py={1}
                  borderRadius="md"
                  fontWeight="medium"
                >
                  /
                </Text>
                <Text
                  color={data.softener > 1 ? "cyan.700" : "orange.700"}
                  fontSize="xs"
                  py={1}
                  borderRadius="md"
                  fontWeight="medium"
                >
                  柔軟剤: {data.softener}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="16px"
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
                在庫管理({data.laundryName}店)
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                bg="white"
                borderRadius="full"
                _hover={{ bg: "cyan.100" }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={6}>
              <VStack align="stretch" gap={6}>
                <Box p={4} borderRadius="lg" border="1px solid">
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="cyan.900">
                      洗剤（ソープ）
                    </Heading>
                    {canEdit ? (
                      <HStack justify="center" gap={4}>
                        <IconButton
                          variant="solid"
                          size="lg"
                          bg="gray.600"
                          onClick={() => setDetergent((prev) => Math.max(0, prev - 1))}
                          disabled={detergent <= 0}
                          borderRadius="full"
                        >
                          <Icon.LuMinus />
                        </IconButton>
                        <Box
                          bg="var(--card-bg, #FFFFFF)"
                          px={8}
                          py={4}
                          borderRadius="lg"
                          border="2px solid"
                          minW="100px"
                          textAlign="center"
                        >
                          <Text fontSize="3xl" fontWeight="bold" color="cyan.900">
                            {detergent}
                          </Text>
                        </Box>
                        <IconButton
                          variant="solid"
                          size="lg"
                          bg="gray.600"
                          onClick={() => setDetergent((prev) => prev + 1)}
                          borderRadius="full"
                        >
                          <Icon.LuPlus />
                        </IconButton>
                      </HStack>
                    ) : (
                      <Text fontSize="3xl" fontWeight="bold" color="cyan.900" textAlign="center">
                        {data.detergent}
                      </Text>
                    )}
                  </VStack>
                </Box>

                <Box p={4} borderRadius="lg" border="1px solid">
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="cyan.900">
                      柔軟剤（ソフター）
                    </Heading>
                    {canEdit ? (
                      <HStack justify="center" gap={4}>
                        <IconButton
                          variant="solid"
                          size="lg"
                          bg="gray.600"
                          onClick={() => setSoftener((prev) => Math.max(0, prev - 1))}
                          disabled={softener <= 0}
                          borderRadius="full"
                        >
                          <Icon.LuMinus />
                        </IconButton>
                        <Box
                          bg="var(--card-bg, #FFFFFF)"
                          px={8}
                          py={4}
                          borderRadius="lg"
                          border="2px solid"
                          minW="100px"
                          textAlign="center"
                        >
                          <Text fontSize="3xl" fontWeight="bold">
                            {softener}
                          </Text>
                        </Box>
                        <IconButton
                          variant="solid"
                          size="lg"
                          bg="gray.600"
                          onClick={() => setSoftener((prev) => prev + 1)}
                          borderRadius="full"
                        >
                          <Icon.LuPlus />
                        </IconButton>
                      </HStack>
                    ) : (
                      <Text fontSize="3xl" fontWeight="bold" textAlign="center">
                        {data.softener}
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
                <Button variant="outline" size="lg" borderRadius="full" px={6}>
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
};

export default NowLaundryNum;
