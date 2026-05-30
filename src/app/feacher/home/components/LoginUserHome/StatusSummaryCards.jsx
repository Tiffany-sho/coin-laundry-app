import { getStockStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { getMachinesStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { Box, Grid, GridItem, HStack, VStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

function StatusCard({ href, icon, label, hasError, hasProblem, problemCount, storeNames }) {
  const isAlert = hasError || hasProblem;

  return (
    <Link href={href} style={{ display: "block", height: "100%" }}>
      <Box
        bg={isAlert ? "orange.50" : "var(--teal-pale, #CFFAFE)"}
        border="1px solid"
        borderColor={isAlert ? "orange.200" : "cyan.200"}
        borderRadius="xl"
        px={3}
        py={3}
        cursor="pointer"
        _hover={{ opacity: 0.82 }}
        transition="all 0.2s"
        h="full"
      >
        <HStack gap={2} align="center">
          <Box
            bg={isAlert ? "orange.400" : "var(--teal, #0891B2)"}
            color="white"
            borderRadius="full"
            p={1.5}
            flexShrink={0}
          >
            {icon}
          </Box>
          <VStack align="start" gap={0.5} flex={1} overflow="hidden">
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={isAlert ? "orange.500" : "var(--text-muted, #64748B)"}
            >
              {label}
            </Text>
            {hasError ? (
              <Text fontSize="xs" color="red.500" fontWeight="bold">取得失敗</Text>
            ) : hasProblem ? (
              <>
                <Text fontSize="sm" fontWeight="bold" color="orange.700" lineHeight={1.2}>
                  {problemCount}店舗 要対応
                </Text>
                {storeNames.length > 0 && (
                  <Text fontSize="xs" color="orange.400" truncate>
                    {storeNames.slice(0, 2).join("・")}
                    {storeNames.length > 2 ? ` +${storeNames.length - 2}` : ""}
                  </Text>
                )}
              </>
            ) : (
              <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper, #155E75)" lineHeight={1.2}>
                問題なし
              </Text>
            )}
          </VStack>
          <Box color={isAlert ? "orange.300" : "cyan.300"} flexShrink={0}>
            <Icon.LuChevronRight size={14} />
          </Box>
        </HStack>
      </Box>
    </Link>
  );
}

const StatusSummaryCards = async () => {
  const [stockResult, machinesResult] = await Promise.all([
    getStockStates(),
    getMachinesStates(),
  ]);

  const lowStockItems = stockResult.lowStockItems ?? [];
  const breakMachines = machinesResult.breakMachines ?? [];

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
      <GridItem>
        <StatusCard
          href="/equipment"
          icon={<Icon.LuWrench size={16} />}
          label="設備状況"
          hasError={!!machinesResult.error}
          hasProblem={breakMachines.length > 0}
          problemCount={breakMachines.length}
          storeNames={breakMachines.map((s) => s.laundryName).filter(Boolean)}
        />
      </GridItem>
      <GridItem>
        <StatusCard
          href="/inventory"
          icon={<Icon.LuPackage size={16} />}
          label="在庫状況"
          hasError={!!stockResult.error}
          hasProblem={lowStockItems.length > 0}
          problemCount={lowStockItems.length}
          storeNames={lowStockItems.map((s) => s.laundryName).filter(Boolean)}
        />
      </GridItem>
    </Grid>
  );
};

export default StatusSummaryCards;
