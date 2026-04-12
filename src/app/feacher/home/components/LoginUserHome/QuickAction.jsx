import { Grid } from "@chakra-ui/react";
import QuickActionDialog from "./QuickActionDialog";

const QuickAction = () => {
  return (
    <Grid
      templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
      gap={{ base: 2, md: 3 }}
    >
      <QuickActionDialog method="collect" />
      <QuickActionDialog method="stock" />
      <QuickActionDialog method="store" />
      <QuickActionDialog method="report" />
    </Grid>
  );
};

export default QuickAction;
