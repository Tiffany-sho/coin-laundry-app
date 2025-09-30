import { Button, Card, Image, Text } from "@chakra-ui/react";

const MonoCard = ({ coinLaundry }) => {
  return (
    <Card.Root width="90%" ml="5%" overflow="hidden">
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
        alt="Green double couch with wooden legs"
      />
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
