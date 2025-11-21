import * as CoinLaundry from "@/app/feacher/coinLandry/components/CoinLaundryList/index";
import { Heading, Box, Container, Flex, Text, VStack } from "@chakra-ui/react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { createClient } from "@/utils/supabase/server";
import { getUser } from "../api/supabaseFunctions/supabaseDatabase/user/action";

async function getData() {
  const supabase = await createClient();
  const { user } = await getUser();

  try {
    if (!user) {
      return {
        error: { msg: "Unauthorized", status: 401 },
      };
    }
    const { data: coinLaundryStores, error } = await supabase
      .from("laundry_store")
      .select("*")
      .eq("owner", user.id);

    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }

    return { datas: coinLaundryStores };
  } catch (err) {
    return {
      error: { msg: "予期しないエラー", status: 400 },
    };
  }
}

const Page = async () => {
  const { datas, error } = await getData();
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  const selectItems = datas.map((data) => {
    const newItem = {
      label: `${data.store} (${data.location})`,
      value: data.id,
    };
    return newItem;
  });

  return (
    <>
      <Box minH="100vh" py={8}>
        <Container maxW="1400px" px={{ base: 4, md: 6 }}>
          <VStack gap={6} mb={8} align="stretch">
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={4}
            >
              <Box>
                <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                  {datas.length > 0
                    ? `全${datas.length}店舗`
                    : "店舗を追加してください"}
                </Text>
              </Box>

              {datas.length > 0 && (
                <CoinLaundry.SearchBox selectItems={selectItems} />
              )}
            </Flex>
          </VStack>

          <Box>
            {datas.length === 0 ? (
              <Box
                bg="white"
                p={12}
                borderRadius="16px"
                textAlign="center"
                boxShadow="md"
              >
                <Heading size="lg" color="gray.500" fontWeight="medium" mb={2}>
                  店舗がありません
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  右下のボタンから新しい店舗を追加できます
                </Text>
              </Box>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={6}
              >
                {datas.map((data) => {
                  return (
                    <CoinLaundry.CoinLaundryList
                      coinLaundry={data}
                      key={data.id}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
      <CoinLaundry.AddBtn />
    </>
  );
};

export default Page;
