import { Box, Button, Card, Image, List, Text } from "@chakra-ui/react";
import { useState } from "react";
import rokkaku from "@/assets/rokkaku.png";
import Link from "next/link";
import { BsFillTrash3Fill } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { PiMoney } from "react-icons/pi";
import { redirect } from "next/navigation";
import Styles from "./MonoCard.module.css";

const MonoCard = ({ coinLaundry }) => {
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
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
          sessionStorage.setItem(
            "toast",
            JSON.stringify({
              description: `${res.store}を削除しました`,
              type: "warning",
              closable: true,
            })
          );
          redirect("/coinLaundry");
        });
      })
      .then((msg) => {
        setMsg(msg);
      });
  };
  return (
    <Card.Root width="90%" ml="5%" overflow="hidden">
      <div className={Styles.monocontainer}>
        <Image src={rokkaku.src} h="100%" />
        <Card.Body gap="2">
          <Card.Title
            fontWeight="large"
            letterSpacing="wide"
            className={Styles.title}
          >
            せんたくランド{coinLaundry.store}店
          </Card.Title>
          <Card.Description>場所 : {coinLaundry.location}</Card.Description>
          <Text
            fontWeight="medium"
            letterSpacing="tight"
            m="5"
            className={Styles.description}
          >
            {coinLaundry.description}
          </Text>
          <Text className={Styles.title} fontWeight="medium">
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

          <Card.Footer gap="2" ml="auto">
            <form onSubmit={onSubmit} action={"/coinLaundry"}>
              <Button type="submit" variant="solid">
                <BsFillTrash3Fill />
              </Button>
            </form>
            <Link href={`/coinLaundry/${coinLaundry._id}/edit`}>
              <Button variant="solid" ml="auto">
                <CiEdit />
              </Button>
            </Link>

            <Link href={`/collectMoney/${coinLaundry._id}`}>
              <Button variant="solid">
                <PiMoney />
              </Button>
            </Link>
          </Card.Footer>
          <div>{msg}</div>
        </Card.Body>
      </div>
    </Card.Root>
  );
};

export default MonoCard;
