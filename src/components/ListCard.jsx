import Link from "next/link";
import { Box, Button, Card, HStack, Image } from "@chakra-ui/react";
import rokkaku from "@/assets/rokkaku.png";

const ListCard = ({ coinLaundry, valiant }) => {
  return (
    <Card.Root flexDirection="row" overflow="hidden" maxW="90%" ml="5%" mb="1%">
      <Image
        objectFit="cover"
        maxW="200px"
        src={rokkaku.src}
        alt="Caffe Latte"
      />
      <Box>
        <Card.Body>
          <Card.Title mb="2">せんたくランド{coinLaundry.store}店</Card.Title>
          <Card.Description>{coinLaundry.description}</Card.Description>
          <HStack mt="4"></HStack>
        </Card.Body>
        <Card.Footer>
          <Link href={`/coinLaundry/${coinLaundry._id}/moneyData`}>
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

export default ListCard;
