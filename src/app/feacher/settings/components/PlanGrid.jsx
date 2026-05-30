"use client";

import { useState } from "react";
import { Box, VStack, HStack, Text, Button, Badge, Heading, Card } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "¥0",
    storeLimit: "3店舗",
    features: ["集金記録", "在庫管理", "データ可視化"],
    trial: null,
  },
  {
    key: "pro",
    name: "Pro",
    price: "¥780",
    storeLimit: "5店舗",
    features: ["集金記録", "在庫管理", "データ可視化", "メンバー管理"],
    trial: "無料トライアルあり",
  },
  {
    key: "max",
    name: "Max",
    price: "¥2,980",
    storeLimit: "無制限",
    features: ["集金記録", "在庫管理", "データ可視化", "メンバー管理", "優先サポート"],
    trial: null,
  },
];

export default function PlanGrid({ currentPlan, stripeCustomerId }) {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleUpgrade = async (planKey) => {
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`エラー: ${data.error ?? "チェックアウトを開けませんでした"}`);
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("通信エラーが発生しました");
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setLoadingPlan("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(`エラー: ${data.error ?? "ポータルを開けませんでした"}`);
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("通信エラーが発生しました");
      setLoadingPlan(null);
    }
  };

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
      gap={4}
    >
      {PLANS.map((plan) => {
        const isCurrent = currentPlan === plan.key;
        const isDowngrade =
          (currentPlan === "max" && plan.key !== "max") ||
          (currentPlan === "pro" && plan.key === "free");
        const isUpgradeable = !isCurrent && !isDowngrade && plan.key !== "free";

        return (
          <Card.Root
            key={plan.key}
            borderRadius="xl"
            border="2px solid"
            borderColor={isCurrent ? "cyan.400" : "cyan.100"}
            boxShadow={isCurrent ? "var(--shadow-hero)" : "var(--shadow-sm)"}
            bg="var(--card-bg, white)"
          >
            <Card.Body p={6}>
              <VStack align="stretch" gap={4}>
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Heading fontSize="xl" fontWeight="bold" color="var(--teal-deeper)">
                      {plan.name}
                    </Heading>
                    {isCurrent && <Badge colorPalette="cyan">現在のプラン</Badge>}
                  </HStack>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="var(--teal)"
                    fontFamily="'Space Mono', monospace"
                  >
                    {plan.price}
                    <Text as="span" fontSize="sm" color="var(--text-muted)" fontFamily="inherit">
                      /月
                    </Text>
                  </Text>
                  {plan.trial && (
                    <Badge colorPalette="orange" mt={1}>{plan.trial}</Badge>
                  )}
                </Box>

                <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">
                  {plan.storeLimit}
                </Text>

                <VStack align="stretch" gap={1}>
                  {plan.features.map((f) => (
                    <HStack key={f} gap={2}>
                      <Icon.LuCheck size={14} color="var(--teal)" />
                      <Text fontSize="sm" color="var(--text-muted)">{f}</Text>
                    </HStack>
                  ))}
                </VStack>

                {isCurrent ? (
                  stripeCustomerId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="cyan"
                      onClick={handlePortal}
                      loading={loadingPlan === "portal"}
                      loadingText="移動中..."
                    >
                      プランを管理する
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled colorPalette="cyan">
                      現在利用中
                    </Button>
                  )
                ) : isUpgradeable ? (
                  <Button
                    size="sm"
                    colorPalette="cyan"
                    onClick={() => handleUpgrade(plan.key)}
                    loading={loadingPlan === plan.key}
                    loadingText="移動中..."
                  >
                    {plan.trial ? "無料で試す" : "開始する"}
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" disabled>
                    &nbsp;
                  </Button>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        );
      })}
    </Box>
  );
}
