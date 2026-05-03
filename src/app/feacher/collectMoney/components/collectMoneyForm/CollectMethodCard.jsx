"use client";

import {
  Box,
  Flex,
  HStack,
  Spinner,
  Switch,
  Text,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import FixSwitch from "./parts/FixSwitch";

const CollectMethodCard = ({
  checked,
  fixed,
  loading,
  onMethodChange,
  onFixedChange,
}) => {
  return (
    <Box py={{ base: 5, md: 6 }}>
      <Flex
        align="center"
        justify="space-between"
        mb={5}
        gap={4}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        <Box flex="1" minW="200px">
          <HStack mb={2}>
            <Icon.RiMoneyCnyCircleLine size={20} color="var(--teal, #0891B2)" />
            <Text fontSize="md" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
              集金方式
            </Text>
          </HStack>
          <Text fontSize="sm" color="var(--text-muted, #64748B)">
            {checked
              ? "各機種ごとに金額を入力します"
              : "合計金額のみを入力します"}
          </Text>
        </Box>

        {loading ? (
          <Spinner size="lg" color="cyan.500" thickness="3px" />
        ) : (
          <Switch.Root
            checked={checked}
            onCheckedChange={onMethodChange}
            size="lg"
          >
            <Switch.HiddenInput />
            <Switch.Control
              bg={checked ? "var(--teal, #0891B2)" : "gray.300"}
              _hover={{ bg: checked ? "var(--teal-dark, #0E7490)" : "gray.400" }}
              transition="all 0.2s"
            >
              <Switch.Thumb bg="white" shadow="md" />
            </Switch.Control>
          </Switch.Root>
        )}
      </Flex>

      <FixSwitch toggleChangeFixed={onFixedChange} fixed={fixed} />
    </Box>
  );
};

export default CollectMethodCard;
