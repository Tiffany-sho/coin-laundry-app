import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Box,
  Portal,
  Text,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const CancelConfirmDialog = ({ onSaveAndLeave, onLeave }) => {
  return (
    <Dialog.Root role="alertdialog" placement="center" motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          size="lg"
          bg="white"
          color="var(--text-muted, #64748B)"
          fontWeight="semibold"
          px={{ base: 6, md: 8 }}
          borderWidth="2px"
          borderColor="var(--divider, #F1F5F9)"
          borderRadius="xl"
          flex={{ base: 1, sm: "unset" }}
          _hover={{
            bg: "var(--app-bg, #F0F9FF)",
            borderColor: "cyan.200",
            transform: "translateY(-1px)",
          }}
          _active={{ transform: "translateY(0)" }}
          transition="all 0.2s"
        >
          キャンセル
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="20px"
            boxShadow="0 12px 40px rgba(14,116,144,0.18)"
            maxW="400px"
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
                  <Icon.LuCalendar size={20} />
                </Box>
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  入力データの一時保存
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body py={6} px={6}>
              <Text fontSize="md" color="var(--text-main, #1E3A5F)">
                入力中のデータを一時保存しますか？
              </Text>
              <Text fontSize="sm" color="var(--text-muted, #64748B)" mt={2}>
                保存しない場合、入力内容は失われます。
              </Text>
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
                    borderRadius="xl"
                    onClick={onLeave}
                    _hover={{ bg: "var(--app-bg, #F0F9FF)", borderColor: "cyan.200" }}
                  >
                    保存しない
                  </Button>
                </Dialog.ActionTrigger>

                <Dialog.ActionTrigger asChild>
                  <Button
                    size="lg"
                    bg="amber.500"
                    color="white"
                    fontWeight="semibold"
                    px={8}
                    borderRadius="xl"
                    onClick={onSaveAndLeave}
                    _hover={{ bg: "amber.600" }}
                  >
                    保存する
                  </Button>
                </Dialog.ActionTrigger>
              </Flex>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CancelConfirmDialog;
