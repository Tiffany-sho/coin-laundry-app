import { Card, VStack, HStack, Text, Box, Heading } from "@chakra-ui/react";
import CollectMethodSetting from "./CollectMethodSetting";
import * as Icon from "@/app/feacher/Icon";

function SettingRow({ icon, label, description, control }) {
  return (
    <HStack justify="space-between" align="start" gap={4}>
      <HStack gap={2.5} align="start" flex={1}>
        <Box color="var(--teal)" pt={0.5} flexShrink={0}>{icon}</Box>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">{label}</Text>
          {description && (
            <Text fontSize="xs" color="var(--text-muted)">{description}</Text>
          )}
        </Box>
      </HStack>
      {control && <Box flexShrink={0}>{control}</Box>}
    </HStack>
  );
}

export default function AppSettingsCard({ collectMethod }) {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)" mb={5}>
          アプリ設定
        </Heading>
        <VStack align="stretch" gap={5}>
          <SettingRow
            icon={<Icon.BiCoinStack size={16} />}
            label="集金方法"
            description="機械別に記録するか、まとめて記録するか"
          />
          <CollectMethodSetting defaultValue={collectMethod} />
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
