import {
  getStore,
  getStores,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { SearchBox } from "@/app/feacher/coinLandry/components/CoinLaundryList";
import MonoCard from "@/app/feacher/coinLandry/components/MonoCoinLaundry/MonoCard";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { Box, Container, Flex, Text, VStack } from "@chakra-ui/react";

const CoinLaundry = async ({ params }) => {
  const { id } = await params;
  const { data: store, error: storeError } = await getStore(id);
  const { data: stores, error: storesError } = await getStores();
  if (storeError || storesError)
    return <ErrorPage title={error.msg} status={error.status} />;

  const selectItems = stores.map((item) => {
    const newItem = {
      label: `${item.store} (${item.location})`,
      value: item.id,
    };
    return newItem;
  });

  return (
    <Container maxW="1400px" p={{ base: 4, md: 6 }}>
      <VStack gap={6} align="stretch">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          {stores.length > 0 && <SearchBox selectItems={selectItems} />}
        </Flex>
      </VStack>

      <MonoCard coinLaundry={store} />
    </Container>
  );
};

export default CoinLaundry;
