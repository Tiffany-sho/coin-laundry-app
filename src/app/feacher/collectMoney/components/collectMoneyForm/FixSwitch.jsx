import { HStack, Checkbox, Text } from "@chakra-ui/react";

const FixSwitch = ({ toggleChangeFixed, fixed }) => {
  return (
    <HStack>
      <Checkbox.Root
        checked={fixed}
        onCheckedChange={toggleChangeFixed}
        size="sm"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>この状態に固定</Checkbox.Label>
      </Checkbox.Root>
    </HStack>
  );
};

export default FixSwitch;
