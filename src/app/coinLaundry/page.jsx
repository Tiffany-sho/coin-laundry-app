import * as CoinLaundry from "@/app/feacher/coinLandry/components/CoinLaundryList/index";
import { Heading, Box, Container } from "@chakra-ui/react";

async function fetcher() {
  const res = await fetch(`http://localhost:3000/api/coinLaundry`);

  if (!res.ok) {
    const errorRes = await res.json();
    return {
      title: errorRes.msg,
      result: errorRes.result,
      status: res.status,
    };
  }
  return res.json();
}

const Page = async () => {
  const datas = await fetcher();
  if (datas.result === "failure")
    return <ErrorPage title={datas.title} status={datas.status} />;

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
                    key={data._id}
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
