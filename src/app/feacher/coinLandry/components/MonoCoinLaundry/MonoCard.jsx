import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
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
              color="fg"
              letterSpacing="tight"
            >
              {coinLaundry.store}店
            </Heading>

            <HStack color="fg.muted" fontSize="sm" fontWeight="semibold">
              <Icon.PiMapPin size={18} />
              <Text>{coinLaundry.location}</Text>
            </HStack>

            {coinLaundry.description && (
              <Text
                fontSize="md"
                lineHeight="tall"
                color="fg.muted"
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
              <Flex justifyContent="center" pt={2}>
                <Link href={`/collectMoney/${coinLaundry.id}/newData`}>
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
                </Link>
              </Flex>
            )}
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default MonoCard;
