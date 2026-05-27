export const dynamic = "force-dynamic";

import { Box, VStack, HStack, Heading } from "@chakra-ui/react";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { getMyOrganization, getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import AccountInfoCard from "@/app/feacher/settings/components/AccountInfoCard";
import OrgInfoCard from "@/app/feacher/settings/components/OrgInfoCard";
import AppSettingsCard from "@/app/feacher/settings/components/AppSettingsCard";
import OtherActionsCard from "@/app/feacher/settings/components/OtherActionsCard";
import PlanCard from "@/app/feacher/settings/components/PlanCard";
import * as Icon from "@/app/feacher/Icon";

export default async function SettingsPage() {
  const { user } = await getUser();
  const [{ data: profile }, { data: org }, { data: planInfo }] = await Promise.all([
    getProfile(),
    getMyOrganization(),
    getOrgPlan(),
  ]);

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack gap={3} mb={6}>
        <Icon.LuSettings size={24} color="var(--teal)" />
        <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
          設定
        </Heading>
      </HStack>

      <VStack align="stretch" gap={4}>
        <AccountInfoCard user={user} profile={profile} myRole={org?.myRole} />
        {org?.myRole === "admin" && <OrgInfoCard org={org} />}
        {org?.myRole === "admin" && planInfo && <PlanCard planInfo={planInfo} />}
        <AppSettingsCard collectMethod={profile?.collectMethod} />
        <OtherActionsCard />
      </VStack>
    </Box>
  );
}
