import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * iPhone風フレームでchildren（アプリ画面）を包む。
 * children にはスクロール可能な画面コンテンツを渡す。
 */
const PhoneFrame = ({ children, maxH = "580px" }) => (
  <Box
    position="relative"
    bg="#1A1A1A"
    borderRadius="44px"
    p="10px"
    boxShadow="0 0 0 1px #3A3A3A, 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)"
    display="inline-block"
    w="full"
  >
    {/* サイドボタン（左） */}
    <Box
      position="absolute"
      left="-3px"
      top="100px"
      w="3px"
      h="32px"
      bg="#2A2A2A"
      borderRadius="2px 0 0 2px"
    />
    <Box
      position="absolute"
      left="-3px"
      top="144px"
      w="3px"
      h="32px"
      bg="#2A2A2A"
      borderRadius="2px 0 0 2px"
    />
    {/* 電源ボタン（右） */}
    <Box
      position="absolute"
      right="-3px"
      top="120px"
      w="3px"
      h="48px"
      bg="#2A2A2A"
      borderRadius="0 2px 2px 0"
    />

    {/* 画面エリア */}
    <Box
      bg="var(--app-bg)"
      borderRadius="36px"
      overflow="hidden"
      position="relative"
    >
      {/* ステータスバー */}
      <Box bg="white" px={5} pt={3} pb={1}>
        <Flex justify="space-between" align="center">
          <Text fontSize="10px" fontWeight="bold" color="#1A1A1A" fontFamily="'Space Mono', monospace">
            12:42
          </Text>
          {/* ノッチ */}
          <Box
            bg="#1A1A1A"
            borderRadius="0 0 12px 12px"
            px={4}
            py={1.5}
            mx="auto"
            position="absolute"
            left="50%"
            top={0}
            transform="translateX(-50%)"
            w="90px"
          />
          <Flex align="center" gap={1}>
            <Text fontSize="9px" color="#1A1A1A">●●●</Text>
            <Text fontSize="9px" color="#1A1A1A">▲</Text>
            <Text fontSize="9px" fontWeight="bold" color="#1A1A1A">93</Text>
          </Flex>
        </Flex>
      </Box>

      {/* アプリコンテンツ */}
      <Box maxH={maxH} overflowY="auto" style={{ scrollbarWidth: "none" }}>
        {children}
      </Box>

      {/* ホームインジケーター */}
      <Box bg="white" px={5} py={2} display="flex" justifyContent="center">
        <Box w="32px" h="4px" bg="#D1D5DB" borderRadius="full" />
      </Box>
    </Box>
  </Box>
);

export default PhoneFrame;
