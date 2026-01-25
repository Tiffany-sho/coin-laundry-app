import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  Flex,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";

const CheckDialog = ({ method, postHander, dialogRef }) => {
  const { state } = useCoinLaundryForm();
  return (
    <Dialog.Root
      w="100%"
      role="alertdialog"
      size="cover"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button variant="solid">
          {method === "POST" && "登録確認"}
          {method === "PUT" && "編集"}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="16px" boxShadow="xl" overflow="hidden">
            <Dialog.Header
              bg="gray.700"
              color="white"
              p={6}
              borderBottom="none"
            >
              <Dialog.Title
                fontSize="2xl"
                fontWeight="bold"
                letterSpacing="wide"
              >
                店舗情報の確認
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body
              p={8}
              bg="gray.50"
              maxH="60vh"
              overflowY="auto"
              css={{
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#e2e8f0",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#cbd5e0",
                  borderRadius: "4px",
                },
              }}
            >
              <Box
                bg="white"
                borderRadius="12px"
                p={5}
                mb={5}
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  店舗名
                </Text>
                <Text fontSize="md" color="gray.800" lineHeight="1.6">
                  {state.store}
                </Text>
              </Box>

              <Box
                bg="white"
                borderRadius="12px"
                p={5}
                mb={5}
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  場所
                </Text>
                <Text fontSize="md" color="gray.800" lineHeight="1.6">
                  {state.location}
                </Text>
              </Box>

              <Box
                bg="white"
                borderRadius="12px"
                p={5}
                mb={5}
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  概要
                </Text>
                <Text fontSize="md" color="gray.800" lineHeight="1.6">
                  {state.description}
                </Text>
              </Box>

              <Box
                bg="white"
                borderRadius="12px"
                p={5}
                mb={5}
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  機械
                </Text>
                {state.machines.length > 0 ? (
                  <Box as="ul" listStyleType="none" p={0} m={0} mt={3}>
                    {state.machines
                      .filter((machine) => machine.num !== 0)
                      .map((machine) => (
                        <Box
                          as="li"
                          key={machine.name}
                          bg="gray.100"
                          p={3}
                          px={4}
                          borderRadius="8px"
                          mb={2}
                          borderLeft="4px solid"
                          borderLeftColor="gray.700"
                          fontSize="15px"
                          color="gray.800"
                          transition="all 0.2s"
                          _hover={{ bg: "gray.200" }}
                        >
                          <Flex justifyContent="space-between">
                            <div>
                              {machine.name} : {machine.num}個
                            </div>
                            {machine.comment && (
                              <div>価格帯 : {machine.comment}</div>
                            )}
                          </Flex>
                        </Box>
                      ))}
                  </Box>
                ) : (
                  <Text
                    color="gray.400"
                    fontStyle="italic"
                    fontSize="sm"
                    py={3}
                  >
                    登録された機械はありません
                  </Text>
                )}
              </Box>

              {state.existingPictures.length > 0 && (
                <Box
                  bg="white"
                  borderRadius="12px"
                  p={5}
                  mb={5}
                  boxShadow="sm"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.600"
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    写真
                  </Text>
                  <Flex flexWrap="wrap" gap={3} mt={3}>
                    {state.existingPictures.map((item) => (
                      <Box
                        key={item.url}
                        position="relative"
                        borderRadius="8px"
                        overflow="hidden"
                        boxShadow="sm"
                        transition="all 0.2s"
                        _hover={{ transform: "scale(1.05)", boxShadow: "md" }}
                      >
                        <Image
                          src={item.url}
                          w="80px"
                          h="80px"
                          objectFit="cover"
                          alt="店舗写真"
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}

              {state.newPictures.length > 0 && (
                <Box
                  bg="white"
                  borderRadius="12px"
                  p={5}
                  mb={5}
                  boxShadow="sm"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.600"
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    追加写真
                  </Text>
                  <Flex flexWrap="wrap" gap={3} mt={3}>
                    {state.newPictures.map((item) => (
                      <Box
                        key={item.url}
                        position="relative"
                        borderRadius="8px"
                        overflow="hidden"
                        boxShadow="sm"
                        transition="all 0.2s"
                        _hover={{ transform: "scale(1.05)", boxShadow: "md" }}
                      >
                        <Image
                          src={item.url}
                          w="80px"
                          h="80px"
                          objectFit="cover"
                          alt="追加写真"
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}
            </Dialog.Body>

            <Dialog.Footer
              p={5}
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              gap={3}
              justifyContent="flex-end"
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  ref={dialogRef}
                  minW="100px"
                  fontWeight="semibold"
                  transition="all 0.2s"
                  disabled={state.isLoading}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={postHander}
                minW="100px"
                bg="gray.700"
                color="white"
                fontWeight="semibold"
                transition="all 0.2s"
                _hover={{ bg: "gray.800" }}
                disabled={state.isLoading}
              >
                {state.isLoading && <Spinner size="sm" mr={2} />}
                {method === "POST" && "登録"}
                {method === "PUT" && "編集"}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={6}
                right={6}
                color="white"
                opacity={0.9}
                transition="opacity 0.2s"
                _hover={{ opacity: 1 }}
                disabled={state.isLoading}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CheckDialog;
