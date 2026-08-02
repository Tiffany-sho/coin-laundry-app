"use client";

import { useState } from "react";
import { Box, VStack, HStack, Text, Button, Badge, Heading, Card } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { PLAN_RANK } from "@/functions/plans";

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
    price: "¥800",
    storeLimit: "5店舗",
    features: ["集金記録", "在庫管理", "データ可視化", "メンバー管理"],
    trial: "6か月無料トライアル",
  },
  {
    key: "proplus",
    name: "Pro+",
    price: "¥1,500",
    storeLimit: "10店舗",
    features: ["集金記録", "在庫管理", "データ可視化", "メンバー管理"],
    /* ⚠️ トライアルは Pro だけ（2026-08-03 の決定）。Apple の導入オファーは
          購読グループ単位で 1 回しか使えないので、両方に付けても
          Pro で試した人は Pro+ で受けられず、表示と実際が食い違う */
    trial: null,
  },
  {
    key: "max",
    name: "Max",
    price: "¥3,000",
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
      /* ⚠️ 4 プランになったので md は 2 列。3 列のままだと 4 枚目だけ次の行に落ちる */
      gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }}
      gap={4}
    >
      {PLANS.map((plan) => {
        const isCurrent = currentPlan === plan.key;
        /*
          ⚠️ **プラン名を並べて判定しないこと。** 2026-08-03 まで
             `currentPlan === "max"` / `"pro"` の 2 条件で書いていたため、
             Pro+ の利用者には**どちらの条件にも当たらず**「Pro を開始する」という
             **ダウングレードのボタンが出ていた。** 序列で比べれば増えても壊れない。
        */
        const rank = PLAN_RANK[plan.key] ?? 0;
        const currentRank = PLAN_RANK[currentPlan] ?? 0;
        const isDowngrade = rank < currentRank;
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
