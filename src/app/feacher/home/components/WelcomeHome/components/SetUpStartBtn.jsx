import { Button, Text, VStack } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";

const SetUpStartBtn = () => {
  const { handleNext } = useUploadProfiles();
  return (
    <VStack gap={6}>
      <VStack gap={3}>
        <Text fontSize="sm" color="var(--text-muted)" lineHeight="1.8" textAlign="center">
          コインランドリーの集金・在庫・機器管理を
          <br />
          スマホでかんたんに始めましょう。
        </Text>
      </VStack>
      <Button
        w="full"
        size="lg"
        style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
        color="white"
        fontWeight="bold"
        borderRadius="xl"
        py={7}
        fontSize="md"
        boxShadow="0 4px 14px rgba(8,145,178,0.4)"
        onClick={handleNext}
        _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(8,145,178,0.5)" }}
        _active={{ transform: "translateY(0)" }}
        transition="all 0.2s"
      >
        初期設定を開始する
      </Button>
    </VStack>
  );
};

export default SetUpStartBtn;
