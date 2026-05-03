import {
  Badge,
  Box,
  CloseButton,
  Drawer,
  Heading,
  HStack,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const HaveMachines = ({ coinLaundry }) => {
  return (
    <Drawer.Root size={{ base: "xs", md: "md" }}>
      <Drawer.Trigger asChild>
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="16px"
          border="2px solid"
          borderColor="var(--divider, #F1F5F9)"
          boxShadow="var(--shadow-sm)"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: "cyan.300", boxShadow: "0 4px 16px rgba(8,145,178,0.12)" }}
        >
          <VStack align="stretch" gap={3}>
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="semibold" color="var(--text-muted, #64748B)">
                設備情報
              </Text>
              <Box
                style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                color="white"
                borderRadius="full"
                p={2}
              >
                <Icon.LuWrench size={20} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
              {coinLaundry.machines.length}種類
            </Text>
            <Text fontSize="xs" color="var(--text-faint, #94A3B8)">
              タップして詳細を表示
            </Text>
          </VStack>
        </Box>
      </Drawer.Trigger>

      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header
              borderBottom="1px solid"
              borderColor="var(--divider, #F1F5F9)"
              pb={4}
              bg="var(--teal-pale, #CFFAFE)"
            >
              <HStack gap={3}>
                <Box
                  style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                  color="white"
                  borderRadius="full"
                  p={2}
                >
                  <Icon.LuWrench size={24} />
                </Box>
                <Drawer.Title fontSize="xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
                  設備一覧
                </Drawer.Title>
              </HStack>
            </Drawer.Header>

            <Drawer.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                _hover={{ bg: "cyan.50" }}
              />
            </Drawer.CloseTrigger>

            <Drawer.Body pt={6} bg="var(--app-bg, #F0F9FF)">
              <VStack align="stretch" gap={3}>
                {coinLaundry.machines?.map((machine) => (
                  <Box
                    key={machine.id}
                    p={4}
                    bg="white"
                    borderRadius="14px"
                    borderLeft="4px solid"
                    borderColor="var(--teal, #0891B2)"
                    boxShadow="var(--shadow-sm)"
                    transition="all 0.2s"
                    _hover={{
                      bg: "cyan.50",
                      transform: "translateX(4px)",
                      boxShadow: "0 4px 16px rgba(8,145,178,0.12)",
                    }}
                  >
                    <VStack align="stretch" gap={2}>
                      <Heading fontSize="lg" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                        {machine.name}
                      </Heading>
                      <HStack gap={2} flexWrap="wrap">
                        <Badge
                          bg="var(--teal-pale, #CFFAFE)"
                          color="var(--teal-deeper, #155E75)"
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          台数: {machine.num}
                        </Badge>
                        {machine.comment && (
                          <Badge
                            bg="var(--teal-pale, #CFFAFE)"
                            color="var(--teal-deeper, #155E75)"
                            fontSize="sm"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            価格: {machine.comment}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default HaveMachines;
