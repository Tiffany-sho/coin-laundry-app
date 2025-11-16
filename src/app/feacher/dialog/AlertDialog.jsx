import { deleteData } from "@/app/collectMoney/action";
import { toaster } from "@/components/ui/toaster";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { LuTrash2 } from "@/app/feacher/Icon";

const AlertDialog = ({ id, target, setOpen, onRowClick, setMsg }) => {
  const deleteAction = async () => {
    try {
      const result = await deleteData(id);

      if (result.error) {
        throw new Error(result.error.message || "削除に失敗しました");
      }
    } catch (error) {
      console.error("API Error:", error);
      setMsg(error);
    }

    onRowClick(null);
    setOpen(false);
    toaster.create({
      description: `${target})の集金データを削除しました`,
      type: "warning",
      closable: true,
    });
  };
  return (
    <Dialog.Root role="alertdialog" placement="center">
      <Dialog.Trigger asChild>
        <Button color="red.500" variant="outline" size="md" border="none">
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
