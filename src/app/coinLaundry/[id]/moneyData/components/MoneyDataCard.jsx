import { Table, Heading, Text } from "@chakra-ui/react";
import { createNowData } from "@/date";

const MoneyDataCard = ({ item }) => {
  return (
    <>
      <Heading size="lg">
        {item.store}
        <Text textStyle="sm"> {createNowData(item.date)}</Text>
      </Heading>
      <Table.Root size="md" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>設備</Table.ColumnHeader>
            <Table.ColumnHeader>売上</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {item.moneyArray.map((item) => (
            <Table.Row key={item._id}>
              <Table.Cell>{item.machine.name}</Table.Cell>
              <Table.Cell>{item.money}</Table.Cell>
            </Table.Row>
          ))}
          <Table.Row key={item.total}>
            <Table.Cell>合計</Table.Cell>
            <Table.Cell>{item.total}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default MoneyDataCard;
