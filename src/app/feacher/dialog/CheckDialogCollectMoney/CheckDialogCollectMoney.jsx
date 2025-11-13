import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import styles from "./CheckDialogCollectMoney.module.css";

import { useState } from "react";
import { redirect } from "next/navigation";
import { createNowData } from "@/date";
import { createData } from "@/app/collectMoney/action";

const CheckDialog = ({
  coinLaundry,
  checked,
  moneyTotal,
  machinesAndFunds,
  epoc,
  setMsg,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const postHander = async (event) => {
    setIsLoading(true);
    setMsg("");
    event.preventDefault();

    const postArray = checked
      ? machinesAndFunds.map((machineAndFunds) => {
          if (!machineAndFunds.funds && machineAndFunds.weight) {
            return {
              id: machineAndFunds.machine.id,
              name: machineAndFunds.machine.name,
              funds: Math.ceil(machineAndFunds.weight / coinWeight) || 0,
            };
          }
          return {
            id: machineAndFunds.machine.id,
            name: machineAndFunds.machine.name,
            funds: machineAndFunds.funds || 0,
          };
        })
      : [];

    const totalFunds = checked
      ? postArray.reduce((accumulator, currentValue) => {
          return accumulator + parseInt(currentValue.funds);
        }, 0) * 100
      : moneyTotal || 0;

    const formData = {
      store: coinLaundry.store,
      storeId: coinLaundry.id,
      date: epoc,
      fundsArray: postArray,
      totalFunds,
    };

    let responseData;
    try {
      const { data, error } = await createData(formData);

      responseData = data;
      if (error) {
        throw new Error(error.message || "データの作成に失敗しました");
      }
    } catch (error) {
      console.error("API Error:", error);
      setMsg("API Error:", error);
    }

    sessionStorage.setItem(
      "toast",
      JSON.stringify({
        description: `${responseData.laundryName}店の集金データの登録が完了しました。`,
        type: "success",
        closable: true,
      })
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
    redirect(`/coinLaundry/${responseData.laundryId}/coinDataList`);
  };
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
                  {checked ? (
                    machinesAndFunds.map((item) => (
                      <li key={item.machine.id} className={styles.machineItem}>
                        <Flex justifyContent="space-between">
                          <div>
                            {item.machine.name}:{item.funds}
                          </div>
                        </Flex>
                      </li>
                    ))
                  ) : (
                    <Flex justifyContent="space-between">
                      <div>合計金額:{moneyTotal}</div>
                    </Flex>
                  )}
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
