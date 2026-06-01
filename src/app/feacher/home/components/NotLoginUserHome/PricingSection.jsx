import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

const checkMark = (ok) =>
  ok ? (
    <Box color="var(--teal)" mr={2} flexShrink={0} display="inline-flex" alignItems="center">
      <Icon.LuCheck size={15} />
    </Box>
  ) : (
    <Box color="var(--text-faint)" mr={2} flexShrink={0} display="inline-flex" alignItems="center">
      <Icon.LuMinus size={15} />
    </Box>
  );

const plans = [
  {
    name: "Free",
    price: "¥0",
    period: "/月　ずっと無料",
    cta: "無料で始める",
    ctaHref: "/auth/login",
    featured: false,
    rows: [
      { label: "店舗数", value: "3店舗まで", ok: true },
      { label: "集金記録", value: "", ok: true },
      { label: "在庫管理", value: "", ok: true },
      { label: "機器状態管理", value: "", ok: true },
      { label: "売上グラフ", value: "", ok: true },
      { label: "CSV/Excelエクスポート", value: "", ok: false },
      { label: "チームメンバー招待", value: "", ok: false },
    ],
  },
  {
    name: "Pro",
    price: "¥780",
    period: "/月（税込）",
    badge: "おすすめ",
    trial: "6か月無料トライアル",
    cta: "6か月無料で試す",
    ctaHref: "/auth/login",
    featured: true,
    rows: [
      { label: "店舗数", value: "5店舗まで", ok: true },
      { label: "集金記録", value: "", ok: true },
      { label: "在庫管理", value: "", ok: true },
      { label: "機器状態管理", value: "", ok: true },
      { label: "売上グラフ", value: "", ok: true },
      { label: "CSV/Excelエクスポート", value: "", ok: true },
      { label: "チームメンバー招待", value: "", ok: true },
    ],
  },
  {
    name: "Max",
    price: "¥2,980",
    period: "/月（税込）",
    trial: "6か月無料トライアル",
    cta: "6か月無料で試す",
    ctaHref: "/auth/login",
    featured: false,
    rows: [
      { label: "店舗数", value: "無制限", ok: true },
      { label: "集金記録", value: "", ok: true },
      { label: "在庫管理", value: "", ok: true },
      { label: "機器状態管理", value: "", ok: true },
      { label: "売上グラフ", value: "", ok: true },
      { label: "CSV/Excelエクスポート", value: "", ok: true },
      { label: "チームメンバー招待", value: "無制限", ok: true },
    ],
  },
];

const PlanCard = ({ plan }) => {
  const { name, price, period, badge, trial, cta, ctaHref, featured, rows } = plan;

  if (featured) {
    return (
      <Box
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        style={{ background: "linear-gradient(140deg, #0E7490 0%, #0891B2 60%, #06B6D4 100%)" }}
        boxShadow="0 16px 48px rgba(14,116,144,0.4)"
        transform={{ base: "none", md: "translateY(-10px)" }}
        position="relative"
      >
        {badge && (
          <Box
            display="inline-block"
            bg="white"
            color="var(--teal-dark)"
            fontSize="xs"
            fontWeight="bold"
            px={3}
            py={1}
            borderRadius="full"
            mb={4}
          >
            {badge}
          </Box>
        )}
        <Heading fontSize="xl" color="white" mb={2}>{name}</Heading>
        <Flex align="baseline" gap={1} mb={1}>
          <Text fontSize="3xl" fontWeight="800" color="white" fontFamily="'Space Mono', monospace">
            {price}
          </Text>
          <Text fontSize="sm" color="rgba(255,255,255,0.75)">{period}</Text>
        </Flex>
        {trial && (
          <Text fontSize="xs" color="rgba(255,255,255,0.7)" mb={6}>{trial}</Text>
        )}
        <VStack align="stretch" gap={2} mb={7}>
          {rows.map((r) => (
            <Flex key={r.label} align="center" py={2} borderBottom="1px solid" borderColor="rgba(255,255,255,0.15)">
              {r.ok
                ? <Box color="white" mr={2} flexShrink={0} display="inline-flex" alignItems="center"><Icon.LuCheck size={15} /></Box>
                : <Box color="rgba(255,255,255,0.4)" mr={2} flexShrink={0} display="inline-flex" alignItems="center"><Icon.LuMinus size={15} /></Box>
              }
              <Text fontSize="sm" color={r.ok ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)"} flex={1}>
                {r.label}
              </Text>
              {r.value && (
                <Text fontSize="xs" color="rgba(255,255,255,0.7)" fontWeight="600">{r.value}</Text>
              )}
            </Flex>
          ))}
        </VStack>
        <Link href={ctaHref}>
          <Box
            bg="white"
            color="var(--teal-deeper)"
            borderRadius="xl"
            py={3.5}
            textAlign="center"
            fontSize="sm"
            fontWeight="bold"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "var(--teal-pale)", transform: "translateY(-1px)" }}
          >
            {cta}
          </Box>
        </Link>
      </Box>
    );
  }

  return (
    <Box
      borderRadius="2xl"
      p={{ base: 6, md: 8 }}
      bg="white"
      border="1.5px solid"
      borderColor="cyan.100"
      boxShadow="var(--shadow-sm)"
    >
      <Heading fontSize="xl" color="var(--text-main)" mb={2}>{name}</Heading>
      <Flex align="baseline" gap={1} mb={1}>
        <Text fontSize="3xl" fontWeight="800" color="var(--text-main)" fontFamily="'Space Mono', monospace">
          {price}
        </Text>
        <Text fontSize="sm" color="var(--text-muted)">{period}</Text>
      </Flex>
      {trial ? (
        <Text fontSize="xs" color="var(--text-muted)" mb={6}>{trial}</Text>
      ) : (
        <Box mb={6} />
      )}
      <VStack align="stretch" gap={2} mb={7}>
        {rows.map((r) => (
          <Flex key={r.label} align="center" py={2} borderBottom="1px solid" borderColor="var(--divider)">
            {checkMark(r.ok)}
            <Text
              fontSize="sm"
              color={r.ok ? "var(--text-main)" : "var(--text-faint)"}
              flex={1}
            >
              {r.label}
            </Text>
            {r.value && (
              <Text fontSize="xs" color="var(--teal)" fontWeight="600">{r.value}</Text>
            )}
          </Flex>
        ))}
      </VStack>
      <Link href={ctaHref}>
        <Box
          bg="var(--app-bg)"
          color="var(--teal)"
          borderRadius="xl"
          py={3.5}
          textAlign="center"
          fontSize="sm"
          fontWeight="bold"
          cursor="pointer"
          transition="all 0.2s"
          border="1.5px solid"
          borderColor="cyan.200"
          _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
        >
          {cta}
        </Box>
      </Link>
    </Box>
  );
};

const PricingSection = () => {
  return (
    <Box py={{ base: 20, md: 28 }} bg="var(--app-bg, #F0F9FF)">
      <Container maxW="container.xl">
        <VStack gap={{ base: 12, md: 16 }}>
          {/* 見出し */}
          <VStack gap={3} textAlign="center">
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="var(--teal)"
              letterSpacing="0.12em"
              textTransform="uppercase"
            >
              Pricing
            </Text>
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              color="var(--text-main)"
              letterSpacing="-0.01em"
            >
              シンプルな料金プラン
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="var(--text-muted)" maxW="xl">
              3店舗まで永久無料。成長に合わせてアップグレードできます。
            </Text>
          </VStack>

          {/* プランカード */}
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "1fr 1.08fr 1fr" }}
            gap={{ base: 5, md: 6 }}
            w="full"
            alignItems="start"
          >
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </Box>

          {/* 補足 */}
          <Text fontSize="sm" color="var(--text-muted)" textAlign="center">
            すべてのプランに6か月無料トライアル付き。クレジットカード不要で試せます。
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default PricingSection;
