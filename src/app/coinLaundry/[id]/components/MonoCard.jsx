import { Button, Card, Image, Text } from "@chakra-ui/react";
import rokkaku from "@/assets/rokkaku.png";

const MonoCard = ({ coinLaundry }) => {
  return (
    <Card.Root width="90%" ml="5%" mt="5%" overflow="hidden">
      <Image src={rokkaku.src} alt="Green double couch with wooden legs" />
      <Card.Body gap="2">
        <Card.Title textStyle="3xl" fontWeight="large" letterSpacing="wide">
          せんたくランド{coinLaundry.store}店
        </Card.Title>
        <Card.Description>場所 : {coinLaundry.location}</Card.Description>
        <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight" m="5">
          {coinLaundry.description}
        </Text>
        <Text textStyle="xl" fontWeight="medium">
          設備 :
          {coinLaundry.machines.map((machine, index, array) => {
            if (index === array.length - 1)
              return <span key={machine}>{machine}</span>;
            return <span key={machine}>{machine},</span>;
          })}
        </Text>
      </Card.Body>
      <Card.Footer gap="2">
        <Button variant="solid" ml="auto">
          集金
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default MonoCard;
