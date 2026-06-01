import { Button, Box, Text, VStack, Flex } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import Link from "next/link";
import { useUploadProfiles } from "../context/UploadProfilesContext";

const AdminFinish = () => (
  <VStack align="stretch" gap={8} w="full">
    <VStack gap={4} position="relative" zIndex={1}>
      <Box
        w="60px"
        h="60px"
        bg="var(--card-bg, #FFFFFF)"
        borderRadius="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="lg"
      >
        <Icon.LiaStoreSolid size={40} color="#0891B2" />
      </Box>
      <Text fontSize="xl" fontWeight="bold" color="gray.800">
        はじめての店舗を追加してみましょう
      </Text>
      <Text fontSize="sm" color="gray.600">
        店舗情報を登録して、管理を始めましょう
      </Text>
    </VStack>

    <Link href="/coinLaundry/new" style={{ width: "100%" }}>
      <Button
        w="full"
        size="lg"
        style={{
          background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)",
        }}
        color="white"
        fontWeight="bold"
        borderRadius="xl"
        py={7}
        fontSize="lg"
        boxShadow="0 4px 14px rgba(8, 145, 178, 0.4)"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "0 6px 20px rgba(8, 145, 178, 0.5)",
        }}
        _active={{ transform: "translateY(0)" }}
        transition="all 0.2s"
      >
        <Icon.LuPlus size={22} /> 店舗を追加
      </Button>
    </Link>

    <Box p={4} bg="gray.50" borderRadius="lg" textAlign="center">
      <Text fontSize="xs" color="gray.500">
        後からでも店舗は追加できます
      </Text>
    </Box>
  </VStack>
);

const StaffFinish = () => (
  <VStack align="stretch" gap={6} w="full">
    <VStack gap={4}>
      <Flex
        w="64px"
        h="64px"
        borderRadius="2xl"
        bg="cyan.100"
        align="center"
        justify="center"
      >
        <Icon.LuUsers size={32} color="#0891B2" />
      </Flex>
      <Text fontSize="xl" fontWeight="bold" color="gray.800">
        初期設定が完了しました！
      </Text>
      <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="1.7">
        店舗管理者から招待リンクが届いたら
        <br />
        クリックして組織に参加してください。
      </Text>
    </VStack>

    <VStack align="stretch" gap={3}>
      {[
        { icon: <Icon.LuMail size={15} />, text: "管理者に招待リンクの送付を依頼する" },
        { icon: <Icon.LuSmartphone size={15} />, text: "届いたリンクをタップして参加する" },
        { icon: <Icon.LuCheck size={15} />, text: "参加後に集金・管理ができるようになります" },
      ].map(({ icon, text }, i) => (
        <Flex key={i} align="center" gap={3} p={3} bg="white" borderRadius="lg">
          <Flex
            w="28px"
            h="28px"
            borderRadius="full"
            bg="cyan.100"
            align="center"
            justify="center"
            color="var(--teal, #0891B2)"
            flexShrink={0}
          >
            {icon}
          </Flex>
          <Text fontSize="sm" color="gray.700">{text}</Text>
        </Flex>
      ))}
    </VStack>

    <Link href="/" style={{ width: "100%" }}>
      <Button
        w="full"
        size="lg"
        style={{
          background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)",
        }}
        color="white"
        fontWeight="bold"
        borderRadius="xl"
        py={6}
        transition="all 0.2s"
        _hover={{ transform: "translateY(-2px)" }}
        _active={{ transform: "translateY(0)" }}
      >
        ホームへ
      </Button>
    </Link>
  </VStack>
);

const FinishPage = () => {
  const { role } = useUploadProfiles();
  return role === "admin" ? <AdminFinish /> : <StaffFinish />;
};

export default FinishPage;
