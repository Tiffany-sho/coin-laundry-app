"use client";
import { createClient } from "@/utils/supabase/client";
import {
  VStack,
  Text,
  HStack,
  IconButton,
  Badge,
  Spinner,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Box,
  Heading,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useEffect, useState } from "react";
import { showToast } from "@/functions/makeToast/toast";

const StockDialog = ({ id }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detergent, setDetergent] = useState(0);
  const [softener, setSoftener] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const { data: initialData, error: initialError } = await supabase
        .from("laundry_state")
        .select("*")
        .eq("laundryId", id)
        .single();

      if (initialError) {
        setError(initialError.message);
        setData(null);
      } else {
        setData(initialData);
        setDetergent(initialData.detergent);
        setSoftener(initialData.softener);
        setError(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("laundry_state")
      .update({
        detergent: detergent,
        softener: softener,
      })
      .eq("laundryId", id);

    if (error) {
      showToast("error", `${data.laundryName}店の設在庫の更新に失敗しました`);
    } else {
      setData((prev) => ({
        ...prev,
        detergent: detergent,
        softener: softener,
      }));
      showToast("success", `${data.laundryName}店の設在庫を更新しました`);
    }
    setIsSaving(false);
  };

  if (loading)
    return (
      <Box
        bg="green.50"
        p={3}
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="green.500"
      >
        <VStack>
          <Spinner size="sm" color="green.500" />
          <Text fontSize="xs" color="green.500">
            読み込み中...
          </Text>
        </VStack>
      </Box>
    );

  if (error)
    return (
      <Box
        bg="red.50"
        p={3}
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="red.500"
      >
        <Text fontSize="sm" color="red.600" fontWeight="medium">
          データを入手できませんでした
        </Text>
      </Box>
    );
  return (
    <Dialog.Root
      onOpenChange={(e) => {
        if (e.open) {
          setDetergent(data.detergent);
          setSoftener(data.softener);
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Box
          bg="white"
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor={
            data.detergent < 1 || data.softener < 1 ? "red.200" : "orange.200"
          }
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg:
              data.detergent < 1 || data.softener < 1 ? "red.50" : "orange.50",
            transform: "translateY(-2px)",
            boxShadow: "md",
            borderColor:
              data.detergent < 1 || data.softener < 1
                ? "red.300"
                : "orange.300",
          }}
        >
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <HStack gap={2}>
                <Icon.CiCircleAlert
                  color={
                    data.detergent < 1 || data.softener < 1
                      ? "#E53E3E"
                      : "#DD6B20"
                  }
                  size={18}
                />
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  {data.laundryName}
                </Text>
              </HStack>
              {data.detergent < 1 ||
                (data.softener < 1 && (
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
                ))}
            </HStack>

            <HStack gap={2} flexWrap="wrap">
              <Badge
                bg={
                  data.detergent < 2
                    ? data.detergent < 1
                      ? "red.500"
                      : "orange.200"
                    : "green.200"
                }
                color={
                  data.detergent < 2
                    ? data.detergent < 1
                      ? "white"
                      : "orange.800"
                    : "green.800"
                }
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
                洗剤: {data.detergent}個
              </Badge>
              <Badge
                bg={
                  data.softener < 2
                    ? data.softener < 1
                      ? "red.500"
                      : "orange.200"
                    : "green.200"
                }
                color={
                  data.softener < 2
                    ? data.softener < 1
                      ? "white"
                      : "orange.800"
                    : "green.800"
                }
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
                柔軟剤: {data.softener}個
              </Badge>
            </HStack>

            <Text
              fontSize="xs"
              color={
                data.detergent < 1 || data.softener < 1
                  ? "red.700"
                  : "orange.700"
              }
              fontWeight="medium"
              bg={
                data.detergent < 1 || data.softener < 1 ? "red.50" : "orange.50"
              }
              px={2}
              py={1}
              borderRadius="md"
            >
              {data.detergent < 1 || data.softener < 1
                ? "至急補充してください"
                : " 補充をおすすめします"}
            </Text>
          </VStack>
        </Box>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="16px"
            maxW="md"
            bg="white"
            boxShadow="xl"
          >
            <Dialog.Header
              bg="green.50"
              borderBottom="1px solid"
              borderColor="green.200"
              p={6}
            >
              <Dialog.Title fontSize="xl" fontWeight="bold" color="green.900">
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
                _hover={{ bg: "green.100" }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={6}>
              <VStack align="stretch" gap={6}>
                <Box p={4} borderRadius="lg" border="1px solid">
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="green.900">
                      洗剤（ソープ）
                    </Heading>
                    <HStack justify="center" gap={4}>
                      <IconButton
                        variant="solid"
                        size="lg"
                        bg="gray.600"
                        onClick={() =>
                          setDetergent((prev) => Math.max(0, prev - 1))
                        }
                        disabled={detergent <= 0}
                        borderRadius="full"
                      >
                        <Icon.LuMinus />
                      </IconButton>
                      <Box
                        bg="white"
                        px={8}
                        py={4}
                        borderRadius="lg"
                        border="2px solid"
                        minW="100px"
                        textAlign="center"
                      >
                        <Text
                          fontSize="3xl"
                          fontWeight="bold"
                          color="green.900"
                        >
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
                  </VStack>
                </Box>

                <Box p={4} borderRadius="lg" border="1px solid">
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="green.900">
                      柔軟剤（ソフター）
                    </Heading>
                    <HStack justify="center" gap={4}>
                      <IconButton
                        variant="solid"
                        size="lg"
                        bg="gray.600"
                        onClick={() =>
                          setSoftener((prev) => Math.max(0, prev - 1))
                        }
                        disabled={softener <= 0}
                        borderRadius="full"
                      >
                        <Icon.LuMinus />
                      </IconButton>
                      <Box
                        bg="white"
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
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              borderTop="1px solid"
              borderColor="green.200"
              p={6}
              gap={3}
            >
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" size="lg" borderRadius="full" px={6}>
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
