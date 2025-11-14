import { Box, Table, Skeleton, Flex } from "@chakra-ui/react";

const TableLoading = ({ rows = 5 }) => {
  return (
    <Table.Body>
      {Array.from({ length: rows }).map((_, index) => (
        <Table.Row
          key={index}
          _hover={{ bg: "gray.50" }}
          animation={`fadeIn 0.5s ease-in ${index * 0.1}s`}
          sx={{
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        >
          <Table.Cell py={4}>
            <Skeleton
              height="16px"
              width="80%"
              borderRadius="md"
              mb={2}
              startColor="gray.100"
              endColor="gray.200"
            />
          </Table.Cell>

          <Table.Cell>
            <Skeleton
              ml="auto"
              height="20px"
              width="30%"
              borderRadius="md"
              startColor="gray.100"
              endColor="gray.200"
            />
          </Table.Cell>

          <Table.Cell py={4} textAlign="right">
            <Skeleton
              ml="auto"
              height="32px"
              width="60px"
              borderRadius="md"
              startColor="gray.100"
              endColor="gray.200"
            />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  );
};

export default TableLoading;
