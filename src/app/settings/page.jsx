export const dynamic = "force-dynamic";

import { Box, VStack, HStack, Heading } from "@chakra-ui/react";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { getMyOrganization, getOrgPlan, getCollectSchedule } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import AccountInfoCard from "@/app/feacher/settings/components/AccountInfoCard";
import OrgInfoCard from "@/app/feacher/settings/components/OrgInfoCard";
import AppSettingsCard from "@/app/feacher/settings/components/AppSettingsCard";
import OtherActionsCard from "@/app/feacher/settings/components/OtherActionsCard";
import FeedbackCard from "@/app/feacher/settings/components/FeedbackCard";
import PlanCard from "@/app/feacher/settings/components/PlanCard";
import CheckoutSuccessBanner from "@/app/feacher/settings/components/CheckoutSuccessBanner";
import CollectScheduleDisplay from "@/app/feacher/settings/components/CollectScheduleDisplay";
import JoinOrgForm from "@/app/feacher/settings/components/JoinOrgForm";
import * as Icon from "@/app/feacher/Icon";

export default async function SettingsPage({ searchParams }) {
  const params = await searchParams;
  const checkoutSuccess = params?.checkout === "success";

  const { user } = await getUser();
  const [{ data: profile }, { data: org }, { data: planInfo }, { data: schedule }] = await Promise.all([
    getProfile(),
    getMyOrganization(),
    getOrgPlan(),
    getCollectSchedule(),
  ]);

  const hasOrg = !!org?.id;
  const isAdmin = org?.myRole === "admin";

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack gap={3} mb={6}>
        <Icon.LuSettings size={24} color="var(--teal)" />
        <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
          設定
        </Heading>
      </HStack>

      <VStack align="stretch" gap={4}>
        {checkoutSuccess && <CheckoutSuccessBanner />}
        <AccountInfoCard user={user} profile={profile} myRole={org?.myRole} plan={planInfo?.plan} />

        {/* 組織未所属ユーザー向け参加フォーム */}
        {!hasOrg && <JoinOrgForm />}

        {/* 管理者向け組織管理 */}
        {isAdmin && <OrgInfoCard org={org} />}
        {isAdmin && planInfo && <PlanCard planInfo={planInfo} />}
        {isAdmin && <CollectScheduleDisplay schedule={schedule} />}

        <AppSettingsCard collectMethod={profile?.collectMethod} />
        <FeedbackCard />
        <OtherActionsCard />
      </VStack>
    </Box>
  );
}
