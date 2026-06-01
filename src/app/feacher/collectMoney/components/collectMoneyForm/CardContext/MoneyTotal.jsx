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
            <Box
              fontWeight="bold"
              fontSize="lg"
              color="var(--teal-deeper, #155E75)"
              bg="var(--teal-pale, #CFFAFE)"
            >
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
            borderColor="var(--divider, #F1F5F9)"
            _focus={{
              borderColor: "var(--teal, #0891B2)",
              boxShadow: "0 0 0 3px rgba(8, 145, 178, 0.15)",
              outline: "none",
            }}
            _hover={{
              borderColor: "cyan.300",
            }}
          />
        </InputGroup>
      </NumberInput.Root>

      {moneyTotal && (
        <Box mt={4} p={4} bg="var(--teal-pale, #CFFAFE)" borderRadius="lg" textAlign="center">
          <Box fontSize="sm" color="var(--teal, #0891B2)" fontWeight="medium" mb={1}>
            入力金額
          </Box>
          <Box fontSize="2xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
            ¥{parseInt(moneyTotal).toLocaleString()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MoneyTotal;
