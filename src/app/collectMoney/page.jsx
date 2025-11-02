import Link from "next/link";
import CoinLaundryList from "@/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryList";
import { Heading, Button, Box, Container, Flex } from "@chakra-ui/react";

async function fetcher() {
  const res = await fetch(`http://localhost:3000/api/coinLaundry`);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

const Page = async () => {
  const datas = await fetcher();

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
                  key={data._id}
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
