export const dynamic = "force-dynamic";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import OrganizationSettings from "@/app/feacher/account/components/organizationSettings/OrganizationSettings";
import * as Icon from "@/app/feacher/Icon";

export default async function OrganizationEditPage() {
  const { user } = await getUser();
  const [{ data: profile }, { data: org }] = await Promise.all([
    getProfile(),
    getMyOrganization(),
  ]);

  if (org?.myRole !== "admin") redirect("/settings");

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={6}>
        <Heading as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="var(--teal-deeper)">
          組織管理
        </Heading>
        <Link href="/settings">
          <HStack gap={1} color="var(--text-muted)" fontSize="sm" cursor="pointer"
            _hover={{ color: "var(--text-main)" }}>
            <Icon.LuChevronLeft size={16} />
            <Text>戻る</Text>
          </HStack>
        </Link>
      </HStack>

      <Box bg="var(--card-bg, #FFFFFF)" borderRadius="xl" boxShadow="var(--shadow-sm)"
        border="1px solid" borderColor="cyan.100" p={{ base: 5, md: 6 }}>
        <OrganizationSettings
          currentUserId={user?.id}
          currentUsername={profile?.username || profile?.full_name || "オーナー"}
        />
      </Box>
    </Box>
  );
}
