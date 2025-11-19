"use client";

import { Box, Text, VStack, Flex } from "@chakra-ui/react";
import ProgressNavbar from "./ProgressNavber";
import UserUploadForm from "./UserUploadForm";
import SetUpStartBtn from "./SetUpStartBtn";
import { useUploadProfiles } from "../context/UploadProfilesContext";
import CollectMethodChoose from "./CollectMethodChoose";
import AuthorityChoose from "./AuthorityChoose";
import CheckProfiles from "./CheckProfiles";

const Progress = ({ user }) => {
  const { progress, totalSteps, step } = useUploadProfiles();

  return (
    <Box minH="100vh" bg="gray.50">
      <ProgressNavbar progress={progress} />

      <Flex
        justify="center"
        align="center"
        minH="calc(100vh - 100px)"
        p={{ base: 4, md: 8 }}
      >
        <VStack
          gap={8}
          maxW="500px"
          w="full"
          bg="white"
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
              {step === 1 && " ようこそ！"}
              {step === 2 && "ユーザの情報登録"}
              {step === 3 && "集金方法を設定"}
              {step === 4 && "権限設定"}
              {step === 5 && "設定内容確認"}
              {step > 5 && "設定が完了しました！"}
            </Text>
            <Text fontSize="md" color="gray.600">
              ステップ {step} / {totalSteps}
            </Text>
          </Box>

          <Box p={6} bg="blue.50" borderRadius="xl" w="full" textAlign="center">
            {step === 1 && <SetUpStartBtn />}
            {step === 2 && <UserUploadForm />}
            {step === 3 && <CollectMethodChoose />}
            {step === 4 && <AuthorityChoose />}
            {step === 5 && <CheckProfiles user={user} />}
            {step > 5 && "設定が完了しました！"}
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
};

export default Progress;
