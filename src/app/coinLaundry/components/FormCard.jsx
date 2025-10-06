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
} from "@chakra-ui/react";
import { useState } from "react";
import Link from "next/link";

import MachineForm from "./MachineForm";

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
};

const Form = ({ coinLaundry = initinitialCoinLaundry, method, id }) => {
  const [store, setStore] = useState(coinLaundry.store);
  const [location, setLocation] = useState(coinLaundry.location);
  const [description, setDescription] = useState(coinLaundry.description);
  const [machines, setMachines] = useState(coinLaundry.machines);
  const [choose, setChoose] = useState(false);
  const [msg, setMsg] = useState("");
  const [res, resSet] = useState(true);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    formData.append("machines", JSON.stringify(machines));

    if (method === "POST") {
      fetch("/api/coinLaundry", { method: "POST", body: formData })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((res) => {
              resSet(false);
              return res.msg;
            });
          }
          return res.json().then((res) => {
            resSet(true);
            return `${res.store}の登録が完了しました。`;
          });
        })
        .then((msg) => {
          setMsg(msg);
        });
    } else if (method === "PUT") {
      fetch(`/api/coinLaundry/${id}`, { method: "PUT", body: formData })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((res) => {
              resSet(false);
              return res.msg;
            });
          }
          return res.json().then((res) => {
            resSet(true);
            return `${res.store}の編集が完了しました。`;
          });
        })
        .then((msg) => {
          setMsg(msg);
        });
    }
  };
  return (
    <>
      <form onSubmit={onSubmit}>
        <Card.Root maxW="sm" size="lg">
          <Card.Header>
            <Card.Title>編集フォーム</Card.Title>
          </Card.Header>
          <Card.Body>
            <Stack gap="4" w="full">
              <Box display="flex" flexDirection="row" gap="4">
                <Field.Root>
                  <Field.Label htmlFor="store">店舗名</Field.Label>
                  <InputGroup endAddon="店">
                    <Input
                      size="xs"
                      type="text"
                      name="store"
                      id="store"
                      value={store}
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
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Field.Root>
              </Box>
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
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label htmlFor="machiens">設備</Field.Label>
                <Button onClick={() => setChoose((prev) => !prev)}>
                  {choose ? "選択中..." : "選択"}
                </Button>
              </Field.Root>
            </Stack>
          </Card.Body>
          <Card.Footer justifyContent="flex-end">
            <Link
              href={`/coinLaundry/${coinLaundry._id ? coinLaundry._id : ""}`}
            >
              <Button variant="outline">キャンセル</Button>
            </Link>

            <Button variant="solid" type="submit">
              {method === "POST" && "登録"}
              {method === "PUT" && "編集"}
            </Button>
            <div style={{ color: res ? "green" : "red" }}>{msg}</div>
          </Card.Footer>
        </Card.Root>
      </form>
      {choose && (
        <MachineForm
          machines={machines}
          setMachines={setMachines}
          setChoose={setChoose}
        />
      )}
    </>
  );
};

export default Form;
