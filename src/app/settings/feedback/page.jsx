import { Box } from "@chakra-ui/react";
import FeedbackForm from "@/app/feacher/settings/components/FeedbackForm";

export const metadata = {
  title: "フィードバック",
};

export default function FeedbackPage() {
  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <FeedbackForm />
    </Box>
  );
}
