"use client";

import {
  Combobox,
  Portal,
  useFilter,
  useListCollection,
  Box,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const SearchBox = ({ selectItems }) => {
  const router = useRouter();
  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({
    initialItems: selectItems,
    filter: contains,
  });

  return (
    <Box maxW="600px" w="100%">
      <Combobox.Root
        collection={collection}
        onInputValueChange={(e) => filter(e.inputValue)}
        width="100%"
      >
        <Combobox.Control
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          _focusWithin={{
            boxShadow: "lg",
            borderColor: "blue.400",
          }}
        >
          <Combobox.Input
            placeholder="店舗名または住所で検索..."
            px={4}
            py={3}
            fontSize="md"
            _placeholder={{ color: "gray.400" }}
          />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content
              bg="white"
              borderRadius="lg"
              boxShadow="xl"
              maxH="300px"
              overflowY="auto"
            >
              <Combobox.Empty p={4} color="gray.500" textAlign="center">
                該当店舗が見つかりませんでした
              </Combobox.Empty>
              {collection.items.map((item) => (
                <Combobox.Item
                  item={item}
                  key={item.value}
                  cursor="pointer"
                  _hover={{
                    bg: "blue.50",
                  }}
                  _selected={{
                    bg: "blue.100",
                  }}
                  onClick={() => {
                    router.push(`/coinLaundry/${item.value}`);
                  }}
                >
                  {item.label}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Box>
  );
};

export default SearchBox;
