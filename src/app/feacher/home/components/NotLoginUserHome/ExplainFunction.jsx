import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import React from "react";

const ExplainFunction = () => {
  const features = [
    {
      icon: <Icon.PiHandCoinsLight />,
      title: "集金記録",
      description: "簡単に集金状況を記録・管理できます",
    },
    {
      icon: <Icon.LuPackage />,
      title: "在庫管理",
      description: "洗剤・柔軟剤の在庫を一元管理",
    },
    {
      icon: <Icon.LiaStoreSolid />,
      title: "店舗一覧",
      description: "複数店舗をまとめて管理できます",
    },
    {
      icon: <Icon.VscGraphLine />,
      title: "レポート",
      description: "売上分析で経営を可視化します",
    },
  ];

  return (
    <Box py={{ base: 16, md: 20 }} bg="white">
      <Container maxW="container.xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          <VStack spacing={4} textAlign="center">
            <Heading size={{ base: "lg", md: "xl" }} color="gray.800">
              主な機能
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
              コインランドリー経営に必要な機能を全て搭載
            </Text>
          </VStack>

          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={{ base: 4, md: 6 }}
            w="full"
          >
            {features.map((feature, index) => (
              <GridItem key={index}>
                <Stack
                  align="center"
                  p={{ base: 6, md: 8 }}
                  borderRadius="xl"
                  border="1px"
                  borderColor="gray.200"
                  bg="blue.50"
                  _hover={{
                    borderColor: "blue.300",
                    boxShadow: "lg",
                    transform: "translateY(-8px)",
                    bg: "blue.50",
                  }}
                  transition="all 0.3s"
                  h="full"
                  cursor="pointer"
                >
                  <Text
                    fontSize={{ base: "40px", md: "48px" }}
                    color="blue.600"
                    mb={4}
                  >
                    {feature.icon}
                  </Text>
                  <Heading
                    size={{ base: "sm", md: "md" }}
                    mb={3}
                    color="gray.800"
                  >
                    {feature.title}
                  </Heading>
                  <Text
                    textAlign="center"
                    color="gray.600"
                    fontSize={{ base: "sm", md: "md" }}
                    lineHeight="1.6"
                  >
                    {feature.description}
                  </Text>
                </Stack>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default ExplainFunction;
