"use client";

import { Button, Card, Image, List, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as Icon from "./MonoCardIcon";
import Styles from "./MonoCard.module.css";
import AlertDialog from "@/app/feacher/dialog/AlertDialog";

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

  const onSubmit = (e) => {
    e.preventDefault();
  };

  const deleteAction = async () => {
    fetch(`/api/coinLaundry/${coinLaundry._id}`, {
      method: "DELETE",
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
        toaster.create({
          description: `${res.store}店を削除しました`,
          type: "warning",
          closable: true,
        });

        redirect(`/coinLaundry/${res.id}`);
      });
    });
  };
  return (
    <Card.Root width="90%" ml="5%" overflow="hidden">
      <div className={Styles.monocontainer}>
        {!coinLaundry.images || coinLaundry.images.length === 0 ? (
          <Image
            src="https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/no-image.png"
            h="100%"
          />
        ) : (
          <Image src={coinLaundry.images[0].url} h="100%" />
        )}

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
            <form onSubmit={onSubmit}>
              <AlertDialog
                target={`${coinLaundry.store}店`}
                deleteAction={deleteAction}
              />
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
