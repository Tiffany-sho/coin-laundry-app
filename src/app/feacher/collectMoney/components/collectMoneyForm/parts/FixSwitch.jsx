import { Checkbox } from "@chakra-ui/react";

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
          bg: "var(--teal, #0891B2)",
          borderColor: "var(--teal, #0891B2)",
        }}
      />
      <Checkbox.Label fontSize="sm" color="var(--text-muted, #64748B)" fontWeight="medium">
        この状態に固定
      </Checkbox.Label>
    </Checkbox.Root>
  );
};

export default FixSwitch;
