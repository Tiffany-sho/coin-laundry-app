export const dynamic = "force-dynamic";

import { Box, HStack, Heading } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import { getMyOrganization, getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import PlanGrid from "@/app/feacher/settings/components/PlanGrid";
import * as Icon from "@/app/feacher/Icon";

export default async function PlanPage() {
  const [{ data: org }, { data: planInfo }] = await Promise.all([
    getMyOrganization(),
    getOrgPlan(),
  ]);

  if (org?.myRole !== "admin") redirect("/settings");

  return (
    <Box maxW="860px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack gap={3} mb={8}>
        <Icon.LuCreditCard size={24} color="var(--teal)" />
        <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
          プラン選択
        </Heading>
      </HStack>

      <PlanGrid
        currentPlan={planInfo?.plan ?? "free"}
        stripeCustomerId={planInfo?.stripeCustomerId ?? null}
      />
    </Box>
  );
}
