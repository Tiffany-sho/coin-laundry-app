import { HStack, Checkbox, Text } from "@chakra-ui/react";

const FixSwitch = ({ toggleChangeFixed, fixed }) => {
  return (
    <Checkbox.Root
      checked={fixed}
      onCheckedChange={toggleChangeFixed}
      size="sm"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control
        borderColor="gray.300"
        _checked={{
          bg: "blue.500",
          borderColor: "blue.500",
        }}
      />
      <Checkbox.Label fontSize="sm" color="gray.600" fontWeight="medium">
        この状態に固定
      </Checkbox.Label>
    </Checkbox.Root>
  );
};

export default FixSwitch;
