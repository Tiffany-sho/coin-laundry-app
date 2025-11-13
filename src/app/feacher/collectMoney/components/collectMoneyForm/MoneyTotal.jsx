import { InputGroup, NumberInput, Box } from "@chakra-ui/react";

const MoneyTotal = ({ moneyTotal, setMoneyTotal }) => {
  return (
    <Box>
      <NumberInput.Root
        min={0}
        w="full"
        value={moneyTotal}
        onValueChange={(e) => setMoneyTotal(e.value)}
      >
        <NumberInput.Control />
        <InputGroup
          startAddon={
            <Box fontWeight="bold" fontSize="lg" color="gray.700" bg="gray.100">
              ¥
            </Box>
          }
        >
          <NumberInput.Input
            placeholder="合計金額を入力してください"
            size="lg"
            fontSize="16px"
            fontWeight="semibold"
            borderWidth="2px"
            borderColor="gray.300"
            _focus={{
              borderColor: "blue.500",
              boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.15)",
              outline: "none",
            }}
            _hover={{
              borderColor: "gray.400",
            }}
          />
        </InputGroup>
      </NumberInput.Root>

      {moneyTotal && (
        <Box mt={4} p={4} bg="blue.50" borderRadius="lg" textAlign="center">
          <Box fontSize="sm" color="blue.600" fontWeight="medium" mb={1}>
            入力金額
          </Box>
          <Box fontSize="2xl" fontWeight="bold" color="blue.700">
            ¥{parseInt(moneyTotal).toLocaleString()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MoneyTotal;
