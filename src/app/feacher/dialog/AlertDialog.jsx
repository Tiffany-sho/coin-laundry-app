import { Button, CloseButton, Dialog, Flex, Portal } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/coinLandry/components/MonoCard/MonoCardIcon";

const AlertDialog = ({ target, deleteAction }) => {
  return (
    <Dialog.Root role="alertdialog" placement="center">
      <Dialog.Trigger asChild>
        <Button type="submit" bg="red.500" size="sm">
          <Icon.BsFillTrash3Fill />
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{`「${target}」を削除しますか？`}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>削除すると復活させることはできません。</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">キャンセル</Button>
              </Dialog.ActionTrigger>
              <Button colorPalette="red" onClick={deleteAction}>
                削除する
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

export default AlertDialog;
