export const dynamic = "force-dynamic";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import Log from "@/app/feacher/account/components/logList/Log";
import * as Icon from "@/app/feacher/Icon";

export default async function SettingsLogPage() {
  const { user } = await getUser();
  const { data: org } = await getMyOrganization();

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={6}>
        <Heading as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="var(--teal-deeper)">
          アクションログ
        </Heading>
        <Link href="/settings">
          <HStack gap={1} color="var(--text-muted)" fontSize="sm" cursor="pointer"
            _hover={{ color: "var(--text-main)" }}>
            <Icon.LuChevronLeft size={16} />
            <Text>戻る</Text>
          </HStack>
        </Link>
      </HStack>

      {org?.id
        ? <Log orgId={org.id} currentUserId={user.id} />
        : <Log userId={user.id} currentUserId={user.id} />
      }
    </Box>
  );
}
