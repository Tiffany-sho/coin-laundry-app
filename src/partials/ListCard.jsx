import Link from "next/link";
import { Box, Button, Card, HStack, Image } from "@chakra-ui/react";

const ListCard = ({ coinLaundry }) => {
  return (
    <Card.Root flexDirection="row" overflow="hidden" maxW="90%" ml="5%" mb="1%">
      <Image
        objectFit="cover"
        maxW="200px"
        src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"
        alt="Caffe Latte"
      />
      <Box>
        <Card.Body>
          <Card.Title mb="2">せんたくランド{coinLaundry.store}店</Card.Title>
          <Card.Description>{coinLaundry.description}</Card.Description>
          <HStack mt="4"></HStack>
        </Card.Body>
        <Card.Footer>
          <Link href={`/coinLaundry/${coinLaundry._id}`}>
            <Button>もっと見る</Button>
          </Link>
        </Card.Footer>
      </Box>
    </Card.Root>
  );
};

export default ListCard;
