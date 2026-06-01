"use client";

import { Box, Button, Field, HStack, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useUploadProfiles } from "../context/UploadProfilesContext";
import { createOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { showToast } from "@/functions/makeToast/toast";
import * as Icon from "@/app/feacher/Icon";

const OrgSetupForm = () => {
  const { handleNext, handleBack, orgName, setOrgName } = useUploadProfiles();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleCreate = async () => {
    if (!orgName.trim()) {
      setMsg("組織名を入力してください");
      return;
    }
    try {
      setLoading(true);
      const { error } = await createOrganization(orgName.trim());
      if (error) throw new Error(error);
      showToast("success", "組織を作成しました");
      handleNext();
    } catch (e) {
      setMsg(e.message || "組織の作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack align="stretch" gap={6} w="full">
      <VStack gap={3} textAlign="center">
        <Box
          w="56px"
          h="56px"
          borderRadius="xl"
          bg="cyan.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon.LuBuilding2 size={28} color="#0891B2" />
        </Box>
        <Text fontSize="sm" color="gray.600" lineHeight="1.7">
          集金チームを管理する組織を作成します。
          <br />
          後からスタッフを招待できます。
        </Text>
      </VStack>

      {msg && (
        <Text color="red.400" fontSize="sm" fontWeight="medium">
          {msg}
        </Text>
      )}

      <Field.Root>
        <Field.Label fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
          組織名（会社名・店舗グループ名など）
        </Field.Label>
        <Input
          type="text"
          value={orgName}
          onChange={(e) => {
            setMsg("");
            setOrgName(e.target.value);
          }}
          placeholder="例：山田コインランドリー"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          py={3}
          px={4}
          fontSize="md"
          _focusVisible={{ borderColor: "cyan.400", boxShadow: "0 0 0 3px rgba(6,182,212,0.15)" }}
        />
      </Field.Root>

      <HStack gap={3} w="full">
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
          _hover={{ bg: "gray.50", borderColor: "gray.400" }}
        >
          戻る
        </Button>
        <Button
          flex={1}
          size="lg"
          style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
          color="white"
          fontWeight="semibold"
          borderRadius="lg"
          py={6}
          onClick={handleCreate}
          disabled={loading}
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 14px rgba(8,145,178,0.4)" }}
          _active={{ transform: "translateY(0)" }}
          transition="all 0.2s"
        >
          {loading ? <Spinner size="sm" /> : <><Icon.LuPlus size={16} /> 組織を作成</>}
        </Button>
      </HStack>
    </VStack>
  );
};

export default OrgSetupForm;
