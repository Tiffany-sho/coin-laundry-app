import {
  Box,
  Button,
  CloseButton,
  Dialog,
  GridItem,
  Portal,
  Text,
  VStack,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import Link from "next/link";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { useEffect, useState } from "react";

const ChangeStores = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getFunc = async () => {
      const { data, error } = await getStores();
      if (error) {
        setError(true);
      }
      setData(data);
    };
    getFunc();
    setLoading(false);
  }, []);

  const methodArray = {
    btnTitle: "店舗切り替え",
    dialogTitle: "集金データを見たい店舗を選択してください",
    getURL: function (id) {
      return `/coinLaundry/${id}/coinDataList`;
    },
  };

  if (error) return <Text>エラー発生</Text>;
  if (loading) return <Spinner />;

  return (
    <Dialog.Root placement="center">
      <Dialog.Trigger asChild>
        <GridItem>
          <Button
            w="full"
            border="1px solid"
            borderRadius="full"
            boxShadow="sm"
          >
            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
              {methodArray.btnTitle}
            </Text>
          </Button>
        </GridItem>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="xl"
            maxW={{ base: "90%", md: "md" }}
            bg="white"
            boxShadow="2xl"
            overflow="hidden"
          >
            <Dialog.Header
              bg="blue.50"
              borderBottom="1px solid"
              borderColor="blue.100"
              p={{ base: 4, md: 6 }}
            >
              <Heading
                size={{ base: "md", md: "lg" }}
                color="blue.900"
                fontWeight="bold"
              >
                {methodArray.dialogTitle}
              </Heading>
            </Dialog.Header>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={{ base: 3, md: 4 }}
                right={{ base: 3, md: 4 }}
                bg="white"
                borderRadius="full"
                boxShadow="sm"
                _hover={{ bg: "blue.50", transform: "scale(1.1)" }}
                transition="all 0.2s"
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={{ base: 4, md: 6 }}>
              {!data || data.length === 0 ? (
                <Text
                  size={{ base: "md", md: "lg" }}
                  color="blue.900"
                  fontWeight="bold"
                >
                  店舗がありません
                </Text>
              ) : (
                <VStack align="stretch" gap={3}>
                  <Link
                    key={"total"}
                    href={"/collectMoney"}
                    style={{ width: "100%" }}
                  >
                    <Box
                      p={4}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      bg="white"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: "blue.50",
                        borderColor: "blue.300",
                        transform: "translateX(4px)",
                        boxShadow: "md",
                      }}
                    >
                      <Text
                        fontSize={{ base: "sm", md: "md" }}
                        fontWeight="semibold"
                        color="gray.800"
                      >
                        全{data.length}店舗
                      </Text>
                    </Box>
                  </Link>
                  {data.map((item) => {
                    return (
                      <Link
                        key={item.id}
                        href={`${methodArray.getURL(item.id)}`}
                        style={{ width: "100%" }}
                      >
                        <Box
                          p={4}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="gray.200"
                          bg="white"
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{
                            bg: "blue.50",
                            borderColor: "blue.300",
                            transform: "translateX(4px)",
                            boxShadow: "md",
                          }}
                        >
                          <Text
                            fontSize={{ base: "sm", md: "md" }}
                            fontWeight="semibold"
                            color="gray.800"
                          >
                            {item.store}店
                          </Text>
                        </Box>
                      </Link>
                    );
                  })}
                </VStack>
              )}
            </Dialog.Body>

            <Dialog.Footer
              borderTop="1px solid"
              borderColor="gray.100"
              p={{ base: 4, md: 6 }}
              bg="gray.50"
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  size={{ base: "md", md: "lg" }}
                  borderRadius="lg"
                  px={6}
                  _hover={{
                    bg: "gray.100",
                  }}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ChangeStores;
