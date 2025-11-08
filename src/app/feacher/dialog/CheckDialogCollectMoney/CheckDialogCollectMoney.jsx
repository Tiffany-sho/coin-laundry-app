import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  Flex,
  Image,
  Spinner,
} from "@chakra-ui/react";
import styles from "./CheckDialogCollectMoney.module.css";
import { createNowData } from "@/date";

const CheckDialog = ({ postHander, isLoading, data, epoc }) => {
  return (
    <Dialog.Root
      role="alertdialog"
      size="cover"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button variant="solid" px={8}>
          登録確認
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Positioner>
          <Dialog.Content className={styles.dialogContent}>
            <Dialog.Header className={styles.dialogHeader}>
              <Dialog.Title className={styles.dialogTitle}>
                集金情データの確認
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body className={styles.dialogBody}>
              <Box className={styles.infoSection}>
                <Text className={styles.infoLabel}>日付</Text>
                <Text className={styles.infoValue}>{createNowData(epoc)}</Text>
              </Box>

              <Box className={styles.infoSection}>
                <Text className={styles.infoLabel}>集金データ</Text>

                <Box as="ul" className={styles.machineList}>
                  {data.map((item) => (
                    <li key={item.machine.id} className={styles.machineItem}>
                      <Flex justifyContent="space-between">
                        <div>
                          {item.machine.name}:{item.funds}
                        </div>
                      </Flex>
                    </li>
                  ))}
                </Box>
              </Box>
            </Dialog.Body>
            <Dialog.Footer className={styles.dialogFooter}>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  //   ref={dialogRef}
                  className={styles.cancelButton}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={postHander}
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading && <Spinner />}
                登録
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                className={styles.closeButton}
                disabled={isLoading}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CheckDialog;
