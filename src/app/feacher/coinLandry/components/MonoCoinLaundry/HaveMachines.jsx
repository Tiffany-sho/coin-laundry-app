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
          borderColor="gray.200"
          boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
        >
          <VStack align="stretch" gap={3}>
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                設備情報
              </Text>
              <Box bg="blue.500" color="white" borderRadius="full" p={2}>
                <Icon.LuWrench size={20} />
              </Box>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="blue.700">
              {coinLaundry.machines.length}種類
            </Text>
            <Text fontSize="xs" color="gray.500">
              クリックして詳細を表示
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
              borderColor="gray.200"
              pb={4}
            >
              <HStack gap={3}>
                <Box bg="blue.500" color="white" borderRadius="full" p={2}>
                  <Icon.LuWrench size={24} />
                </Box>
                <Drawer.Title fontSize="xl" fontWeight="bold">
                  設備一覧
                </Drawer.Title>
              </HStack>
            </Drawer.Header>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" position="absolute" top={4} right={4} />
            </Drawer.CloseTrigger>
            <Drawer.Body pt={6}>
              <VStack align="stretch" gap={3}>
                {coinLaundry.machines?.map((machine) => (
                  <Box
                    key={machine.id}
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    borderLeft="4px solid"
                    borderColor="blue.500"
                    transition="all 0.2s"
                    _hover={{
                      bg: "blue.50",
                      transform: "translateX(4px)",
                      boxShadow: "md",
                    }}
                  >
                    <VStack align="stretch" gap={2}>
                      <Heading fontSize="lg" fontWeight="bold" color="gray.700">
                        {machine.name}
                      </Heading>
                      <HStack gap={2} flexWrap="wrap">
                        <Badge fontSize="sm" px={3} py={1} borderRadius="full">
                          台数: {machine.num}
                        </Badge>
                        {machine.comment && (
                          <Badge
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
