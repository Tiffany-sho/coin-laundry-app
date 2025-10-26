import { createNowData } from "@/date";
import { Clipboard, IconButton } from "@chakra-ui/react";

const DataClipBoard = ({ data }) => {
  const copyText = `
  ${data.store}店\n${createNowData(data.date)}\n${data.moneyArray.map(
    (item) => {
      return `${item.machine.name}:${item.money}\n`;
    }
  )}
  `;
  return (
    <Clipboard.Root value={copyText}>
      <Clipboard.Trigger asChild>
        <IconButton variant="surface" size="xs">
          <Clipboard.Indicator />
        </IconButton>
      </Clipboard.Trigger>
    </Clipboard.Root>
  );
};

export default DataClipBoard;
