"use client";

import { useSyncExternalStore } from "react";

/**
 * お知らせの既読管理（Web 版）。
 *
 * 持つのは「最後に見たお知らせの公開日時（epoch ミリ秒）」1 つだけ。
 * それより新しいものがあれば未読とみなす。判定は `src/functions/announcements.js`。
 *
 * ⚠️ **iOS アプリ側にも同じ仕組みがある**（MMKV。`announcementsRead.ts`）。
 *    保存先が違うだけで、キー名と考え方を揃えてある。
 *
 * ⚠️ **1 件ずつの既読にしない。** 個別に持つと、あとから過去日で投稿されたものが
 *    永久に未読のまま残る。「どこまで見たか」を 1 本の線で持つほうが破綻しない。
 */

const KEY = "announcements.lastSeenAt";

/** 同じタブ内の更新を配るための合図。`storage` イベントは他タブにしか飛ばない */
const EVENT = "collecie:announcements-seen";

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    // プライベートモード等で localStorage が使えない場合。全件未読として扱う
    return 0;
  }
}

function subscribe(listener) {
  window.addEventListener("storage", listener);
  window.addEventListener(EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(EVENT, listener);
  };
}

/**
 * 既読の線。まだ一度も開いていなければ 0。
 *
 * ⚠️ サーバ側スナップショットは 0 を返す。SSR では localStorage を読めないため、
 *    初回描画は「全件未読」になり、ハイドレート後に実際の線へ寄る。
 *    ここを `read()` にすると hydration mismatch になる。
 */
export function useLastSeenAt() {
  return useSyncExternalStore(subscribe, read, () => 0);
}

/**
 * 一覧を開いたときに呼ぶ。
 *
 * ⚠️ **引数は「今」ではなく一番新しいお知らせの公開日時。** now を入れると、
 *    直後に過去日で投稿されたお知らせが未読にならない。
 */
export function markAnnouncementsSeen(latestPublishedAt) {
  if (!Number.isFinite(latestPublishedAt) || latestPublishedAt <= 0) return;
  try {
    if (latestPublishedAt <= read()) return;
    window.localStorage.setItem(KEY, String(latestPublishedAt));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // 保存できなくても表示は続ける
  }
}
