import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  Flex,
  Image,
} from "@chakra-ui/react";

const CheckDialog = ({
  method,
  postHander,
  store,
  location,
  description,
  machines,
  pictureFile,
  pictureUrl,
}) => {
  return (
    <Dialog.Root
      role="alertdialog"
      size="cover"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button variant="solid">
          {method === "POST" && "登録確認"}
          {method === "PUT" && "編集"}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>店舗情報の確認</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>店舗名 : {store}</Text>
              <Text>場所 : {location}</Text>
              <Text>概要 : {description}</Text>
              <Text>機械 : </Text>
              <Box as="ul" listStylePosition="inside">
                {machines.map((machine) => (
                  <li key={machine._id}>
                    {machine.name} : {machine.num}個
                  </li>
                ))}
              </Box>
              <Text>写真 : </Text>
              <Flex>
                {pictureUrl.map((item) => (
                  <Box key={item.url} position="relative">
                    <Image src={item.url} w="auto" boxSize="20" p="2" />
                  </Box>
                ))}
              </Flex>
              <Flex>
                {pictureFile.map((item) => (
                  <Box key={item.url} position="relative">
                    <Image src={item.url} w="auto" boxSize="20" p="2" />
                  </Box>
                ))}
              </Flex>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button onClick={postHander}>
                {method === "POST" && "登録"}
                {method === "PUT" && "編集"}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CheckDialog;
