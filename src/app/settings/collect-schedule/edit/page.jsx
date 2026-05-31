export const dynamic = "force-dynamic";

import { Box, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "@chakra-ui/react";
import { getCollectSchedule } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import CollectScheduleCard from "@/app/feacher/settings/components/CollectScheduleCard";
import * as Icon from "@/app/feacher/Icon";

export default async function CollectScheduleEditPage() {
  const { data: schedule } = await getCollectSchedule();

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack mb={6}>
        <Link href="/settings">
          <Button variant="ghost" size="sm" colorPalette="cyan" borderRadius="full">
            <Icon.LuArrowLeft size={14} />
            設定に戻る
          </Button>
        </Link>
      </HStack>
      <CollectScheduleCard schedule={schedule} />
    </Box>
  );
}
