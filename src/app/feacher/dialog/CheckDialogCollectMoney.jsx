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
          px={{ base: 14, md: 20 }}
          borderWidth="2px"
          borderRadius="xl"
          color="white"
          size="lg"
          fontWeight="semibold"
          _hover={{
            bg: "gray.600",
          }}
        >
          登録確認
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            maxW="600px"
            mx={4}
            overflow="hidden"
          >
            <Dialog.Header bg="gray.800" color="white" py={5} px={6}>
              <Dialog.Title fontSize="xl" fontWeight="bold">
                集金情報データの確認
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body py={6} px={6}>
              <Stack gap={6}>
                <Box>
                  <HStack mb={2}>
                    <Icon.LiaStoreSolid size={24} />
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                      店舗
                    </Text>
                  </HStack>

                  <Box
                    p={3}
                    bg="blue.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="blue.200"
                  >
                    <Text fontSize="lg" fontWeight="bold">
                      {coinLaundry.store}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <HStack mb={2}>
                    <Icon.LuCalendar size={24} />
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                      日付
                    </Text>
                  </HStack>

                  <Box
                    p={3}
                    bg="blue.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="blue.200"
                  >
                    <Text fontSize="lg" fontWeight="bold">
                      {createNowData(epoc)}
                    </Text>
                  </Box>
                </Box>

                <Separator />

                <Box>
                  <HStack mb={3}>
                    <Icon.RiMoneyCnyCircleLine size={24} />
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600">
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
                          bg="gray.50"
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor="gray.200"
                        >
                          <Text
                            fontSize="md"
                            fontWeight="medium"
                            color="gray.700"
                          >
                            {item.machine.name}
                          </Text>
                          <Flex align="baseline" gap={1}>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="gray.800"
                            >
                              {item.funds || 0}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              枚
                            </Text>
                            <Text fontSize="sm" color="gray.500" ml={2}>
                              (¥{((item.funds || 0) * 100).toLocaleString()})
                            </Text>
                          </Flex>
                        </Flex>
                      ))
                    ) : (
                      <Box
                        p={4}
                        bg="blue.50"
                        borderRadius="lg"
                        borderWidth="2px"
                        borderColor="blue.200"
                      >
                        <Flex justify="space-between" align="center">
                          <Text fontSize="md" fontWeight="semibold">
                            合計金額
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold">
                            ¥{parseInt(moneyTotal || 0).toLocaleString()}
                          </Text>
                        </Flex>
                      </Box>
                    )}
                  </Stack>

                  {checked && (
                    <Box mt={3} p={4} borderRadius="lg" bg="blue.50">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="md" fontWeight="bold">
                          総合計
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
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
              bg="gray.50"
              borderTop="1px"
              borderColor="gray.200"
            >
              <Flex gap={3} justify="flex-end" w="full">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    bg="white"
                    color="gray.700"
                    borderWidth="2px"
                    borderColor="gray.300"
                    fontWeight="semibold"
                    px={6}
                    disabled={isLoading}
                    _hover={{
                      bg: "gray.100",
                      borderColor: "gray.400",
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
                  _hover={{
                    bg: "gray.700",
                  }}
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
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
