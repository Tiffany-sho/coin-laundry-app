"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/*
  Cloudflare Web Analytics の計測用スクリプト（Cookie を使わない）。
  ⚠️ **トークンは秘密ではない。** ページの HTML にそのまま出る公開値なので、
     ここに直書きしてよい（Cloudflare → Web Analytics → www.collecie.com で確認）。
  ⚠️ collecie.com は Cloudflare の DNS のみ（プロキシしていない）ので、
     自動挿入は効かない。このスクリプトが無いと Web 版の閲覧数はどこにも残らない。
*/
const CF_BEACON_TOKEN = "b079299717a141689a460582403d7b99";

export default function CloudflareAnalytics({ enabled }) {
  const pathname = usePathname();
  /*
    ⚠️ /app/* は iOS アプリの WebView 向けのページ。アプリ内の閲覧を
       Web の計測に混ぜないため、ここでは読み込まない。
  */
  if (!enabled || !CF_BEACON_TOKEN || pathname?.startsWith("/app/")) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN, spa: true })}
    />
  );
}
