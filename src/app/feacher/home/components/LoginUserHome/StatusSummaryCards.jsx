import { getStockStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { getMachinesStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { Box, Grid, GridItem, VStack, Text, Badge } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

function StatusCard({ href, icon, label, hasError, hasProblem, problemBadge, problemCount, storeNames }) {
  const isAlert = hasError || hasProblem;

  return (
    <Link href={href} style={{ display: "block", height: "100%" }}>
      <Box
        bg={isAlert ? "orange.50" : "var(--teal-pale, #CFFAFE)"}
        border="1px solid"
        borderColor={isAlert ? "orange.200" : "cyan.200"}
        borderRadius="xl"
        px={3}
        py={5}
        cursor="pointer"
        _hover={{ opacity: 0.82 }}
        transition="all 0.2s"
        textAlign="center"
        h="full"
        minH="140px"
      >
        <VStack align="center" gap={2}>
          <Box
            bg={isAlert ? "orange.400" : "var(--teal, #0891B2)"}
            color="white"
            borderRadius="full"
            p={2}
          >
            {icon}
          </Box>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            color={isAlert ? "orange.700" : "var(--teal-deeper, #155E75)"}
          >
            {label}
          </Text>

          {hasError ? (
            <Text fontSize="xs" color="red.500" fontWeight="semibold">
              取得失敗
            </Text>
          ) : hasProblem ? (
            <>
              <Badge
                bg="orange.400"
                color="white"
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="xs"
                fontWeight="bold"
              >
                {problemBadge}
              </Badge>
              <Text fontSize="sm" fontWeight="bold" color="orange.700">
                {problemCount}店舗
              </Text>
              {storeNames.length > 0 && (
                <Text fontSize="xs" color="orange.500" noOfLines={2}>
                  {storeNames.slice(0, 2).join("・")}
                  {storeNames.length > 2 ? ` 他${storeNames.length - 2}店舗` : ""}
                </Text>
              )}
            </>
          ) : (
            <>
              <Box color="var(--teal, #0891B2)">
                <Icon.LuCheck size={16} />
              </Box>
              <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper, #155E75)">
                問題なし
              </Text>
            </>
          )}

          <Text fontSize="xs" color="var(--text-muted, #64748B)" mt={1}>
            詳細を見る →
          </Text>
        </VStack>
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
          icon={<Icon.LuWrench size={18} />}
          label="設備状況"
          hasError={!!machinesResult.error}
          hasProblem={breakMachines.length > 0}
          problemBadge="故障発生中"
          problemCount={breakMachines.length}
          storeNames={breakMachines.map((s) => s.laundryName).filter(Boolean)}
        />
      </GridItem>
      <GridItem>
        <StatusCard
          href="/inventory"
          icon={<Icon.LuPackage size={18} />}
          label="在庫状況"
          hasError={!!stockResult.error}
          hasProblem={lowStockItems.length > 0}
          problemBadge="在庫不足"
          problemCount={lowStockItems.length}
          storeNames={lowStockItems.map((s) => s.laundryName).filter(Boolean)}
        />
      </GridItem>
    </Grid>
  );
};

export default StatusSummaryCards;
