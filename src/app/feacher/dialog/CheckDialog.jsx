import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Image,
  Portal,
  Separator,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
import * as Icon from "@/app/feacher/Icon";

const InfoRow = ({ label, icon, children }) => (
  <Box>
    <HStack mb={2} gap={2}>
      <Box color="var(--teal, #0891B2)">{icon}</Box>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        color="var(--text-muted, #64748B)"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        {label}
      </Text>
    </HStack>
    <Box
      p={3}
      bg="var(--teal-pale, #CFFAFE)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="cyan.200"
    >
      {children}
    </Box>
  </Box>
);

const CheckDialog = ({ method, postHander, dialogRef }) => {
  const { state } = useCoinLaundryForm();

  const hasMachines = state.machines.filter((m) => m.num !== 0).length > 0;
  const allPictures = [...(state.existingPictures ?? []), ...(state.newPictures ?? [])];

  /*
    ⚠️ 使用中と使わなくなったものを分ける。フォームは無効化したものも
       `isActive: false` のまま配列に残して送る（落とすと戻せなくなるため）。
  */
  const paymentMethods = state.paymentMethods ?? [];
  const activeMethods = paymentMethods.filter((m) => m.isActive);
  const retiredMethods = paymentMethods.filter((m) => !m.isActive);

  return (
    <Dialog.Root
      role="alertdialog"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button
          w={{ base: "full", md: "auto" }}
          minW={{ md: "140px" }}
          fontWeight="semibold"
          borderRadius="lg"
          color="white"
          style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
          boxShadow="0 4px 14px rgba(8,145,178,0.28)"
          _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
          transition="all 0.2s"
        >
          {method === "POST" ? "登録確認" : "編集確認"}
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="var(--card-bg, #FFFFFF)"
            borderRadius="20px"
            boxShadow="0 12px 40px rgba(14,116,144,0.18)"
            maxW="680px"
            w="calc(100vw - 32px)"
            overflow="hidden"
          >
            {/* ヘッダー */}
            <Dialog.Header
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
              color="white"
              py={5}
              px={6}
            >
              <HStack gap={3}>
                <Box color="white">
                  <Icon.LiaStoreSolid size={20} />
                </Box>
                <Dialog.Title fontSize="xl" fontWeight="bold">
                  店舗情報の確認
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            {/* ボディ */}
            <Dialog.Body
              p={{ base: 5, md: 7 }}
              bg="var(--card-bg, #FFFFFF)"
              maxH="60vh"
              overflowY="auto"
              css={{
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": { background: "#CBD5E0", borderRadius: "4px" },
              }}
            >
              <Stack gap={5}>
                <InfoRow label="店舗名" icon={<Icon.LiaStoreSolid size={13} />}>
                  <Text fontSize="lg" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                    {state.store}
                  </Text>
                </InfoRow>

                <InfoRow label="場所" icon={<Icon.PiMapPin size={13} />}>
                  <Text fontSize="md" color="var(--text-main, #1E3A5F)">
                    {state.location}
                  </Text>
                </InfoRow>

                <InfoRow label="概要" icon={<Icon.LuFileText size={13} />}>
                  <Text fontSize="sm" color="var(--text-main, #1E3A5F)" whiteSpace="pre-wrap" lineHeight="1.7">
                    {state.description}
                  </Text>
                </InfoRow>

                <Separator borderColor="var(--divider, #F1F5F9)" />

                {/* 機械 */}
                <Box>
                  <HStack mb={3} gap={2}>
                    <Box color="var(--teal, #0891B2)">
                      <Icon.LuWrench size={13} />
                    </Box>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="var(--text-muted, #64748B)"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      機械
                    </Text>
                  </HStack>

                  {hasMachines ? (
                    <Stack gap={2}>
                      {state.machines
                        .filter((m) => m.num !== 0)
                        .map((machine) => (
                          <Flex
                            key={machine.name}
                            justify="space-between"
                            align="center"
                            p={3}
                            bg="var(--app-bg, #F0F9FF)"
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="var(--divider, #F1F5F9)"
                          >
                            <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                              {machine.name}
                            </Text>
                            <HStack gap={3}>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="var(--teal, #0891B2)"
                                bg="var(--teal-pale, #CFFAFE)"
                                px={2.5}
                                py={0.5}
                                borderRadius="full"
                              >
                                {machine.num}台
                              </Text>
                              {machine.comment && (
                                <Text fontSize="xs" color="var(--text-muted, #64748B)">
                                  {machine.comment}
                                </Text>
                              )}
                            </HStack>
                          </Flex>
                        ))}
                    </Stack>
                  ) : (
                    <Box
                      p={4}
                      bg="var(--app-bg, #F0F9FF)"
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text color="var(--text-faint, #94A3B8)" fontSize="sm">
                        機械の登録なし
                      </Text>
                    </Box>
                  )}
                </Box>

                <Separator borderColor="var(--divider, #F1F5F9)" />

                {/* 支払方法 */}
                <Box>
                  <HStack mb={3} gap={2}>
                    <Box color="var(--teal, #0891B2)">
                      <Icon.LuCreditCard size={13} />
                    </Box>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="var(--text-muted, #64748B)"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      支払方法
                    </Text>
                  </HStack>

                  <Stack gap={2}>
                    {/* 現金は payment_methods に行が無く、常に記録される */}
                    <Flex
                      justify="space-between"
                      align="center"
                      p={3}
                      bg="var(--app-bg, #F0F9FF)"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="var(--divider, #F1F5F9)"
                    >
                      <HStack gap={2}>
                        <Box color="var(--text-muted, #64748B)">
                          <Icon.TbCoinYenFilled size={15} />
                        </Box>
                        <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                          現金
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="var(--text-faint, #94A3B8)">
                        常に記録されます
                      </Text>
                    </Flex>

                    {activeMethods.map((method) => (
                      <Flex
                        key={method.name}
                        align="center"
                        gap={2}
                        p={3}
                        bg="var(--app-bg, #F0F9FF)"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="var(--divider, #F1F5F9)"
                      >
                        <Box color="var(--teal, #0891B2)">
                          <Icon.LuCreditCard size={15} />
                        </Box>
                        <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                          {method.name}
                        </Text>
                      </Flex>
                    ))}
                  </Stack>

                  {/*
                    ⚠️ 使わなくなったものも出す。保存すると無効化されるが、過去の集金記録には
                       名前が残る。「消したのに履歴に出る」を確認画面の時点で説明しておく。
                  */}
                  {retiredMethods.length > 0 && (
                    <Box mt={3}>
                      <Text fontSize="xs" color="var(--text-muted, #64748B)" mb={1.5}>
                        使わなくなる支払方法（過去の集金記録には残ります）
                      </Text>
                      <Flex flexWrap="wrap" gap={2}>
                        {retiredMethods.map((method) => (
                          <Text
                            key={method.name}
                            fontSize="xs"
                            color="var(--text-faint, #94A3B8)"
                            textDecoration="line-through"
                            px={2.5}
                            py={1}
                            bg="gray.50"
                            borderRadius="full"
                            borderWidth="1px"
                            borderColor="var(--divider, #F1F5F9)"
                          >
                            {method.name}
                          </Text>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </Box>

                {/* 写真 */}
                {allPictures.length > 0 && (
                  <>
                    <Separator borderColor="var(--divider, #F1F5F9)" />
                    <Box>
                      <HStack mb={3} gap={2}>
                        <Box color="var(--teal, #0891B2)">
                          <Icon.LuFileImage size={13} />
                        </Box>
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color="var(--text-muted, #64748B)"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          写真
                        </Text>
                      </HStack>
                      <Flex flexWrap="wrap" gap={3}>
                        {allPictures.map((item) => (
                          <Box
                            key={item.url}
                            borderRadius="lg"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="cyan.100"
                            boxShadow="sm"
                          >
                            <Image
                              src={item.url}
                              w="88px"
                              h="88px"
                              objectFit="cover"
                              alt="店舗写真"
                            />
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  </>
                )}
              </Stack>
            </Dialog.Body>

            {/* フッター */}
            <Dialog.Footer
              py={4}
              px={{ base: 5, md: 7 }}
              bg="var(--app-bg, #F0F9FF)"
              borderTop="1px solid"
              borderColor="var(--divider, #F1F5F9)"
              gap={3}
              justifyContent="flex-end"
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  ref={dialogRef}
                  variant="outline"
                  bg="var(--card-bg, #FFFFFF)"
                  color="var(--text-muted, #64748B)"
                  borderWidth="1.5px"
                  borderColor="var(--divider, #F1F5F9)"
                  borderRadius="lg"
                  fontWeight="semibold"
                  px={6}
                  disabled={state.isLoading}
                  _hover={{ bg: "gray.50", borderColor: "cyan.200" }}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={postHander}
                fontWeight="semibold"
                borderRadius="lg"
                px={8}
                color="white"
                style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                boxShadow="0 4px 14px rgba(8,145,178,0.28)"
                _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
                _disabled={{ opacity: 0.6, cursor: "not-allowed", transform: "none" }}
                transition="all 0.2s"
                disabled={state.isLoading}
              >
                {state.isLoading && <Spinner size="sm" mr={2} />}
                {method === "POST" ? "登録する" : "編集する"}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                color="white"
                disabled={state.isLoading}
                _hover={{ bg: "whiteAlpha.300" }}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CheckDialog;
