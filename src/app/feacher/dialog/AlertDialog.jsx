import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";

const AlertDialog = ({ target, deleteAction }) => {
  return (
    <Dialog.Root role="alertdialog" placement="center">
      <Dialog.Trigger asChild>
        <Button
          type="submit"
          color="red.500"
          variant="outline"
          size="md"
          border="none"
        >
          <LuTrash2 />
          <span>削除</span>
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
