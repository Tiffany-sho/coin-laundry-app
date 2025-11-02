"use client";

import {
  Box,
  Button,
  Card,
  Field,
  Input,
  InputGroup,
  Stack,
  Textarea,
  CloseButton,
  Drawer,
  Portal,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import Link from "next/link";

import MachineForm from "@/app/feacher/coinLandry/components/CoinLaundryForm/MachineForm";
import { redirect } from "next/navigation";
import {
  getImage,
  uploadImage,
  deleteImage,
} from "@/app/api/supabaseFunctions/route";
import CheckDialog from "@/app/feacher/dialog/CheckDialog/CheckDialog";
import UploadPicture from "@/app/feacher/coinLandry/components/CoinLaundryForm/UploadPicture/UploadPicture";
import DeletePicture from "@/app/feacher/coinLandry/components/CoinLaundryForm/DeletePicture/DeletePicture";
import styles from "./CoinLaundryForm.module.css";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";

const CoinLaundryForm = ({ storeId, images, method }) => {
  const { state, dispatch } = useCoinLaundryForm();
  const [open, setOpen] = useState(false);
  const formRef = useRef(null);
  const dialogRef = useRef(null);

  const postHander = async () => {
    if (!formRef.current || state.isLoading) return;

    dispatch({ type: "SET_ISLOADING", payload: true });
    dispatch({ type: "SET_MSG", payload: "" });

    const formData = new FormData(formRef.current);
    const newMachine = state.machines.filter((machine) => machine.num > 0);

    const filesToUpload = state.newPictures.filter((item) => item.file);

    if (filesToUpload.length > 0) {
      const invalidFiles = filesToUpload.some(
        (item) =>
          item.file.type !== "image/jpeg" && item.file.type !== "image/png"
      );
      if (invalidFiles) {
        dispatch({
          type: "SET_MSG",
          payload: "jpeg/pngファイルを選択してください",
        });

        dispatch({ type: "SET_ISLOADING", payload: false });
        return;
      }
    }

    let newImageObjects = [];

    if (filesToUpload.length > 0) {
      try {
        const uploadPromises = filesToUpload.map((item) => {
          const fileName = `${Date.now()}_${item.file.name}`;
          return (async () => {
            await uploadImage(fileName, item.file);
            const data = getImage(fileName);
            return { path: fileName, url: data.publicUrl };
          })();
        });

        newImageObjects = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Upload failed:", error);
        dispatch({
          type: "SET_MSG",
          payload: "画像のアップロード中にエラーが発生しました",
        });
        dispatch({ type: "SET_ISLOADING", payload: false });
        return;
      }
    }

    const finalImageUrlList = [...state.existingPictures, ...newImageObjects];

    formData.append("machines", JSON.stringify(newMachine));
    formData.append("images", JSON.stringify(finalImageUrlList));

    let response;
    let responseData;

    try {
      if (method === "POST") {
        response = await fetch("/api/coinLaundry", {
          method: "POST",
          body: formData,
        });
      } else if (method === "PUT") {
        response = await fetch(`/api/coinLaundry/${storeId}`, {
          method: "PUT",
          body: formData,
        });
      }

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(
          errorRes.msg || `HTTP error! status: ${response.status}`
        );
      }

      responseData = await response.json();
    } catch (error) {
      console.error("API Error:", error);
      dispatch({
        type: "SET_MSG",
        payload: error.message || "データの送信に失敗しました。",
      });
      dispatch({ type: "SET_ISLOADING", payload: false });
      if (dialogRef.current) {
        dialogRef.current.click();
      }

      if (newImageObjects.length > 0) {
        console.warn("Rollback: Deleting newly uploaded images...");
        const deletePromises = newImageObjects.map((img) =>
          deleteImage(img.path)
        );
        Promise.all(deletePromises).catch((err) =>
          console.error("Rollback delete failed:", err)
        );
      }
      return;
    }

    const finalImagePaths = new Set(finalImageUrlList.map((img) => img.path));
    const pathsToDelete = images
      .map((img) => img.path)
      .filter((path) => !finalImagePaths.has(path));

    if (pathsToDelete.length > 0) {
      Promise.all(pathsToDelete.map((path) => deleteImage(path)))
        .then(() => console.log("Old images cleaned up."))
        .catch((err) => console.error("Cleanup deletion failed:", err));
    }

    dispatch({ type: "SET_ISLOADING", payload: false });
    sessionStorage.setItem(
      "toast",
      JSON.stringify({
        description: `${responseData.store}店の${
          method === "POST" ? "登録" : "編集"
        }が完了しました。`,
        type: "success",
        closable: true,
      })
    );
    redirect(`/coinLaundry/${responseData.id}`);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formWrapper}>
        <form ref={formRef}>
          <Card.Root maxW="sm" size="lg">
            <Card.Header>
              <Card.Title>
                {method === "POST" && "登録"}
                {method === "PUT" && "編集"}フォーム
              </Card.Title>
              {state.msg && (
                <div className={styles.errorMessage}>{state.msg}</div>
              )}
            </Card.Header>
            <Card.Body>
              <Stack gap="7" w="full">
                <Field.Root>
                  <Field.Label htmlFor="store">店舗名</Field.Label>
                  <InputGroup endAddon="店">
                    <Input
                      size="xs"
                      type="text"
                      name="store"
                      id="store"
                      value={state.store}
                      placeholder="例）四条河原町"
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_DATA",
                          payload: { field: "store", value: e.target.value },
                        })
                      }
                    />
                  </InputGroup>
                </Field.Root>

                <Field.Root>
                  <Field.Label htmlFor="location">場所</Field.Label>
                  <Input
                    size="xs"
                    type="text"
                    name="location"
                    id="location"
                    value={state.location}
                    placeholder="例）京都府京都市下京区"
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FORM_DATA",
                        payload: { field: "location", value: e.target.value },
                      })
                    }
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label htmlFor="description">概要</Field.Label>
                  <Textarea
                    size="xs"
                    type="text"
                    name="description"
                    id="description"
                    resize="none"
                    h="20"
                    value={state.description}
                    placeholder="例）デパートやブティックだけでなく、着物や書道具を商う古くからの店が並ぶ繁華街です。"
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FORM_DATA",
                        payload: {
                          field: "description",
                          value: e.target.value,
                        },
                      })
                    }
                  />
                </Field.Root>

                <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
                  <Drawer.Trigger asChild>
                    <Button
                      className={styles.drawerButton}
                      onClick={() => setOpen((prev) => !prev)}
                    >
                      {open ? "選択中..." : "機械選択"}
                    </Button>
                  </Drawer.Trigger>
                  <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                      <Drawer.Content>
                        {open && (
                          <>
                            <Drawer.Body className={styles.drawerBody}>
                              <MachineForm setOpen={setOpen} />
                            </Drawer.Body>
                            <Drawer.CloseTrigger asChild>
                              <CloseButton />
                            </Drawer.CloseTrigger>
                          </>
                        )}
                      </Drawer.Content>
                    </Drawer.Positioner>
                  </Portal>
                </Drawer.Root>

                <UploadPicture />
                <DeletePicture />
              </Stack>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
              <Link href={`/coinLaundry/${storeId ? storeId : ""}`}>
                <Button variant="outline" className={styles.cancelButton}>
                  キャンセル
                </Button>
              </Link>
              <CheckDialog
                method={method}
                postHander={postHander}
                dialogRef={dialogRef}
              />
            </Card.Footer>
          </Card.Root>
        </form>
      </div>
    </div>
  );
};

export default CoinLaundryForm;
