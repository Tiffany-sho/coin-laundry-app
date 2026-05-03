import Link from "next/link";
import { Button, Card, Flex, Image, Box, Text, HStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const CoinLaundryList = ({ coinLaundry, myRole }) => {
  return (
    <Card.Root
      maxW="sm"
      w="100%"
      overflow="hidden"
      mb={4}
      mx="auto"
      boxShadow="var(--shadow-sm)"
      borderRadius="18px"
      border="1px solid"
      borderColor="var(--divider, #F1F5F9)"
      transition="all 0.3s"
      _hover={{ boxShadow: "0 8px 24px rgba(8,145,178,0.12)", transform: "translateY(-2px)", borderColor: "cyan.200" }}
    >
      <Box
        position="relative"
        w="100%"
        paddingBottom="56.25%"
        overflow="hidden"
        bg="var(--teal-pale, #CFFAFE)"
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

      <Card.Body gap="2" p={5}>
        <Card.Title
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color="var(--text-main, #1E3A5F)"
          letterSpacing="tight"
          noOfLines={1}
        >
          {coinLaundry.store}店
        </Card.Title>

        <HStack color="var(--text-muted, #64748B)" fontSize={{ base: "sm", md: "md" }}>
          <Icon.PiMapPin size={15} />
          <Text noOfLines={1}>{coinLaundry.location}</Text>
        </HStack>
      </Card.Body>

      <Card.Footer gap="2" p={5} pt={0}>
        <Flex gap={2} w="100%">
          <Button
            asChild
            w="100%"
            variant="outline"
            size={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            borderColor="var(--divider, #F1F5F9)"
            color="var(--text-muted, #64748B)"
            _hover={{ bg: "var(--app-bg, #F0F9FF)", borderColor: "cyan.200" }}
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
              size={{ base: "sm", md: "md" }}
              fontWeight="semibold"
              color="white"
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)", flex: 1 }}
              _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(8,145,178,0.28)" }}
              transition="all 0.2s"
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
