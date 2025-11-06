import * as CoinLaundry from "@/app/feacher/coinLandry/components/CoinLaundryList/index";
import { Heading, Box, Container } from "@chakra-ui/react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

import { createClient } from "@/utils/supabase/server";

async function getData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  return (
    <>
      <Box
        minH="100vh"
        bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
        py={8}
      >
        <Container maxW="1400px" px={{ base: 4, md: 6 }}>
          <Heading
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            color="gray.700"
            letterSpacing="tight"
            mb={8}
          >
            集金店舗一覧
          </Heading>

          <Box>
            {datas.length === 0 ? (
              <Box
                bg="white"
                p={12}
                borderRadius="16px"
                textAlign="center"
                boxShadow="md"
              >
                <Heading size="lg" color="gray.500" fontWeight="medium">
                  店舗がありません
                </Heading>
              </Box>
            ) : (
              datas.map((data) => {
                return (
                  <CoinLaundry.CoinLaundryList
                    coinLaundry={data}
                    key={data.id}
                    valiant="view"
                  />
                );
              })
            )}
          </Box>
        </Container>
      </Box>
      <CoinLaundry.AddBtn />
    </>
  );
};

export default Page;
