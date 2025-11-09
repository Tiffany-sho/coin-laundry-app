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
import { LuMinus, LuPlus } from "react-icons/lu";
import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";

const NowLaundryNum = ({ id }) => {
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
        .from("laundry_stock")
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
      .from("laundry_stock")
      .update({
        detergent: detergent,
        softener: softener,
      })
      .eq("laundryId", id);

    if (error) {
      toaster.create({
        title: "エラー",
        description: "在庫の更新に失敗しました",
        type: "error",
      });
    } else {
      setData((prev) => ({
        ...prev,
        detergent: detergent,
        softener: softener,
      }));
      toaster.create({
        title: "成功",
        description: "在庫を更新しました",
        type: "success",
      });
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
          <Text fontSize="xs" color="gray.500">
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
          // ダイアログを開く時に現在の値をリセット
          setDetergent(data.detergent);
          setSoftener(data.softener);
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Box
          bg="green.50"
          p={3}
          borderRadius="lg"
          borderLeft="4px solid"
          borderColor="green.500"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg: "green.100",
            transform: "translateY(-2px)",
            boxShadow: "md",
          }}
        >
          <VStack align="stretch" gap={2}>
            <Text fontSize="xs" color="gray.600" fontWeight="semibold">
              在庫状況
            </Text>
            <HStack gap={2} flexWrap="wrap">
              <Badge
                bg={data.detergent > 1 ? "green.200" : "red.300"}
                color={data.detergent > 1 ? "green.800" : "red.800"}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
                fontWeight="semibold"
              >
                洗剤: {data.detergent}
              </Badge>
              <Badge
                bg={data.softener > 1 ? "green.200" : "red.300"}
                color={data.softener > 1 ? "green.800" : "red.800"}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
                fontWeight="semibold"
              >
                柔軟剤: {data.softener}
              </Badge>
            </HStack>
            <Text
              fontSize="xs"
              color={
                data.detergent < 2 || data.softener < 2 ? "red.600" : "gray.600"
              }
              fontWeight="medium"
              mt={1}
            >
              {data.detergent < 2 || data.softener < 2
                ? " 在庫不足"
                : " 在庫良好"}
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
                在庫管理
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
                _hover={{ bg: "gray.100" }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={6}>
              <VStack align="stretch" gap={6}>
                {/* 洗剤 */}
                <Box
                  p={4}
                  bg="blue.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="blue.900">
                      洗剤（ソープ）
                    </Heading>
                    <HStack justify="center" gap={4}>
                      <IconButton
                        variant="solid"
                        size="lg"
                        colorScheme="blue"
                        onClick={() =>
                          setDetergent((prev) => Math.max(0, prev - 1))
                        }
                        disabled={detergent <= 0}
                        borderRadius="full"
                      >
                        <LuMinus />
                      </IconButton>
                      <Box
                        bg="white"
                        px={8}
                        py={4}
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="blue.300"
                        minW="100px"
                        textAlign="center"
                      >
                        <Text fontSize="3xl" fontWeight="bold" color="blue.900">
                          {detergent}
                        </Text>
                      </Box>
                      <IconButton
                        variant="solid"
                        size="lg"
                        colorScheme="blue"
                        onClick={() => setDetergent((prev) => prev + 1)}
                        borderRadius="full"
                      >
                        <LuPlus />
                      </IconButton>
                    </HStack>
                  </VStack>
                </Box>

                {/* 柔軟剤 */}
                <Box
                  p={4}
                  bg="purple.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="purple.200"
                >
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="purple.900">
                      柔軟剤（ソフター）
                    </Heading>
                    <HStack justify="center" gap={4}>
                      <IconButton
                        variant="solid"
                        size="lg"
                        colorScheme="purple"
                        onClick={() =>
                          setSoftener((prev) => Math.max(0, prev - 1))
                        }
                        disabled={softener <= 0}
                        borderRadius="full"
                      >
                        <LuMinus />
                      </IconButton>
                      <Box
                        bg="white"
                        px={8}
                        py={4}
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="purple.300"
                        minW="100px"
                        textAlign="center"
                      >
                        <Text
                          fontSize="3xl"
                          fontWeight="bold"
                          color="purple.900"
                        >
                          {softener}
                        </Text>
                      </Box>
                      <IconButton
                        variant="solid"
                        size="lg"
                        colorScheme="purple"
                        onClick={() => setSoftener((prev) => prev + 1)}
                        borderRadius="full"
                      >
                        <LuPlus />
                      </IconButton>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              borderTop="1px solid"
              borderColor="gray.200"
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
                  colorScheme="green"
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

export default NowLaundryNum;
