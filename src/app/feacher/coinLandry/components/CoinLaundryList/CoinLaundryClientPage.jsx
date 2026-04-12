"use client";

import { useState, useMemo } from "react";
import { Box, Container, Flex, Text, VStack, Heading } from "@chakra-ui/react";
import CoinLaundryList from "./CoinLaundryList";
import AddBtn from "./AddBtn";
import SearchBox from "../SearchBox";

const EmptyStoresState = () => (
  <Box bg="white" p={12} borderRadius="16px" textAlign="center" boxShadow="md">
    <Heading size="lg" color="gray.500" fontWeight="medium" mb={2}>
      店舗がありません
    </Heading>
    <Text color="gray.400" fontSize="sm">
      右下のボタンから新しい店舗を追加できます
    </Text>
  </Box>
);

const NoResultsState = ({ query }) => (
  <Box bg="white" p={12} borderRadius="16px" textAlign="center" boxShadow="md">
    <Heading size="lg" color="gray.500" fontWeight="medium" mb={2}>
      「{query}」に一致する店舗がありません
    </Heading>
    <Text color="gray.400" fontSize="sm">
      別のキーワードで検索してみてください
    </Text>
  </Box>
);

const CoinLaundryClientPage = ({ stores, allStates, allBenefits }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const stateMap = useMemo(() => {
    const map = {};
    allStates?.forEach((state) => {
      map[state.laundryId] = state;
    });
    return map;
  }, [allStates]);

  const benefitMap = useMemo(() => {
    const map = {};
    allBenefits?.forEach((record) => {
      if (!map[record.laundryId]) map[record.laundryId] = [];
      map[record.laundryId].push(record);
    });
    return map;
  }, [allBenefits]);

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
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={4}
            >
              <Box>
                <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
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
                    stateData={stateMap[item.id] ?? null}
                    benefitRecords={benefitMap[item.id] ?? []}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
      <AddBtn />
    </>
  );
};

export default CoinLaundryClientPage;
