import { Select,Portal,Stack,createListCollection } from "@chakra-ui/react";

const frameworks = createListCollection({
  items: [
    { label: "新しい順", value: "newer" },
    { label: "古い順", value: "older" },
    { label: "売上順", value: "income" },
  ],
});

const OrderSelecter = ({setOrder}) => {
  return (
    <Select.Root
      collection={frameworks}
      size="sm"
      width="120px"
      ml="auto"
      defaultValue={["newer"]}
      onValueChange={(e) => setOrder(e.value)}
    >
      <Select.HiddenSelect />
      <Select.Label>並び替え</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="新しい順" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {frameworks.items.map((framework) => (
              <Select.Item item={framework} key={framework.value}>
                <Stack gap="0">
                  <Select.ItemText>{framework.label}</Select.ItemText>
                </Stack>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default OrderSelecter;
