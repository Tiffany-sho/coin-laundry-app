import { redirect } from "next/navigation";

/**
 * 旧「毎月の固定費」ページ。**2026-08-05 に `/expenses` の中へ折り込んだ。**
 *
 * ⚠️ アプリは 2026-08-03 に同じことをしている（同じ「経費」なのに
 *    固定費だけ行き先が違うのをやめた）。⚠️ **消さずに残す**（ブックマーク）。
 */
export default function LegacyRecurringPage() {
  redirect("/expenses");
}
