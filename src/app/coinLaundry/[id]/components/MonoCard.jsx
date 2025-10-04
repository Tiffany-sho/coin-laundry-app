import { Button, Card, Image, List, Text } from "@chakra-ui/react";
import { useState } from "react";
import rokkaku from "@/assets/rokkaku.png";
import Link from "next/link";

const MonoCard = ({ coinLaundry }) => {
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    console.log("here");
    const form = e.target;
    const formData = new FormData(form);
    fetch(`/api/coinLaundry/${coinLaundry._id}`, {
      method: "DELETE",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((res) => {
            return res.msg;
          });
        }
        return res.json().then((res) => {
          return `${res.store}の削除が完了しました。`;
        });
      })
      .then((msg) => {
        setMsg(msg);
      });
  };
  return (
    <Card.Root width="90%" ml="5%" mt="5%" overflow="hidden">
      <Image src={rokkaku.src} alt="Green double couch with wooden legs" />
      <Card.Body gap="2">
        <Card.Title textStyle="3xl" fontWeight="large" letterSpacing="wide">
          せんたくランド{coinLaundry.store}店
        </Card.Title>
        <Card.Description>場所 : {coinLaundry.location}</Card.Description>
        <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight" m="5">
          {coinLaundry.description}
        </Text>
        <Text textStyle="xl" fontWeight="medium">
          設備 :{" "}
        </Text>
        <List.Root>
          {coinLaundry.machines.map((machine) => {
            return (
              <List.Item key={machine.name}>
                {machine.name}×{machine.num},
              </List.Item>
            );
          })}
        </List.Root>
      </Card.Body>
      <Card.Footer gap="2">
        <Link href={`/coinLaundry/${coinLaundry._id}/edit`}>
          <Button variant="outline" ml="auto">
            編集
          </Button>
        </Link>

        <form onSubmit={onSubmit} action="/coinLaundry">
          <Button type="submit">削除</Button>
        </form>

        <Button variant="solid" ml="auto">
          集金
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default MonoCard;
