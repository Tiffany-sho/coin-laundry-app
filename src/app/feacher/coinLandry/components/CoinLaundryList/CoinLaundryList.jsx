import Link from "next/link";
import { Box, Button, Card, Image, Flex } from "@chakra-ui/react";

const CoinLaundryList = ({ coinLaundry, valiant }) => {
  // console.log(coinLaundry.id);
  return (
    <Card.Root
      flexDirection="row"
      overflow="hidden"
      maxW="1200px"
      w="90%"
      mx="auto"
      mb={4}
      boxShadow="lg"
      borderRadius="16px"
      transition="all 0.3s"
    >
      <Box
        position="relative"
        minW={{ base: "120px", md: "200px" }}
        maxW={{ base: "120px", md: "200px" }}
        overflow="hidden"
      >
        {!coinLaundry.images || coinLaundry.images.length === 0 ? (
          <Image
            objectFit="cover"
            w="100%"
            h="100%"
            src="https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/no-image.png"
            alt="画像なし"
          />
        ) : (
          <Image
            objectFit="cover"
            w="100%"
            h="100%"
            src={coinLaundry.images[0].url}
            alt={`${coinLaundry.store}店`}
          />
        )}
      </Box>

      <Flex direction="column" flex="1" justify="space-between">
        <Card.Body p={{ base: 4, md: 6 }}>
          <Card.Title
            mb={3}
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="gray.700"
            letterSpacing="tight"
          >
            {coinLaundry.store}店
          </Card.Title>
          <Card.Description
            fontSize={{ base: "sm", md: "md" }}
            color="gray.600"
            lineHeight="1.7"
            noOfLines={2}
          >
            {coinLaundry.description}
          </Card.Description>
        </Card.Body>

        <Card.Footer p={{ base: 4, md: 6 }} pt={0} gap={3}>
          <Link
            href={`/coinLaundry/${coinLaundry.id}/${
              valiant === "collect" ? "coinDataList" : ""
            }`}
          >
            <Button
              variant="outline"
              size={{ base: "sm", md: "md" }}
              borderColor="gray.300"
              color="gray.700"
              fontWeight="semibold"
              transition="all 0.2s"
            >
              もっと見る
            </Button>
          </Link>

          {valiant === "collect" && (
            <Link href={`/collectMoney/${coinLaundry._id}`}>
              <Button
                variant="solid"
                size={{ base: "sm", md: "md" }}
                bg="gray.700"
                color="white"
                fontWeight="semibold"
                transition="all 0.2s"
              >
                集金
              </Button>
            </Link>
          )}
        </Card.Footer>
      </Flex>
    </Card.Root>
  );
};

export default CoinLaundryList;
