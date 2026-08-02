"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Card, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import {
  ANNOUNCEMENT_CATEGORIES,
  categoryOf,
  formatAnnouncementDate,
  isUnread,
  latestPublishedAt,
} from "@/functions/announcements";
import {
  markAnnouncementsSeen,
  useLastSeenAt,
} from "../hooks/useAnnouncementsRead";

/**
 * 開発者からのお知らせの一覧。
 *
 * ⚠️ 詳細ページへ飛ばさない。お知らせは短いので、遷移を挟むと戻る操作が増えるだけ。
 *    押すとその場で開く（iOS 側と同じ挙動）。
 *
 * ⚠️ **本文はプレーンテキスト。Markdown を解釈しない。** 書式を足すと本文に
 *    リンクを書けるようになり、アプリ外の購入手段へ誘導できてしまう
 *    （このテーブルは iOS と共用。Guideline 3.1.3(a)）。改行だけ `white-space` で出す。
 */

/** バッジの色。文言は functions/announcements.js の ANNOUNCEMENT_CATEGORIES 側が正 */
const CATEGORY_STYLE = {
  info: { color: "var(--teal-deeper)", bg: "cyan.50" },
  feature: { color: "teal.800", bg: "teal.100" },
  maintenance: { color: "#854D0E", bg: "yellow.100" },
  incident: { color: "#C2410C", bg: "orange.100" },
};

const AnnouncementRow = ({ item, unread, defaultOpen }) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const key = categoryOf(item.category);
  const style = CATEGORY_STYLE[key];

  return (
    <Card.Root
      bg="var(--card-bg, #FFFFFF)"
      border="1px solid"
      borderColor="cyan.100"
      boxShadow="var(--shadow-sm)"
      borderRadius="xl"
      overflow="hidden"
    >
      <Box
        as="button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        w="full"
        textAlign="left"
        p={{ base: 4, md: 5 }}
        cursor="pointer"
        transition="background 0.2s"
        _hover={{ bg: "cyan.50" }}
      >
        <HStack align="start" gap={3}>
          <Box flex="1" minW={0}>
            <HStack gap={2} mb={1.5} wrap="wrap">
              <Box
                px={2}
                py={0.5}
                borderRadius="full"
                bg={style.bg}
                color={style.color}
                fontSize="10px"
                fontWeight="bold"
                flexShrink={0}
              >
                {ANNOUNCEMENT_CATEGORIES[key]}
              </Box>
              <Text fontSize="xs" color="var(--text-faint)">
                {formatAnnouncementDate(item.published_at)}
              </Text>
              {unread && (
                <Box
                  w="7px"
                  h="7px"
                  borderRadius="full"
                  bg="orange.500"
                  flexShrink={0}
                  aria-label="未読"
                />
              )}
            </HStack>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="bold"
              color="var(--text-main)"
              lineHeight="1.5"
            >
              {item.title}
            </Text>
          </Box>
          <Box color="var(--teal)" mt={1} flexShrink={0}>
            {open ? <Icon.LuChevronUp size={18} /> : <Icon.LuChevronDown size={18} />}
          </Box>
        </HStack>
      </Box>

      {open && (
        <Box
          px={{ base: 4, md: 5 }}
          pb={{ base: 4, md: 5 }}
          pt={4}
          mx={{ base: 4, md: 5 }}
          mb={0}
          borderTop="1px solid"
          borderColor="var(--divider)"
        >
          {/* 改行をそのまま出す。Markdown は解釈しない */}
          <Text
            fontSize="sm"
            color="var(--text-main)"
            lineHeight="1.8"
            whiteSpace="pre-wrap"
          >
            {item.body}
          </Text>
        </Box>
      )}
    </Card.Root>
  );
};

const AnnouncementsPanel = ({ items = [] }) => {
  const lastSeenAt = useLastSeenAt();

  /**
   * ⚠️ **既読にする前の線を最初の描画で写しておく。** 下の useEffect で線が最新へ動くので、
   *    そのまま参照すると開いた瞬間に全件が既読になり、「どれが新しかったか」の印が
   *    1 つも出なくなる。この画面にいる間はこの値で判定する。
   *
   * ⚠️ SSR では線が 0（localStorage を読めない）なので、ハイドレート後に一度だけ写す。
   */
  const seenOnEnter = useRef(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (seenOnEnter.current === null) {
      seenOnEnter.current = lastSeenAt;
      setEntered(true);
    }
  }, [lastSeenAt]);

  /**
   * 開いたら既読にする。
   * ⚠️ 「今」ではなく**一番新しいお知らせの公開日時**を線にする。
   */
  const latest = latestPublishedAt(items);
  useEffect(() => {
    if (latest > 0) markAnnouncementsSeen(latest);
  }, [latest]);

  if (items.length === 0) {
    return (
      <Card.Root
        bg="var(--card-bg, #FFFFFF)"
        border="1px solid"
        borderColor="cyan.100"
        boxShadow="var(--shadow-sm)"
        borderRadius="xl"
      >
        <Card.Body p={{ base: 5, md: 6 }}>
          <HStack gap={3} color="var(--text-muted)">
            <Icon.LuInbox size={20} />
            <Text fontSize="sm">現在お知らせはありません。</Text>
          </HStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <VStack align="stretch" gap={3}>
      {items.map((item, i) => (
        <AnnouncementRow
          key={item.id}
          item={item}
          /* ハイドレートで線が確定するまでは印を出さない（全件未読に見えるのを防ぐ） */
          unread={entered && isUnread(item, seenOnEnter.current)}
          /* 先頭だけ開いて出す。全部閉じていると何も読めない画面になる */
          defaultOpen={i === 0}
        />
      ))}
    </VStack>
  );
};

export default AnnouncementsPanel;

/** 設定ページの見出し。ページ側と文言を揃えるためここに置く */
export const AnnouncementsHeading = () => (
  <Box>
    <HStack gap={3} mb={1}>
      <Icon.LuBell size={22} color="var(--teal)" />
      <Heading
        as="h1"
        fontSize={{ base: "xl", md: "2xl" }}
        fontWeight="bold"
        color="var(--teal-deeper)"
      >
        開発者からのお知らせ
      </Heading>
    </HStack>
    <Text fontSize="sm" color="var(--text-muted)">
      新機能や不具合の対応状況をお知らせします
    </Text>
  </Box>
);
