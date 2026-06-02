import { redirect } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { getMyOrgOwnerDetails } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import ResetRoleClient from "./ResetRoleClient";

export default async function ResetRolePage() {
  const { data, error } = await getMyOrgOwnerDetails();

  if (error) {
    redirect("/settings");
  }

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <ResetRoleClient orgDetails={data} />
    </Box>
  );
}
