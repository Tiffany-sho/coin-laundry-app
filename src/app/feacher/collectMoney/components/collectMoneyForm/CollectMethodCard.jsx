"use client";

import {
  Box,
  Card,
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
    <Card.Root bg="white" shadow="md" borderRadius="2xl" overflow="hidden">
      <Card.Body p={{ base: 5, md: 6 }}>
        <Flex
          align="center"
          justify="space-between"
          mb={5}
          gap={4}
          flexWrap={{ base: "wrap", md: "nowrap" }}
        >
          <Box flex="1" minW="200px">
            <HStack mb={2}>
              <Icon.RiMoneyCnyCircleLine size={22} color="teal.600" />
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                {checked ? "機種別集金" : "まとめて集金"}
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {checked
                ? "各機種ごとに金額を入力します"
                : "合計金額のみを入力します"}
            </Text>
          </Box>

          {loading ? (
            <Spinner size="lg" color="blue.500" thickness="3px" />
          ) : (
            <Switch.Root
              checked={checked}
              onCheckedChange={onMethodChange}
              size="lg"
            >
              <Switch.HiddenInput />
              <Switch.Control
                bg={checked ? "blue.500" : "gray.300"}
                _hover={{ bg: checked ? "blue.600" : "gray.400" }}
                transition="all 0.2s"
              >
                <Switch.Thumb bg="white" shadow="md" />
              </Switch.Control>
            </Switch.Root>
          )}
        </Flex>

        <Box pt={5} mt={5} borderTop="1px" borderColor="gray.200">
          <FixSwitch toggleChangeFixed={onFixedChange} fixed={fixed} />
        </Box>
      </Card.Body>
    </Card.Root>
  );
};

export default CollectMethodCard;
