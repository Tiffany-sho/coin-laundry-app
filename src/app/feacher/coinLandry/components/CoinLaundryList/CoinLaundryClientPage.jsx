"use client";

import { useState, useMemo } from "react";
import { Box, Container, Flex, Text, VStack, Heading } from "@chakra-ui/react";
import CoinLaundryList from "./CoinLaundryList";
import AddBtn from "./AddBtn";
import SearchBox from "../SearchBox";

const EmptyStoresState = () => (
  <Box bg="white" p={12} borderRadius="18px" textAlign="center" boxShadow="var(--shadow-sm)">
    <Heading size="lg" color="var(--text-muted, #64748B)" fontWeight="medium" mb={2}>
      店舗がありません
    </Heading>
    <Text color="var(--text-faint, #94A3B8)" fontSize="sm">
      右下のボタンから新しい店舗を追加できます
    </Text>
  </Box>
);

const NoResultsState = ({ query }) => (
  <Box bg="white" p={12} borderRadius="18px" textAlign="center" boxShadow="var(--shadow-sm)">
    <Heading size="lg" color="var(--text-muted, #64748B)" fontWeight="medium" mb={2}>
      「{query}」に一致する店舗がありません
    </Heading>
    <Text color="var(--text-faint, #94A3B8)" fontSize="sm">
      別のキーワードで検索してみてください
    </Text>
  </Box>
);

const CoinLaundryClientPage = ({ stores, myRole }) => {
  const [searchQuery, setSearchQuery] = useState("");

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
      {myRole !== "viewer" && <AddBtn />}
    </>
  );
};

export default CoinLaundryClientPage;
