import {
  Box,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";
import * as Icon from "@/app/feacher/Icon";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { showToast } from "@/functions/makeToast/toast";

const CheckProfiles = ({ user }) => {
  const { handleNext, handleBack, fullname, username, collectMethod, role } =
    useUploadProfiles();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const UploadProfiles = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id,
        full_name: fullname,
        username: username,
        collectMethod: collectMethod,
        role: role,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      handleNext();
      showToast("success", "ユーザ登録完了しました");
    } catch (error) {
      showToast("success", "ユーザ登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case "owner":
        return { label: "店舗管理者", color: "purple", icon: <Icon.LuCrown /> };
      case "collecter":
        return {
          label: "集金担当者",
          color: "blue",
          icon: <Icon.LuUserCheck />,
        };
      default:
        return { label: "閲覧者", color: "gray", icon: <Icon.LuEye /> };
    }
  };

  const roleInfo = getRoleInfo(role);

  const InfoItem = ({ icon, label, value, badge }) => (
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      border="2px solid"
      borderColor="gray.200"
      transition="all 0.2s"
      _hover={{
        borderColor: "blue.300",
        boxShadow: "md",
        transform: "translateX(2px)",
      }}
    >
      <HStack justify="space-between" align="center">
        <HStack gap={3}>
          <Flex
            w="40px"
            h="40px"
            bg="blue.50"
            borderRadius="full"
            align="center"
            justify="center"
            color="blue.600"
            fontSize="lg"
          >
            {icon}
          </Flex>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
              {label}
            </Text>
            <Text fontSize="md" color="gray.900" fontWeight="semibold">
              {value || "未設定"}
            </Text>
          </Box>
        </HStack>
        {badge && badge}
      </HStack>
    </Box>
  );

  return (
    <VStack align="stretch" gap={6} w="full">
      <Box textAlign="center" mb={2}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
          プロフィール情報の確認
        </Text>
        <Text fontSize="sm" color="gray.600">
          入力された情報を確認してください
        </Text>
      </Box>

      <VStack align="stretch" gap={3}>
        <InfoItem icon={<Icon.LuUser />} label="氏名" value={fullname} />

        <InfoItem
          icon={<Icon.LuAtSign />}
          label="ユーザー名"
          value={username}
        />

        <InfoItem
          icon={<Icon.LuWallet />}
          label="集金方法"
          value={collectMethod === "machines" ? "機械別集金" : "総額集金"}
          badge={
            <Badge
              bg={collectMethod === "machines" ? "blue.100" : "green.100"}
              color={collectMethod === "machines" ? "blue.800" : "green.800"}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="semibold"
            >
              {collectMethod === "machines" ? "詳細" : "簡易"}
            </Badge>
          }
        />

        <InfoItem
          icon={roleInfo.icon}
          label="役割"
          value={roleInfo.label}
          badge={
            <Badge
              bg={`${roleInfo.color}.100`}
              color={`${roleInfo.color}.800`}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="semibold"
            >
              {roleInfo.label}
            </Badge>
          }
        />
      </VStack>

      <Box mt={4} p={4} bg="blue.50" borderRadius="lg" borderColor="blue.500">
        <HStack gap={3} w="full" mt={4}>
          <Button
            flex={1}
            size="lg"
            variant="outline"
            borderColor="gray.300"
            color="gray.700"
            fontWeight="semibold"
            borderRadius="lg"
            py={6}
            onClick={handleBack}
            border="2px solid"
            _hover={{
              bg: "gray.50",
              borderColor: "gray.400",
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
            }}
          >
            戻る
          </Button>

          <Button
            flex={1}
            size="lg"
            bg="blue.500"
            color="white"
            fontWeight="semibold"
            borderRadius="lg"
            py={6}
            onClick={() => {
              UploadProfiles();
            }}
            _hover={{
              bg: "blue.600",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
              transform: "none",
            }}
            transition="all 0.2s"
          >
            {loading && <Spinner />} 登録
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
};

export default CheckProfiles;
