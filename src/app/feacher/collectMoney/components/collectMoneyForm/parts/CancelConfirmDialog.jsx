import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";

const CancelConfirmDialog = ({ onSaveAndLeave, onLeave }) => {
  return (
    <Dialog.Root role="alertdialog" placement="center" motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          size="lg"
          bg="white"
          color="gray.700"
          fontWeight="semibold"
          px={{ base: 6, md: 8 }}
          borderWidth="2px"
          borderColor="gray.300"
          borderRadius="xl"
          flex={{ base: 1, sm: "unset" }}
          _hover={{
            bg: "gray.50",
            borderColor: "gray.400",
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
            borderRadius="2xl"
            boxShadow="2xl"
            maxW="400px"
            mx={4}
            overflow="hidden"
          >
            <Dialog.Header bg="gray.800" color="white" py={5} px={6}>
              <Dialog.Title fontSize="lg" fontWeight="bold">
                入力データの一時保存
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body py={6} px={6}>
              <Text fontSize="md" color="gray.700">
                入力中のデータを一時保存しますか？
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                保存しない場合、入力内容は失われます。
              </Text>
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
                    borderRadius="xl"
                    onClick={onLeave}
                    _hover={{ bg: "gray.100", borderColor: "gray.400" }}
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
