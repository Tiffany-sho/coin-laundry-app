"use client";

import { Button, Card, Image, List, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import rokkaku from "@/assets/rokkaku.png";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as Icon from "./MonoCardIcon";
import Styles from "./MonoCard.module.css";

const MonoCard = ({ coinLaundry }) => {
  useEffect(() => {
    setTimeout(() => {
      const toastInfo = sessionStorage.getItem("toast");

      if (toastInfo) {
        const toastInfoStr = JSON.parse(toastInfo);

        toaster.create(toastInfoStr);
      }
      sessionStorage.removeItem("toast");
    }, 0);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    fetch(`/api/coinLaundry/${coinLaundry._id}`, {
      method: "DELETE",
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((res) => {
          toaster.create({
            description: res.msg,
            type: "error",
            closable: true,
          });
        });
      }
      return res.json().then((res) => {
        sessionStorage.setItem(
          "toast",
          JSON.stringify({
            description: `${res.store}店を削除しました`,
            type: "warning",
            closable: true,
          })
        );
        redirect("/coinLaundry");
      });
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
                <Icon.BsFillTrash3Fill />
              </Button>
            </form>
            <Link href={`/coinLaundry/${coinLaundry._id}/edit`}>
              <Button variant="solid" ml="auto">
                <Icon.CiEdit />
              </Button>
            </Link>

            <Link href={`/collectMoney/${coinLaundry._id}`}>
              <Button variant="solid">
                <Icon.PiMoney />
              </Button>
            </Link>
          </Card.Footer>
        </Card.Body>
      </div>
    </Card.Root>
  );
};

export default MonoCard;
