"use client";

import { useState, useEffect } from "react";
import { Card, HStack, VStack, Text, Box, Flex, Heading, Badge, Button } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import { PLAN_NAMES } from "@/functions/plans";

export default function PlanCard({ planInfo }) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);

  const { plan, storeCount, storeLimit, trialEndsAt, stripeCustomerId } = planInfo;
  const planName = PLAN_NAMES[plan] ?? "Free";

  useEffect(() => {
    if (trialEndsAt) {
      setTrialDaysLeft(
        Math.max(0, Math.ceil((new Date(trialEndsAt) - Date.now()) / (1000 * 60 * 60 * 24)))
      );
    }
  }, [trialEndsAt]);

  const isOnTrial = trialDaysLeft !== null && trialDaysLeft > 0;

  const handleOpenPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(`エラー: ${data.error ?? "ポータルを開けませんでした"}`);
        setIsLoadingPortal(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("通信エラーが発生しました");
      setIsLoadingPortal(false);
    }
  };

  const handleUpgrade = async (planKey) => {
    setIsLoadingCheckout(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`エラー: ${data.error ?? "チェックアウトを開けませんでした"}`);
        setIsLoadingCheckout(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("通信エラーが発生しました");
      setIsLoadingCheckout(null);
    }
  };

  return (
    <Card.Root
      w="full"
      bg="var(--card-bg, #FFFFFF)"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      border="1px solid"
      borderColor="cyan.100"
    >
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack justify="space-between" mb={5}>
          <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
            現在のプラン
          </Heading>
          <Link href="/settings/plan">
            <HStack
              gap={1.5} px={3} py={1.5}
              borderRadius="lg" border="1px solid" borderColor="cyan.100"
              color="var(--teal)" fontSize="sm" fontWeight="semibold"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
            >
              <Icon.LuCreditCard size={14} />
              <Text>プラン詳細</Text>
            </HStack>
          </Link>
        </HStack>

        <VStack align="stretch" gap={3}>
          <HStack
            gap={3} p={4} bg="var(--teal-pale)"
            borderRadius="lg" border="1px solid" borderColor="cyan.100"
          >
            <Flex
              w="40px" h="40px" bg="var(--card-bg, white)" borderRadius="lg"
              align="center" justify="center" color="var(--teal)"
              flexShrink={0} boxShadow="var(--shadow-sm)"
            >
              <Icon.LuZap size={20} />
            </Flex>
            <Box flex={1}>
              <HStack gap={2} mb={1}>
                <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper)">
                  {planName}
                </Text>
                {isOnTrial && (
                  <Badge colorPalette="orange" size="sm">
                    トライアル中 残{trialDaysLeft}日
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color="var(--text-muted)">
                店舗数: {storeCount} / {storeLimit === null ? "無制限" : storeLimit}
              </Text>
            </Box>
          </HStack>

          {plan === "free" && (
            <VStack gap={2} align="stretch">
              <Button
                size="sm"
                colorPalette="cyan"
                onClick={() => handleUpgrade("pro")}
                loading={isLoadingCheckout === "pro"}
                loadingText="移動中..."
              >
                Pro にアップグレード
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorPalette="cyan"
                onClick={() => handleUpgrade("max")}
                loading={isLoadingCheckout === "max"}
                loadingText="移動中..."
              >
                Max にアップグレード
              </Button>
            </VStack>
          )}

          {plan === "pro" && (
            <VStack gap={2} align="stretch">
              <Button
                size="sm"
                colorPalette="cyan"
                onClick={() => handleUpgrade("max")}
                loading={isLoadingCheckout === "max"}
                loadingText="移動中..."
              >
                Max にアップグレード
              </Button>
              {stripeCustomerId && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="cyan"
                  onClick={handleOpenPortal}
                  loading={isLoadingPortal}
                  loadingText="移動中..."
                >
                  プランを管理する
                </Button>
              )}
            </VStack>
          )}

          {plan === "max" && stripeCustomerId && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="cyan"
              onClick={handleOpenPortal}
              loading={isLoadingPortal}
              loadingText="移動中..."
            >
              プランを管理する
            </Button>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
