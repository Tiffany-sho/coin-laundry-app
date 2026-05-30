import { Box, Card, HStack, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { getCollectSchedule } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { getNextCollectDate } from "@/functions/collectSchedule";

const getCountdownStyle = (daysUntil) => {
  if (daysUntil === 0) return { bg: "linear-gradient(135deg, #0E7490 0%, #0891B2 100%)", textColor: "white", borderColor: "transparent", isToday: true };
  if (daysUntil <= 2) return { bg: "var(--card-bg, #FFFFFF)", textColor: "orange.500", borderColor: "orange.200", isToday: false };
  return { bg: "var(--card-bg, #FFFFFF)", textColor: "var(--teal)", borderColor: "cyan.100", isToday: false };
};

export default async function CollectCountdown() {
  const { data: schedule } = await getCollectSchedule();
  if (!schedule) return null;

  const next = getNextCollectDate(schedule);
  if (!next) return null;

  const { daysUntil } = next;
  const style = getCountdownStyle(daysUntil);

  const label =
    daysUntil === 0 ? "今日は集金日です！" :
    daysUntil === 1 ? "明日が集金日です" :
    `次の集金まで ${daysUntil} 日`;

  const scheduleLabel = schedule.type === "weekly"
    ? `毎週 ${["日", "月", "火", "水", "木", "金", "土"].filter((_, i) => schedule.days.includes(i)).join("・")}曜日`
    : `毎月 ${[...schedule.days].sort((a, b) => a - b).join("・")}日`;

  return (
    <Card.Root
      borderRadius="xl"
      border="1px solid"
      borderColor={style.borderColor}
      boxShadow="var(--shadow-sm)"
      overflow="hidden"
      background={style.bg}
    >
      <Card.Body p={{ base: 4, md: 5 }}>
        <HStack gap={3} align="center">
          <Box
            w="40px" h="40px"
            borderRadius="lg"
            bg={style.isToday ? "rgba(255,255,255,0.2)" : "var(--teal-pale)"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            color={style.isToday ? "white" : "var(--teal)"}
          >
            <Icon.LuCalendarClock size={20} />
          </Box>
          <Box flex={1}>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="bold"
              color={style.isToday ? "white" : style.textColor}
            >
              {label}
            </Text>
            <Text
              fontSize="xs"
              color={style.isToday ? "rgba(255,255,255,0.75)" : "var(--text-muted)"}
              mt={0.5}
            >
              {scheduleLabel}
            </Text>
          </Box>
          {daysUntil > 0 && (
            <Box textAlign="right">
              <Text
                fontFamily="'Space Mono', monospace"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                lineHeight={1}
                color={style.textColor}
              >
                {daysUntil}
              </Text>
              <Text fontSize="2xs" color="var(--text-muted)" mt={0.5}>
                日後
              </Text>
            </Box>
          )}
          {daysUntil === 0 && (
            <Box color="rgba(255,255,255,0.9)">
              <Icon.LuBell size={20} />
            </Box>
          )}
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
