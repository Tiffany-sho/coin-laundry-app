// CoinLaundryList.jsx
import Link from "next/link";
import { Button, Card, Flex, Image, Box, Grid } from "@chakra-ui/react";
import DisplayMonthBenifit from "./DisplayMonthBenifit";
import * as Icon from "@/app/feacher/Icon";

const CoinLaundryList = ({ coinLaundry, benefitRecords, myRole }) => {
  return (
    <Card.Root
      maxW="sm"
      w="100%"
      overflow="hidden"
      mb={4}
      mx="auto"
      boxShadow="lg"
      borderRadius="16px"
      transition="all 0.3s"
      _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }}
    >
      <Box
        position="relative"
        w="100%"
        paddingBottom="56.25%"
        overflow="hidden"
        bg="gray.100"
      >
        <Image
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          objectFit="cover"
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
      </Box>

      <Card.Body gap="3" p={5}>
        <Card.Title
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color="gray.700"
          letterSpacing="tight"
          noOfLines={1}
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
          noOfLines={1}
        >
          <Icon.PiMapPin />
          {coinLaundry.location}
        </Card.Description>

        <DisplayMonthBenifit records={benefitRecords} />
       
      </Card.Body>

      <Card.Footer gap="2" p={5} pt={0}>
        <Flex gap={2} w="100%">
          <Button
            asChild
            w="100%"
            variant="outline"
            size={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            transition="all 0.2s"
            style={{ flex: 1 }}
          >
            <Link href={`/coinLaundry/${coinLaundry.id}`}>
              <Icon.BiMessageSquareDetail /> 詳細
            </Link>
          </Button>

          {myRole !== "viewer" && (
            <Button
              asChild
              w="100%"
              colorPalette="blue"
              size={{ base: "sm", md: "md" }}
              fontWeight="semibold"
              transition="all 0.2s"
              style={{ flex: 1 }}
            >
              <Link href={`/collectMoney/${coinLaundry.id}/newData`}>
                <Icon.TbCoinYenFilled /> 集金へ
              </Link>
            </Button>
          )}
        </Flex>
      </Card.Footer>
    </Card.Root>
  );
};

export default CoinLaundryList;
