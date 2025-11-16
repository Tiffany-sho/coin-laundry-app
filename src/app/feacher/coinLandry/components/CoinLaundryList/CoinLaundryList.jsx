// CoinLaundryList.jsx
import Link from "next/link";
import { Button, Card, Flex, Image, Box, Grid } from "@chakra-ui/react";
import DisplayMonthBenifit from "./DisplayMonthBenifit";
import NowLaundryNum from "../NowLaundryNum";
import * as Icon from "@/app/feacher/Icon";
import MachinesState from "../MachinesState";

const CoinLaundryList = ({ coinLaundry }) => {
  return (
    <Card.Root
      maxW="sm"
      overflow="hidden"
      mb={4}
      mx="auto"
      boxShadow="lg"
      borderRadius="16px"
      transition="all 0.3s"
      _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }}
    >
      <Image
        objectFit="cover"
        w="100%"
        h="200px"
        src={
          !coinLaundry.images || coinLaundry.images.length === 0
            ? "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/no-image.png"
            : coinLaundry.images[0].url
        }
        alt={
          !coinLaundry.images || coinLaundry.images.length === 0
            ? "画像なし"
            : `${coinLaundry.store}店`
        }
      />

      <Card.Body gap="3" p={5}>
        <Card.Title
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color="gray.700"
          letterSpacing="tight"
        >
          {coinLaundry.store}店
        </Card.Title>

        <Card.Description
          display="inline-flex"
          alignItems="center"
          gap="1"
          fontSize={{ base: "sm", md: "md" }}
          color="gray.600"
          lineHeight="1.7"
        >
          <Icon.PiMapPin />
          {coinLaundry.location}
        </Card.Description>

        <Grid templateRow="1fr 1fr" gap={3} mt={2}>
          <Box
            bg="blue.50"
            p={3}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="blue.500"
          >
            <DisplayMonthBenifit id={coinLaundry.id} />
          </Box>

          <Flex gap={3} alignContent="space-around" flexDirection="row">
            <NowLaundryNum id={coinLaundry.id} />
            <MachinesState id={coinLaundry.id} />
          </Flex>
        </Grid>
      </Card.Body>

      <Card.Footer gap="2" p={5} pt={0}>
        <Flex gap={2} w="100%">
          <Link href={`/coinLaundry/${coinLaundry.id}`} style={{ flex: 1 }}>
            <Button
              w="100%"
              bg="blue.500"
              size={{ base: "sm", md: "md" }}
              color="white"
              fontWeight="semibold"
              transition="all 0.2s"
              _hover={{ bg: "gray.800" }}
            >
              <Icon.BiMessageSquareDetail /> 詳細
            </Button>
          </Link>

          <Link
            href={`/collectMoney/${coinLaundry.id}/newData`}
            style={{ flex: 1 }}
          >
            <Button
              w="100%"
              bg="green.500"
              size={{ base: "sm", md: "md" }}
              borderColor="green.300"
              color="white"
              fontWeight="semibold"
              transition="all 0.2s"
              _hover={{ bg: "gray.50" }}
            >
              <Icon.TbCoinYenFilled /> 集金
            </Button>
          </Link>
        </Flex>
      </Card.Footer>
    </Card.Root>
  );
};

export default CoinLaundryList;
