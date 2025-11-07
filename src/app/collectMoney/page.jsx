import Link from "next/link";
import CoinLaundryList from "@/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryList";
import { Heading, Button, Box, Container, Flex } from "@chakra-ui/react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

import CoinLaundryStore from "@/models/coinLaundryStore";
import { createClient } from "@/utils/supabase/server";
import dbConnect from "@/lib/dbConnect";

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
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      py={8}
    >
      <Container maxW="1400px" px={{ base: 4, md: 6 }}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={8}
          gap={4}
        >
          <Heading
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            color="gray.700"
            letterSpacing="tight"
          >
            集金店舗一覧
          </Heading>

          <Link href={"/collectMoney/coinDataList"}>
            <Button
              size={{ base: "md", md: "lg" }}
              bg="gray.700"
              color="white"
              fontWeight="bold"
              px={8}
              transition="all 0.2s"
              borderRadius="8px"
              w={{ base: "full", md: "auto" }}
            >
              売上一覧へ
            </Button>
          </Link>
        </Flex>

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
                <CoinLaundryList
                  coinLaundry={data}
                  key={data.id}
                  valiant="collect"
                />
              );
            })
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Page;
