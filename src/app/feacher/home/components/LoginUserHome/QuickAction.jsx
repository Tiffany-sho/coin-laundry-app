import { Box, Button, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import QuickActionDialog from "./QuickActionDialog";

const QuickAction = () => {
  return (
    <Box>
      <Heading size={{ base: "md", md: "lg" }} color="gray.800" mb={3}>
        クイックアクション
      </Heading>

      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap={{ base: 2, md: 3 }}
      >
        <QuickActionDialog method="collect" />
        <QuickActionDialog method="stock" />
        <QuickActionDialog method="store" />
        <QuickActionDialog method="report" />
      </Grid>
    </Box>
  );
};

export default QuickAction;
