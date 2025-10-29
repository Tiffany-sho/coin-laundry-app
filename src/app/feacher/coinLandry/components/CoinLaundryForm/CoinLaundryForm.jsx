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
  const [store, setStore] = useState(coinLaundry.store);
  const [location, setLocation] = useState(coinLaundry.location);
  const [description, setDescription] = useState(coinLaundry.description);

  const [pictureUrl, setPictureUrl] = useState(coinLaundry.images);
  const [pictureFile, setPictureFile] = useState([]);
  const [machines, setMachines] = useState(coinLaundry.machines);

  const [choose, setChoose] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const formRef = useRef(null);

  const postHander = async () => {
    console.log("click");
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const newMachine = machines.filter((machine) => machine.num > 0);
    const imageUrl = [...pictureUrl];
    for (let item of pictureFile) {
      if (!item.file) {
        return;
      }
      if (item.file.type !== "image/jpeg" && item.file.type !== "image/png") {
        setMsg("jpeg/pngファイルを選択してください");
        return;
      }
      const fileName = `${Date.now()}_${item.file.name}`;
      await uploadImage(fileName, item.file);
      const data = getImage(fileName);
      const dataObj = {
        path: item.file.name,
        url: data.publicUrl,
      };
      imageUrl.push(dataObj);
    }

    if (coinLaundry.images.length !== pictureUrl.length) {
      const setUrl = new Set(pictureUrl);
      const deleteArray = coinLaundry.images.filter((ele) => !setUrl.has(ele));
      for (let item of deleteArray) {
        await deleteImage(item.path);
      }
    }

    formData.append("machines", JSON.stringify(newMachine));
    formData.append("images", JSON.stringify(imageUrl));

    let response;
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
      setMsg(errorRes.msg || "エラーが発生しました。");
      return;
    }

    const res = await response.json();
    sessionStorage.setItem(
      "toast",
      JSON.stringify({
        description: `${res.store}店の${
          method === "POST" ? "登録" : "編集"
        }が完了しました。`,
        type: "success",
        closable: true,
      })
    );
    redirect(`/coinLaundry/${res.id}`);
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
                    onChange={(e) => setStore(e.target.value)}
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
                  onChange={(e) => setLocation(e.target.value)}
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
                  onChange={(e) => setDescription(e.target.value)}
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
            <CheckDialog method={method} postHander={postHander} />
          </Card.Footer>
        </Card.Root>
      </form>
    </>
  );
};

export default CoinLaundryForm;
