export const dynamic = "force-dynamic";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
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
      <HStack justify="space-between" mb={8}>
        <HStack gap={3}>
          <Icon.LuCreditCard size={24} color="var(--teal)" />
          <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
            プラン選択
          </Heading>
        </HStack>
        <Link href="/settings">
          <HStack gap={1} color="var(--text-muted)" fontSize="sm" cursor="pointer"
            _hover={{ color: "var(--text-main)" }}>
            <Icon.LuChevronLeft size={16} />
            <Text>戻る</Text>
          </HStack>
        </Link>
      </HStack>

      <PlanGrid
        currentPlan={planInfo?.plan ?? "free"}
        stripeCustomerId={planInfo?.stripeCustomerId ?? null}
      />
    </Box>
  );
}
