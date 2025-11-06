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
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
import styles from "./CheckDialog.module.css";

const CheckDialog = ({ method, postHander, dialogRef }) => {
  const { state } = useCoinLaundryForm();
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
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Positioner>
          <Dialog.Content className={styles.dialogContent}>
            <Dialog.Header className={styles.dialogHeader}>
              <Dialog.Title className={styles.dialogTitle}>
                店舗情報の確認
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body className={styles.dialogBody}>
              <Box className={styles.infoSection}>
                <Text className={styles.infoLabel}>店舗名</Text>
                <Text className={styles.infoValue}>{state.store}</Text>
              </Box>

              <Box className={styles.infoSection}>
                <Text className={styles.infoLabel}>場所</Text>
                <Text className={styles.infoValue}>{state.location}</Text>
              </Box>

              <Box className={styles.infoSection}>
                <Text className={styles.infoLabel}>概要</Text>
                <Text className={styles.infoValue}>{state.description}</Text>
              </Box>

              <Box className={styles.infoSection}>
                <Text className={styles.infoLabel}>機械</Text>
                {state.machines.length > 0 ? (
                  <Box as="ul" className={styles.machineList}>
                    {state.machines
                      .filter((machine) => machine.num !== 0)
                      .map((machine) => (
                        <li key={machine.name} className={styles.machineItem}>
                          <Flex justifyContent="space-between">
                            <div>
                              {machine.name} : {machine.num}個
                            </div>
                            {machine.comment && (
                              <div>価格帯 : {machine.comment}</div>
                            )}
                          </Flex>
                        </li>
                      ))}
                  </Box>
                ) : (
                  <Text className={styles.emptyState}>
                    登録された機械はありません
                  </Text>
                )}
              </Box>

              {state.existingPictures.length > 0 && (
                <Box className={styles.infoSection}>
                  <Text className={styles.infoLabel}>写真</Text>
                  <Flex className={styles.imageGrid}>
                    {state.existingPictures.map((item) => (
                      <Box key={item.url} className={styles.imageContainer}>
                        <Image
                          src={item.url}
                          className={styles.imagePreview}
                          alt="店舗写真"
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}

              {state.newPictures.length > 0 && (
                <Box className={styles.infoSection}>
                  <Text className={styles.infoLabel}>追加写真</Text>
                  <Flex className={styles.imageGrid}>
                    {state.newPictures.map((item) => (
                      <Box key={item.url} className={styles.imageContainer}>
                        <Image
                          src={item.url}
                          className={styles.imagePreview}
                          alt="追加写真"
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer className={styles.dialogFooter}>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  ref={dialogRef}
                  className={styles.cancelButton}
                  disabled={state.isLoading}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={postHander}
                className={styles.submitButton}
                disabled={state.isLoading}
              >
                {state.isLoading && <Spinner />}
                {method === "POST" && "登録"}
                {method === "PUT" && "編集"}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                className={styles.closeButton}
                disabled={state.isLoading}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CheckDialog;
