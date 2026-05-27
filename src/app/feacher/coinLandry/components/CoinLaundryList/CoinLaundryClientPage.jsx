"use client";

import { useState, useMemo } from "react";
import { Box, Container, Flex, Text, VStack, Heading, Button } from "@chakra-ui/react";
import Link from "next/link";
import CoinLaundryList from "./CoinLaundryList";
import AddBtn from "./AddBtn";
import SearchBox from "../SearchBox";

const EmptyStoresState = () => (
  <Box bg="var(--card-bg, #FFFFFF)" p={12} borderRadius="18px" textAlign="center" boxShadow="var(--shadow-sm)">
    <Heading size="lg" color="var(--text-muted, #64748B)" fontWeight="medium" mb={2}>
      店舗がありません
    </Heading>
    <Text color="var(--text-faint, #94A3B8)" fontSize="sm">
      右下のボタンから新しい店舗を追加できます
    </Text>
  </Box>
);

const NoResultsState = ({ query }) => (
  <Box bg="var(--card-bg, #FFFFFF)" p={12} borderRadius="18px" textAlign="center" boxShadow="var(--shadow-sm)">
    <Heading size="lg" color="var(--text-muted, #64748B)" fontWeight="medium" mb={2}>
      「{query}」に一致する店舗がありません
    </Heading>
    <Text color="var(--text-faint, #94A3B8)" fontSize="sm">
      別のキーワードで検索してみてください
    </Text>
  </Box>
);

const PlanLimitBanner = ({ storeCount, storeLimit }) => (
  <Box
    bg="orange.50"
    border="1px solid"
    borderColor="orange.200"
    borderRadius="lg"
    p={4}
  >
    <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
      <Text fontSize="sm" color="orange.800" fontWeight="medium">
        店舗数が上限（{storeCount}/{storeLimit}）に達しています。アップグレードで追加登録できます。
      </Text>
      <Link href="/settings/plan">
        <Button size="xs" colorPalette="orange" variant="outline">
          プランを見る
        </Button>
      </Link>
    </Flex>
  </Box>
);

const CoinLaundryClientPage = ({ stores, myRole, planInfo }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const atLimit = planInfo !== null &&
    planInfo.storeLimit !== null &&
    planInfo.storeCount >= planInfo.storeLimit;

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = searchQuery.toLowerCase();
    return stores.filter(
      (store) =>
        store.store.toLowerCase().includes(q) ||
        store.location.toLowerCase().includes(q),
    );
  }, [stores, searchQuery]);

  const countText = useMemo(() => {
    if (stores.length === 0) return "店舗を追加してください";
    if (searchQuery.trim())
      return `${filteredStores.length}件 / 全${stores.length}店舗`;
    return `全${stores.length}店舗`;
  }, [stores.length, filteredStores.length, searchQuery]);

  return (
    <>
      <Box minH="100vh" py={8}>
        <Container maxW="1400px" px={{ base: 4, md: 6 }}>
          <VStack gap={6} mb={8} align="stretch">
            {atLimit && myRole === "admin" && (
              <PlanLimitBanner
                storeCount={planInfo.storeCount}
                storeLimit={planInfo.storeLimit}
              />
            )}
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={4}
            >
              <Box>
                <Text color="var(--text-muted, #64748B)" fontSize={{ base: "sm", md: "md" }}>
                  {countText}
                </Text>
              </Box>

              {stores.length > 0 && (
                <SearchBox value={searchQuery} onChange={setSearchQuery} />
              )}
            </Flex>
          </VStack>

          <Box>
            {stores.length === 0 ? (
              <EmptyStoresState />
            ) : filteredStores.length === 0 ? (
              <NoResultsState query={searchQuery} />
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
                {filteredStores.map((item) => (
                  <CoinLaundryList
                    coinLaundry={item}
                    key={item.id}
                    myRole={myRole}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
      {myRole !== "viewer" && <AddBtn atLimit={atLimit} />}
    </>
  );
};

export default CoinLaundryClientPage;
