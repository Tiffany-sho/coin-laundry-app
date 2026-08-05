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
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import Link from "next/link";
import CollectStartButton from "@/app/feacher/collectMoney/components/collectMoneyForm/parts/CollectStartButton";
import StockDialogBody from "./StockDialogBody";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const METHOD_LIST = [
  {
    key: "collect",
    btnTitle: "集金",
    dialogTitle: "集金したい店舗を選択してください",
    getURL: (id) => `/collectMoney/${id}/newData`,
    icon: <Icon.PiHandCoinsLight />,
  },
  {
    key: "stock",
    btnTitle: "在庫・設備管理",
    dialogTitle: "店舗を選択すると在庫・設備編集できます",
    getURL: (id) => `/coinLaundry/${id}`,
    icon: <Icon.LuPackage />,
  },
  {
    key: "store",
    btnTitle: "店舗一覧",
    dialogTitle: "店舗を選択すると詳細ページに行きます",
    getURL: (id) => `/coinLaundry/${id}`,
    icon: <Icon.LiaStoreSolid />,
  },
  {
    key: "report",
    btnTitle: "レポート",
    dialogTitle: "店舗を選択すると集金データを見れます",
    getURL: (id) => `/coinLaundry/${id}/coinDataList`,
    icon: <Icon.VscGraphLine />,
  },
];

const QuickActionDialog = async ({ method }) => {
  const { data, error } = await getStores();
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  const methodItem = METHOD_LIST.find((item) => item.key === method);

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
              bg: "cyan.50",
              borderColor: "cyan.300",
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
            bg="var(--card-bg, #FFFFFF)"
            boxShadow="2xl"
            overflow="hidden"
          >
            <Dialog.Header
              bg="cyan.50"
              borderBottom="1px solid"
              borderColor="cyan.100"
              p={{ base: 4, md: 6 }}
            >
              <Heading
                size={{ base: "md", md: "lg" }}
                color="cyan.900"
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
                bg="var(--card-bg, #FFFFFF)"
                borderRadius="full"
                boxShadow="sm"
                _hover={{ bg: "cyan.50", transform: "scale(1.1)" }}
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
              ) : methodItem.key === "stock" ? (
                <StockDialogBody data={data} />
              ) : (
                <VStack align="stretch" gap={3}>
                  {data.map((item) => {
                    /*
                      ⚠️ **集金だけは行き先が固定できない。** 支払方法がある店舗では
                         「何を集金するか」を先に聞く必要があるので、Link ではなく
                         `CollectStartButton` を通す（入口が 4 か所あり、
                         1 つでも素通しにするとそこだけ既定の both で開く）。
                      ⚠️ このダイアログは開いたまま、上に選択のダイアログが重なる。
                         選ぶと画面遷移するので一緒に消える（ブラウザは iOS と違い
                         モーダルの重ねに制限が無い）。
                    */
                    const Row = (
                      <Box
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="gray.200"
                        bg="var(--card-bg, #FFFFFF)"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{
                          bg: "cyan.50",
                          borderColor: "cyan.300",
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
                    );

                    return methodItem.key === "collect" ? (
                      <CollectStartButton key={item.id} store={item}>
                        {Row}
                      </CollectStartButton>
                    ) : (
                      <Link
                        key={item.id}
                        href={methodItem.getURL(item.id)}
                        style={{ width: "100%" }}
                      >
                        {Row}
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
                  _hover={{ bg: "gray.100" }}
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
