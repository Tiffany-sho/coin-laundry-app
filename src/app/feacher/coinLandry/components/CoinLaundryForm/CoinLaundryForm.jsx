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

import MachineForm from "./MachineForm";
import { redirect } from "next/navigation";
import {
  getImage,
  uploadImage,
  deleteImage,
} from "@/app/api/supabaseFunctions/route";
import CheckDialog from "@/app/feacher/dialog/CheckDialog";
import UploadPicture from "./UploadPicture";
import DeletePicture from "./DeletePicture";

import { useCoinLaundryForm } from "../../context/CoinlaundryForm/CoinLaundryFormContext";

const initinitialCoinLaundry = {
  store: "",
  location: "",
  description: "",
  machines: [
    {
      name: "洗濯乾燥機",
      num: 0,
    },
    {
      name: "乾燥機",
      num: 0,
    },
    {
      name: "洗濯機",
      num: 0,
    },
    {
      name: "スニーカー洗濯機",
      num: 0,
    },
    {
      name: "ソフター自販機",
      num: 0,
    },
  ],
  images: [],
};

const CoinLaundryForm = ({ coinLaundry = initinitialCoinLaundry, method }) => {
  const [state, dispatch] = useCoinLaundryForm();

  console.log(state);

  const [pictureUrl, setPictureUrl] = useState(coinLaundry.images);
  const [pictureFile, setPictureFile] = useState([]);
  const [machines, setMachines] = useState(coinLaundry.machines);

  const [choose, setChoose] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [isLoading, setLoading] = useState(false);

  const formRef = useRef(null);

  const postHander = async () => {
    if (!formRef.current || isLoading) return;

    setLoading(true);
    setMsg("");

    const formData = new FormData(formRef.current);
    const newMachine = machines.filter((machine) => machine.num > 0);

    const filesToUpload = pictureFile.filter((item) => item.file);
    console.log(filesToUpload);

    if (filesToUpload.lenght > 0) {
      const invalidFiles = filesToUpload.some(
        (item) =>
          item.file.type !== "image/jpeg" && item.file.type !== "image/png"
      );
      if (invalidFiles) {
        setMsg("jpeg/pngファイルを選択してください");
        setLoading(false);
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
        setMsg("画像のアップロード中にエラーが発生しました。");
        setLoading(false);
        return;
      }
    }

    const finalImageUrlList = [...pictureUrl, ...newImageObjects];

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
        response = await fetch(`/api/coinLaundry/${coinLaundry._id}`, {
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
      setMsg(error.message || "データの送信に失敗しました。");
      setLoading(false);

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
    const pathsToDelete = coinLaundry.images
      .map((img) => img.path)
      .filter((path) => !finalImagePaths.has(path));

    if (pathsToDelete.length > 0) {
      Promise.all(pathsToDelete.map((path) => deleteImage(path)))
        .then(() => console.log("Old images cleaned up."))
        .catch((err) => console.error("Cleanup deletion failed:", err));
    }

    setLoading(false);
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
    <>
      <form ref={formRef}>
        <Card.Root maxW="sm" size="lg">
          <Card.Header>
            <Card.Title>
              {method === "POST" && "登録"}
              {method === "PUT" && "編集"}フォーム
            </Card.Title>
            <div style={{ color: "red" }}>{msg}</div>
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
                    value={store}
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
                  value={location}
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
                  value={description}
                  placeholder="例）デパートやブティックだけでなく、着物や書道具を商う古くからの店が並ぶ繁華街です。"
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FORM_DATA",
                      payload: { field: "description", value: e.target.value },
                    })
                  }
                />
              </Field.Root>

              <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
                <Drawer.Trigger asChild>
                  <Button onClick={() => setChoose((prev) => !prev)}>
                    {choose ? "選択中..." : "機械選択"}
                  </Button>
                </Drawer.Trigger>
                <Portal>
                  <Drawer.Backdrop />
                  <Drawer.Positioner>
                    <Drawer.Content>
                      {choose && (
                        <>
                          <Drawer.Header>
                            <Drawer.Title>
                              機械の個数を選択してください
                            </Drawer.Title>
                          </Drawer.Header>
                          <Drawer.Body>
                            <MachineForm
                              machines={machines}
                              setMachines={setMachines}
                              setChoose={setChoose}
                              setOpen={setOpen}
                              open={open}
                            />
                          </Drawer.Body>
                          <Drawer.CloseTrigger asChild>
                            <CloseButton size="sm" />
                          </Drawer.CloseTrigger>
                        </>
                      )}
                    </Drawer.Content>
                  </Drawer.Positioner>
                </Portal>
              </Drawer.Root>
              <UploadPicture
                pictureFile={pictureFile}
                setPictureFile={setPictureFile}
              />
              <DeletePicture
                pictureUrl={pictureUrl}
                setPictureUrl={setPictureUrl}
              />
            </Stack>
          </Card.Body>
          <Card.Footer justifyContent="flex-end">
            <Link
              href={`/coinLaundry/${coinLaundry._id ? coinLaundry._id : ""}`}
            >
              <Button variant="outline">キャンセル</Button>
            </Link>
            <CheckDialog
              method={method}
              postHander={postHander}
              store={store}
              location={location}
              description={description}
              machines={machines}
              pictureFile={pictureFile}
              pictureUrl={pictureUrl}
            />
          </Card.Footer>
        </Card.Root>
      </form>
    </>
  );
};

export default CoinLaundryForm;
