import { Select, Portal, Stack, createListCollection } from "@chakra-ui/react";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { useEffect, useState } from "react";

const frameworks = createListCollection({
  items: [
    { label: "新しい順", value: "newer" },
    { label: "古い順", value: "older" },
    { label: "売上が多い順", value: "fundsUpper" },
    { label: "売上が少ない順", value: "fundsDown" },
  ],
});

const OrderSelecter = () => {
  const { setOrderAmount, setUpOrder } = useUploadPage();
  const [order, setOrder] = useState(["newer"]);
  useEffect(() => {
    switch (order[0]) {
      case "newer":
        setOrderAmount("date");
        setUpOrder(false);
        break;
      case "older":
        setOrderAmount("date");
        setUpOrder(true);
        break;
      case "fundsUpper":
        setOrderAmount("totalFunds");
        setUpOrder(false);
        break;
      case "fundsDown":
        setOrderAmount("totalFunds");
        setUpOrder(true);
        break;
    }
  }, [order]);
  return (
    <Select.Root
      collection={frameworks}
      size="sm"
      width="200px"
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
