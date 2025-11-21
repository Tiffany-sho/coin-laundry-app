import * as CoinLaundry from "@/app/feacher/coinLandry/components/CoinLaundryList/index";
import { Heading, Box, Container, Flex, Text, VStack } from "@chakra-ui/react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { getStores } from "../api/supabaseFunctions/supabaseDatabase/laundryStore/action";

const Page = async () => {
  const { data, error } = await getStores();
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  const selectItems = data.map((item) => {
    const newItem = {
      label: `${item.store} (${item.location})`,
      value: item.id,
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
                  {data.length > 0
                    ? `全${data.length}店舗`
                    : "店舗を追加してください"}
                </Text>
              </Box>

              {data.length > 0 && (
                <CoinLaundry.SearchBox selectItems={selectItems} />
              )}
            </Flex>
          </VStack>

          <Box>
            {data.length === 0 ? (
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
                {data.map((item) => {
                  return (
                    <CoinLaundry.CoinLaundryList
                      coinLaundry={item}
                      key={item.id}
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
