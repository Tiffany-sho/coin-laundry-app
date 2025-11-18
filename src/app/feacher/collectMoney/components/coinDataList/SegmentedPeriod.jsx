import { SegmentGroup, Box } from "@chakra-ui/react";
import { useUploadPage } from "../../context/UploadPageContext";

const SegmentedPeriod = () => {
  const { period, setPeriod } = useUploadPage();
  return (
    <Box ml="auto">
      <SegmentGroup.Root
        value={period}
        onValueChange={(e) => setPeriod(e.value)}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={["３ヶ月", "１年間", "全期間"]} />
      </SegmentGroup.Root>
    </Box>
  );
};

export default SegmentedPeriod;
