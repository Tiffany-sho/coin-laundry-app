"use client";

import { Box, Text, VStack, HStack, Flex, Badge, Button, Spinner } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";
import * as Icon from "@/app/feacher/Icon";
import { useState } from "react";
import { showToast } from "@/functions/makeToast/toast";
import { registerProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { createOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

const CheckProfiles = () => {
  const { handleNext, handleBack, fullname, username, collectMethod, role, orgName } = useUploadProfiles();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);

      const { error: profileError } = await registerProfile({ fullname, username, collectMethod, role });
      if (profileError) throw new Error(typeof profileError === "string" ? profileError : "ユーザ登録に失敗しました");

      if (role === "admin") {
        const { error: orgError } = await createOrganization(orgName);
        if (orgError) throw new Error(orgError);
      }

      showToast("success", "登録が完了しました");
      handleNext();
    } catch (e) {
      showToast("error", e.message || "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case "admin":
        return { label: "店舗管理者", icon: <Icon.LuCrown /> };
      case "collecter":
        return { label: "集金担当者", icon: <Icon.LuUserCheck /> };
      default:
        return { label: "閲覧者", icon: <Icon.LuEye /> };
    }
  };

  const roleInfo = getRoleInfo(role);

  const InfoItem = ({ icon, label, value, badge }) => (
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="var(--divider)"
      transition="all 0.2s"
      _hover={{ borderColor: "cyan.300", boxShadow: "var(--shadow-sm)" }}
    >
      <HStack justify="space-between" align="center">
        <HStack gap={3}>
          <Flex
            w="36px"
            h="36px"
            bg="cyan.50"
            borderRadius="full"
            align="center"
            justify="center"
            color="var(--teal)"
            fontSize="lg"
            flexShrink={0}
          >
            {icon}
          </Flex>
          <Box>
            <Text fontSize="xs" color="var(--text-muted)" fontWeight="medium" mb={0.5}>
              {label}
            </Text>
            <Text fontSize="sm" color="var(--text-main)" fontWeight="semibold">
              {value || "未設定"}
            </Text>
          </Box>
        </HStack>
        {badge && badge}
      </HStack>
    </Box>
  );

  return (
    <VStack align="stretch" gap={4} w="full">
      <InfoItem icon={<Icon.LuUser />} label="氏名" value={fullname} />
      <InfoItem icon={<Icon.LuAtSign />} label="ユーザー名" value={username} />
      <InfoItem
        icon={<Icon.LuWallet />}
        label="集金方法"
        value={collectMethod === "machines" ? "機械別集金" : "総額集金"}
        badge={
          <Badge
            bg={collectMethod === "machines" ? "cyan.100" : "teal.100"}
            color={collectMethod === "machines" ? "cyan.800" : "teal.800"}
            px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="semibold"
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
          <Badge bg="cyan.100" color="cyan.800" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="semibold">
            {roleInfo.label}
          </Badge>
        }
      />
      {role === "admin" && (
        <InfoItem icon={<Icon.LuBuilding2 />} label="組織名" value={orgName} />
      )}

      <HStack gap={3} w="full" mt={2}>
        <Button
          flex={1}
          size="lg"
          variant="outline"
          borderColor="var(--divider)"
          color="var(--text-muted)"
          fontWeight="semibold"
          borderRadius="xl"
          py={6}
          onClick={handleBack}
          _hover={{ bg: "gray.50", borderColor: "gray.300" }}
        >
          戻る
        </Button>
        <Button
          flex={1}
          size="lg"
          style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
          color="white"
          fontWeight="bold"
          borderRadius="xl"
          py={6}
          onClick={handleRegister}
          disabled={loading}
          boxShadow="0 4px 14px rgba(8,145,178,0.3)"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(8,145,178,0.5)" }}
          _active={{ transform: "translateY(0)" }}
          transition="all 0.2s"
        >
          {loading ? <Spinner size="sm" /> : "登録"}
        </Button>
      </HStack>
    </VStack>
  );
};

export default CheckProfiles;
