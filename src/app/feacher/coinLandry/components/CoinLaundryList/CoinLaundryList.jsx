import Link from "next/link";
import { Box, Button, Card, HStack, Image } from "@chakra-ui/react";

const CoinLaundryList = ({ coinLaundry, valiant }) => {
  return (
    <Card.Root flexDirection="row" overflow="hidden" maxW="90%" ml="5%" mb="1%">
      {!coinLaundry.images || coinLaundry.images.length === 0 ? (
        <Image
          objectFit="cover"
          maxW="200px"
          src="https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/no-image.png"
        />
      ) : (
        <Image objectFit="cover" maxW="200px" src={coinLaundry.images[0].url} />
      )}
      <Box>
        <Card.Body>
          <Card.Title mb="2">せんたくランド{coinLaundry.store}店</Card.Title>
          <Card.Description>{coinLaundry.description}</Card.Description>
          <HStack mt="4"></HStack>
        </Card.Body>
        <Card.Footer>
          <Link
            href={`/coinLaundry/${coinLaundry._id}/${
              valiant === "collect" ? "coinDataList" : ""
            }`}
          >
            <Button>もっと見る</Button>
          </Link>
          {valiant === "collect" && (
            <>
              <Link href={`/collectMoney/${coinLaundry._id}`}>
                <Button>集金</Button>
              </Link>
            </>
          )}
        </Card.Footer>
      </Box>
    </Card.Root>
  );
};

export default CoinLaundryList;
