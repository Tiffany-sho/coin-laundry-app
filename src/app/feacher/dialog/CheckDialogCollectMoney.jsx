import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  Flex,
  Spinner,
  Stack,
  Separator,
  HStack,
} from "@chakra-ui/react";

import { useState } from "react";
import { redirect } from "next/navigation";
import { createNowData } from "@/functions/makeDate/date";
import { createData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

import * as Icon from "@/app/feacher/Icon";
import { createMessage } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

const coinWeight = 4.8;

const CheckDialog = ({
  coinLaundry,
  checked,
  moneyTotal,
  machinesAndFunds,
  epoc,
  setMsg,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const postHander = async (event) => {
    setIsLoading(true);
    setMsg("");
    event.preventDefault();

    const postArray = checked
      ? machinesAndFunds.map((machineAndFunds) => {
          if (!machineAndFunds.funds && machineAndFunds.weight) {
            return {
              id: machineAndFunds.machine.id,
              name: machineAndFunds.machine.name,
              funds: Math.ceil(machineAndFunds.weight / coinWeight) || 0,
            };
          }
          return {
            id: machineAndFunds.machine.id,
            name: machineAndFunds.machine.name,
            funds: machineAndFunds.funds || 0,
          };
        })
      : [];

    const totalFunds = checked
      ? postArray.reduce((accumulator, currentValue) => {
          return accumulator + parseInt(currentValue.funds);
        }, 0) * 100
      : moneyTotal || 0;

    const formData = {
      store: coinLaundry.store,
      storeId: coinLaundry.id,
      date: epoc + Math.floor(Math.random() * 1000),
      fundsArray: postArray,
      totalFunds,
    };

    let responseData;
    try {
      const { data, error } = await createData(formData);

      responseData = data;
      if (error) {
        throw new Error(error.message || "データの作成に失敗しました");
      }
    } catch (error) {
      console.error("API Error:", error);
      setMsg("API Error:", error);
      setIsLoading(false);
      return;
    }

    sessionStorage.setItem(
      "toast",
      JSON.stringify({
        description: `${responseData.laundryName}店の集金データの登録が完了しました。`,
        type: "success",
        closable: true,
      })
    );

    const { error } = await createMessage(
      `${responseData.laundryName}店の集金データの登録が完了しました`
    );

    if (error) {
      console.log("メッセージアクションにエラーが発生しました");
    }

    onSuccess?.();

    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
    redirect(`/coinLaundry/${responseData.laundryId}/coinDataList`);
  };

  return (
    <Dialog.Root
      role="alertdialog"
      size="lg"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button
          w={{ base: "full", sm: "auto" }}
          px={{ base: 4, md: 20 }}
          borderWidth="2px"
          borderRadius="xl"
          color="white"
          size="lg"
          fontWeight="semibold"
          style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
          boxShadow="0 4px 14px rgba(8,145,178,0.28)"
          _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
          transition="all 0.2s"
        >
          登録確認
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="20px"
            boxShadow="0 12px 40px rgba(14,116,144,0.18)"
            maxW="600px"
            mx={4}
            overflow="hidden"
          >
            <Dialog.Header
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
              color="white"
              py={5}
              px={6}
            >
              <HStack gap={3}>
                <Box color="white">
                  <Icon.RiMoneyCnyCircleLine size={20} />
                </Box>
                <Dialog.Title fontSize="xl" fontWeight="bold">
                  集金情報データの確認
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body py={6} px={6}>
              <Stack gap={6}>
                <Box>
                  <HStack mb={2}>
                    <Icon.LiaStoreSolid size={24} color="var(--teal, #0891B2)" />
                    <Text fontSize="sm" fontWeight="semibold" color="var(--text-muted, #64748B)">
                      店舗
                    </Text>
                  </HStack>

                  <Box
                    p={3}
                    bg="var(--teal-pale, #CFFAFE)"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="cyan.200"
                  >
                    <Text fontSize="lg" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                      {coinLaundry.store}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <HStack mb={2}>
                    <Icon.LuCalendar size={24} color="var(--teal, #0891B2)" />
                    <Text fontSize="sm" fontWeight="semibold" color="var(--text-muted, #64748B)">
                      日付
                    </Text>
                  </HStack>

                  <Box
                    p={3}
                    bg="var(--teal-pale, #CFFAFE)"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="cyan.200"
                  >
                    <Text fontSize="lg" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                      {createNowData(epoc)}
                    </Text>
                  </Box>
                </Box>

                <Separator />

                <Box>
                  <HStack mb={3}>
                    <Icon.RiMoneyCnyCircleLine size={24} color="var(--teal, #0891B2)" />
                    <Text fontSize="sm" fontWeight="semibold" color="var(--text-muted, #64748B)">
                      集金データ
                    </Text>
                  </HStack>

                  <Stack gap={2}>
                    {checked ? (
                      machinesAndFunds.map((item) => (
                        <Flex
                          key={item.machine.id}
                          justify="space-between"
                          align="center"
                          p={3}
                          bg="var(--app-bg, #F0F9FF)"
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor="var(--divider, #F1F5F9)"
                        >
                          <Text
                            fontSize="md"
                            fontWeight="medium"
                            color="var(--text-main, #1E3A5F)"
                          >
                            {item.machine.name}
                          </Text>
                          <Flex align="baseline" gap={1}>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="var(--text-main, #1E3A5F)"
                            >
                              {item.funds || 0}
                            </Text>
                            <Text fontSize="sm" color="var(--text-muted, #64748B)">
                              枚
                            </Text>
                            <Text fontSize="sm" color="var(--text-faint, #94A3B8)" ml={2}>
                              (¥{((item.funds || 0) * 100).toLocaleString()})
                            </Text>
                          </Flex>
                        </Flex>
                      ))
                    ) : (
                      <Box
                        p={4}
                        bg="var(--teal-pale, #CFFAFE)"
                        borderRadius="lg"
                        borderWidth="2px"
                        borderColor="cyan.200"
                      >
                        <Flex justify="space-between" align="center">
                          <Text fontSize="md" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                            合計金額
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
                            ¥{parseInt(moneyTotal || 0).toLocaleString()}
                          </Text>
                        </Flex>
                      </Box>
                    )}
                  </Stack>

                  {checked && (
                    <Box mt={3} p={4} borderRadius="lg" bg="var(--teal-pale, #CFFAFE)">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="md" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                          総合計
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
                          ¥
                          {(
                            machinesAndFunds.reduce(
                              (acc, item) => acc + (item.funds || 0),
                              0
                            ) * 100
                          ).toLocaleString()}
                        </Text>
                      </Flex>
                    </Box>
                  )}
                </Box>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer
              py={4}
              px={6}
              bg="var(--app-bg, #F0F9FF)"
              borderTop="1px"
              borderColor="var(--divider, #F1F5F9)"
            >
              <Flex gap={3} justify="flex-end" w="full">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    bg="white"
                    color="var(--text-muted, #64748B)"
                    borderWidth="2px"
                    borderColor="var(--divider, #F1F5F9)"
                    fontWeight="semibold"
                    px={6}
                    disabled={isLoading}
                    _hover={{
                      bg: "var(--app-bg, #F0F9FF)",
                      borderColor: "cyan.200",
                    }}
                  >
                    キャンセル
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  onClick={postHander}
                  size="lg"
                  color="white"
                  fontWeight="semibold"
                  px={8}
                  disabled={isLoading}
                  style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                  boxShadow="0 4px 14px rgba(8,145,178,0.28)"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                  transition="all 0.2s"
                >
                  {isLoading && <Spinner size="sm" mr={2} />}
                  登録
                </Button>
              </Flex>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                color="white"
                disabled={isLoading}
                _hover={{
                  bg: "whiteAlpha.300",
                }}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CheckDialog;
