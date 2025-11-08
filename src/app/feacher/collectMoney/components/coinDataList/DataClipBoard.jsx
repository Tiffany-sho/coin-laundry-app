import { createNowData } from "@/date";
import { Clipboard, IconButton } from "@chakra-ui/react";

const DataClipBoard = ({ data }) => {
  const copyText = `
  ${data.laundryName}店\n${createNowData(data.date)}\n${data.fundsArray.map(
    (item) => {
      return `${item.name}:${item.funds}\n`;
    }
  )}\n合計:${data.fundsArray.reduce((accumulator, currentValue) => {
    return accumulator + parseInt(currentValue.funds);
  }, 0)}
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
