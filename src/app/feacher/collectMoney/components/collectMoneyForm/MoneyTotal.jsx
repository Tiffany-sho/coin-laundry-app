import { InputGroup, NumberInput } from "@chakra-ui/react";

const MoneyTotal = ({ moneyTotal, setMoneyTotal }) => {
  return (
    <NumberInput.Root
      min={0}
      maxW="250px"
      value={moneyTotal}
      onValueChange={(e) => setMoneyTotal(e.value)}
    >
      <NumberInput.Control />
      <InputGroup startAddon="￥">
        <NumberInput.Input
          placeholder="合計金額"
          size="lg"
          fontSize="16px"
          borderColor="gray.300"
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
            outline: "none",
          }}
        />
      </InputGroup>
    </NumberInput.Root>
  );
};

export default MoneyTotal;
