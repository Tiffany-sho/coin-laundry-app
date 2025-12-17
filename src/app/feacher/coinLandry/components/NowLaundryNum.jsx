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
          bg={data.detergent > 1 && data.softener > 1 ? "green.50" : "red.50"}
          p={3}
          borderRadius="lg"
          borderColor={
            data.detergent > 1 && data.softener > 1 ? "green.200" : "red.200"
          }
          borderWidth="0.5px"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg:
              data.detergent > 1 && data.softener > 1 ? "green.100" : "red.100",
            transform: "translateY(-2px)",
            boxShadow: "md",
          }}
        >
          <VStack align="stretch" gap={2}>
            <HStack>
              <Box
                bg={
                  data.detergent > 1 && data.softener > 1
                    ? "green.500"
                    : "red.500"
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
              <Box>
                <Text
                  fontSize="xs"
                  color={
                    data.detergent > 1 && data.softener > 1
                      ? "green.700"
                      : "red.700"
                  }
                  fontWeight="medium"
                >
                  {data.detergent > 1 && data.softener > 1
                    ? "在庫良好"
                    : "在庫不足"}
                </Text>
                <HStack gap={2} flexWrap="wrap">
                  <Text
                    color={data.detergent > 1 ? "green.700" : "red.700"}
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
                        ? "green.700"
                        : "red.700"
                    }
                    fontSize="xs"
                    py={1}
                    borderRadius="md"
                    fontWeight="medium"
                  >
                    /
                  </Text>
                  <Text
                    color={data.softener > 1 ? "green.700" : "red.700"}
                    fontSize="xs"
                    py={1}
                    borderRadius="md"
                    fontWeight="medium"
                  >
                    柔軟剤: {data.softener}
                  </Text>
                </HStack>
              </Box>
            </HStack>
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

export default NowLaundryNum;
