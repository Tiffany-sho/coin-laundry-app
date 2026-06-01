"use client";

import { Box, Text, VStack, Flex } from "@chakra-ui/react";
import UserUploadForm from "./UserUploadForm";
import SetUpStartBtn from "./SetUpStartBtn";
import { useUploadProfiles } from "../context/UploadProfilesContext";
import CollectMethodChoose from "./CollectMethodChoose";
import AuthorityChoose from "./AuthorityChoose";
import CheckProfiles from "./CheckProfiles";
import OrgSetupForm from "./OrgSetupForm";
import FinishPage from "./FinishPage";

const getTitle = (step, role) => {
  if (step === 1) return "ようこそ！";
  if (step === 2) return "ユーザの情報登録";
  if (step === 3) return "集金方法を設定";
  if (step === 4) return "権限設定";
  if (step === 5) return role === "admin" ? "組織の作成" : "設定内容確認";
  if (step === 6 && role === "admin") return "設定内容確認";
  return "初期設定が完了しました！";
};

const Progress = ({ user }) => {
  const { step, role } = useUploadProfiles();

  const isFinished = role === "admin" ? step > 6 : step > 5;
  const title = isFinished ? "初期設定が完了しました！" : getTitle(step, role);

  return (
    <Box minH="100vh" bg="gray.50" position="relative" zIndex="3000">
      <Flex
        justify="center"
        align="center"
        minH="100vh"
        p={{ base: 4, md: 8 }}
      >
        <VStack
          gap={8}
          maxW="500px"
          w="full"
          bg="var(--card-bg, #FFFFFF)"
          p={{ base: 6, md: 10 }}
          borderRadius="2xl"
          boxShadow="xl"
        >
          <Box textAlign="center">
            <Text
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              color="gray.800"
              mb={2}
            >
              {title}
            </Text>
          </Box>

          <Box p={6} bg="blue.50" borderRadius="xl" w="full" textAlign="center">
            {step === 1 && <SetUpStartBtn />}
            {step === 2 && <UserUploadForm />}
            {step === 3 && <CollectMethodChoose />}
            {step === 4 && <AuthorityChoose />}
            {step === 5 && role === "admin" && <OrgSetupForm />}
            {step === 5 && role !== "admin" && <CheckProfiles user={user} />}
            {step === 6 && role === "admin" && <CheckProfiles user={user} />}
            {isFinished && <FinishPage />}
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
};

export default Progress;
