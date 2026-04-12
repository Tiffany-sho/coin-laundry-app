"use client";

import { Input, InputGroup, Box } from "@chakra-ui/react";
import { LuSearch } from "@/app/feacher/Icon";

const SearchBox = ({ value, onChange }) => {
  return (
    <Box maxW="600px" w="100%">
      <InputGroup startElement={<LuSearch color="gray" />} w="100%">
        <Input
          placeholder="店舗名または住所で検索..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fontSize="md"
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          _placeholder={{ color: "gray.400" }}
          _focusVisible={{ boxShadow: "lg", borderColor: "blue.400" }}
        />
      </InputGroup>
    </Box>
  );
};

export default SearchBox;
