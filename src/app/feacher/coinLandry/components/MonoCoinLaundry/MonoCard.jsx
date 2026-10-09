import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import CollectStartButton from "@/app/feacher/collectMoney/components/collectMoneyForm/parts/CollectStartButton";
import ImageCarousel from "./ImageCarusel/ImageCarusel";
import ActionMenu from "./ActionMenu/ActionMenu";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Grid,
} from "@chakra-ui/react";
import MonoDataTotal from "./MonoDataTotal";
import MachinesState from "../MachinesState";
import NowLaundryNum from "../NowLaundryNum";
import HaveMachines from "./HaveMachines";
import PaymentMethodChips from "@/app/feacher/coinLandry/components/PaymentMethodChips";

const MonoCard = ({ coinLaundry, myRole }) => {
  const isOwner = myRole === "admin";
  const canEdit = myRole !== "viewer";

  return (
    <Box py={{ base: 6, md: 10 }}>
      <Container px={0}>
        <ImageCarousel images={coinLaundry.images} />

        <Box pt={{ base: 6, md: 8 }} position="relative">
          {isOwner && <ActionMenu id={coinLaundry.id} store={coinLaundry.store} />}

          <VStack align="stretch" gap={6}>
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="var(--text-main)"
              letterSpacing="tight"
            >
              {coinLaundry.store}店
            </Heading>

            <HStack color="var(--text-muted)" fontSize="sm" fontWeight="semibold">
              <Icon.PiMapPin size={18} />
              <Text>{coinLaundry.location}</Text>
            </HStack>

            {/* 支払方法。編集後にここで確かめられるよう一覧と同じチップを出す */}
            <PaymentMethodChips methods={coinLaundry.paymentMethods} size="md" />

            {coinLaundry.description && (
              <Text
                fontSize="md"
                lineHeight="tall"
                color="var(--text-muted)"
                whiteSpace="pre-wrap"
              >
                {coinLaundry.description}
              </Text>
            )}

            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={4}
              mt={2}
            >
              <MonoDataTotal coinLaundry={coinLaundry} />
              <HaveMachines coinLaundry={coinLaundry} />
              <NowLaundryNum id={coinLaundry.id} canEdit={canEdit} />
              <MachinesState id={coinLaundry.id} canEdit={canEdit} />
            </Grid>

            {canEdit && (
              <VStack gap={3} pt={2}>
                <Flex justifyContent="center">
                  {/* ⚠️ 直接 Link にしない。支払方法がある店舗では何を集金するか聞く */}
                  <CollectStartButton store={coinLaundry}>
                    <Button
                      size="lg"
                      color="white"
                    style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                    boxShadow="0 4px 14px rgba(8,145,178,0.28)"
                      fontWeight="semibold"
                      px={8}
                      _hover={{ transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                      boxShadow="md"
                    >
                      <Icon.PiHandCoinsLight size={24} />
                      集金を開始
                    </Button>
                  </CollectStartButton>
                </Flex>

                {/*
                  過去の集金データの一括入力への導線。
                  ⚠️ **`ActionMenu`（「…」）に入れないこと。** あちらは `isOwner`
                     （admin）でしか出さないが、集金の登録は viewer 以外なら誰でも
                     できる。「…」に置くと**権限が集金登録と食い違い**、担当店舗を
                     持つ集金担当者が過去分を入れられなくなる（iOS 版は「…」から
                     開くが、あちらのメニューに admin 限定という制約が無い）。
                  ⚠️ **控えめな副導線のままにすること。** 店舗登録の直後に長い入力を
                     必須に見せると離脱する、という理由で任意の導線にしてある。
                */}
                <Link href={`/collectMoney/${coinLaundry.id}/backfill`}>
                  <HStack
                    gap={1}
                    color="var(--text-muted)"
                    fontSize="sm"
                    fontWeight="semibold"
                    cursor="pointer"
                    _hover={{ color: "var(--teal-deeper, #155E75)" }}
                    transition="color 0.2s"
                  >
                    <Icon.LuHistory size={16} />
                    <Text>過去の集金データを入力</Text>
                  </HStack>
                </Link>
              </VStack>
            )}
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default MonoCard;
