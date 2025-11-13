import { createNowData } from "@/date";
import { Clipboard, IconButton } from "@chakra-ui/react";

const DataClipBoard = ({ data }) => {
  const copyText = `
  ${data.laundryName}店\n${createNowData(data.date)}\n${data.fundsArray.map(
    (item) => {
      return `${item.name}:${item.funds * 100}`;
    }
  )}\n合計:¥${data.totalFunds * 100}
  `.replaceAll(",", "\n");
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
