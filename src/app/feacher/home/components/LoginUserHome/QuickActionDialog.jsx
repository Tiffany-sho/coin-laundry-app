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
  HStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import NowLaundryNum from "@/app/feacher/coinLandry/components/NowLaundryNum";
import MachinesState from "@/app/feacher/coinLandry/components/MachinesState";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";

const getLaundryId = async () => {
  const { user } = await getUser();

  if (!user) {
    return { error: authError || "ユーザデータの取得に失敗しました" };
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("laundry_store")
    .select("id,store")
    .eq("owner", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: data };
};

const QuickActionDialog = async ({ method }) => {
  const { data, error } = await getLaundryId();
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  const methodArray = [
    {
      key: "collect",
      btnTitle: "集金",
      dialogTitle: "集金したい店舗を選択してください",
      getURL: function (id) {
        return `/collectMoney/${id}/newData`;
      },
      icon: <Icon.PiHandCoinsLight />,
    },
    {
      key: "stock",
      btnTitle: "在庫・設備管理",
      dialogTitle: "店舗を選択すると在庫・設備編集できます",
      getURL: function (id) {
        return `/collectMoney/${id}/newData`;
      },
      icon: <Icon.LuPackage />,
    },
    {
      key: "store",
      btnTitle: "店舗一覧",
      dialogTitle: "店舗を選択すると詳細ページに行きます",
      getURL: function (id) {
        return `/coinLaundry/${id}`;
      },
      icon: <Icon.LiaStoreSolid />,
    },
    {
      key: "report",
      btnTitle: "レポート",
      dialogTitle: "店舗を選択すると集金データを見れます",
      getURL: function (id) {
        return `/coinLaundry/${id}/coinDataList`;
      },
      icon: <Icon.VscGraphLine />,
    },
  ];

  const methodItem = methodArray.find((item) => item.key === method);

  return (
    <Dialog.Root placement="center">
      <Dialog.Trigger asChild>
        <GridItem>
          <Button
            w="full"
            h={{ base: "70px", md: "80px" }}
            flexDirection="column"
            gap={2}
            variant="outline"
            border="1px solid"
            borderColor="gray.200"
            _hover={{
              bg: "blue.50",
              borderColor: "blue.300",
              transform: "translateY(-2px)",
            }}
            transition="all 0.2s"
            boxShadow="sm"
          >
            <Text fontSize={{ base: "2xl", md: "3xl" }}>{methodItem.icon}</Text>
            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
              {methodItem.btnTitle}
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
                {methodItem.dialogTitle}
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
                  {data.map((item) => {
                    return methodItem.key === "stock" ? (
                      <Box key={item.id}>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.700"
                          textAlign="center"
                          my={3}
                        >
                          {item.store}店
                        </Text>
                        <HStack justifyContent="space-around">
                          <NowLaundryNum id={item.id} />
                          <MachinesState id={item.id} />
                        </HStack>
                      </Box>
                    ) : (
                      <Link
                        key={item.id}
                        href={`${methodItem.getURL(item.id)}`}
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

export default QuickActionDialog;
