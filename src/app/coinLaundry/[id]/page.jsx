import {
  getStore,
  getStores,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { SearchBox } from "@/app/feacher/coinLandry/components/CoinLaundryList";
import MonoCard from "@/app/feacher/coinLandry/components/MonoCoinLaundry/MonoCard";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { Box, Container, Flex, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const CoinLaundry = async ({ params }) => {
  const { id } = await params;
  const [{ data: store, error: storeError }, { data: stores, error: storesError }, { data: orgData }] =
    await Promise.all([getStore(id), getStores(), getMyOrganization()]);
  const error = storeError ?? storesError;
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  const myRole = orgData?.myRole ?? "viewer";

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
          <Link href="/coinLaundry">
            <Flex gap={1} align="center" color="var(--text-muted)" fontSize="sm"
              cursor="pointer" _hover={{ color: "var(--text-main)" }}>
              <Icon.LuChevronLeft size={16} />
              <Text>店舗一覧</Text>
            </Flex>
          </Link>
          {stores.length > 0 && <SearchBox selectItems={selectItems} />}
        </Flex>
      </VStack>

      <MonoCard coinLaundry={store} myRole={myRole} />
    </Container>
  );
};

export default CoinLaundry;
