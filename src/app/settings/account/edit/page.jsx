import { Box } from "@chakra-ui/react";
import AccountEditForm from "@/app/feacher/settings/components/AccountEditForm";

export default function AccountEditPage() {
  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <AccountEditForm />
    </Box>
  );
}
