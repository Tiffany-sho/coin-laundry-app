import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import ImageCarousel from "./ImageCarusel/ImageCarusel";
import ActionMenu from "./ActionMenu/ActionMenu";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Grid,
} from "@chakra-ui/react";
import MonoDataTotal from "./MonoDataTotal";
import MachinesState from "../MachinesState";
import NowLaundryNum from "../NowLaundryNum";
import HaveMachines from "./HaveMachines";

const MonoCard = ({ coinLaundry }) => {
  return (
    <Box minH="100vh" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
      <Container maxW="900px" px={0}>
        <Box
          bg="white"
          borderRadius="16px"
          overflow="hidden"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.15)"
        >
          <ImageCarousel images={coinLaundry.images} />

          <Box p={{ base: 6, md: 8 }} position="relative">
            <ActionMenu id={coinLaundry.id} store={coinLaundry.store} />

            <VStack align="stretch" gap={6}>
              <Heading
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color="gray.700"
                letterSpacing="tight"
              >
                {coinLaundry.store}店
              </Heading>

              <HStack color="gray.600" fontSize="sm" fontWeight="semibold">
                <Icon.PiMapPin size={18} />
                <Text>{coinLaundry.location}</Text>
              </HStack>
              {coinLaundry.description && (
                <Box p={5} borderRadius="lg" borderColor="gray.700">
                  <Text
                    fontSize="md"
                    lineHeight="tall"
                    color="gray.700"
                    whiteSpace="pre-wrap"
                  >
                    {coinLaundry.description}
                  </Text>
                </Box>
              )}

              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={4}
                mt={2}
              >
                <MonoDataTotal coinLaundry={coinLaundry} />
                <HaveMachines coinLaundry={coinLaundry} />
                <NowLaundryNum id={coinLaundry.id} />
                <MachinesState id={coinLaundry.id} />
              </Grid>
            </VStack>
          </Box>

          {/* フッター */}
          <Flex
            justifyContent="center"
            p={{ base: 4, md: 6 }}
            bg="gray.50"
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <Link href={`/collectMoney/${coinLaundry.id}/newData`}>
              <Button
                size="lg"
                bg="green.500"
                color="white"
                w="100%"
                fontWeight="semibold"
                px={8}
                _hover={{ bg: "gray.800", transform: "translateY(-2px)" }}
                transition="all 0.2s"
                boxShadow="md"
              >
                <Icon.PiHandCoinsLight size={24} />
                集金を開始
              </Button>
            </Link>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default MonoCard;
