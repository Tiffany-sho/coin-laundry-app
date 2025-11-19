import { Button } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";

const SetUpStartBtn = () => {
  const { handleNext } = useUploadProfiles();
  return (
    <Button
      w="full"
      size="lg"
      bg="blue.500"
      color="white"
      fontWeight="semibold"
      borderRadius="lg"
      py={6}
      onClick={handleNext}
      _hover={{
        bg: "blue.600",
        transform: "translateY(-2px)",
        boxShadow: "lg",
      }}
      transition="all 0.2s"
    >
      初期設定を開始します
    </Button>
  );
};

export default SetUpStartBtn;
