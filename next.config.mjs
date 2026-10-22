/*
  セキュリティヘッダーの方針は docs/security.md の「被害を小さくする設計」に書いてある。

  ⚠️ **CSP（Content-Security-Policy）は意図的に入れていない。**
     Cloudflare Web Analytics の beacon（static.cloudflareinsights.com）、
     Google Fonts、Supabase Storage の画像を全部許可リストに書く必要があり、
     1つ漏らすと本番で静かに壊れる。入れるなら Report-Only から始めること。
*/
const securityHeaders = [
  // MIME タイプの推測を止める。アップロードされた画像が HTML として
  // 解釈されるのを防ぐ（Supabase Storage に任意のファイルが入る）。
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 外部サイトへ遷移するとき、パスとクエリを送らずオリジンだけにする。
  // URL に店舗 ID が入るページがあるため。
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // クリックジャッキング対策。iframe 埋め込みは1つも無いので塞いでよい。
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  /*
    使っていないブラウザ機能を全部切る。
    ⚠️ payment=() を入れてよいのは、Stripe Checkout がホスト型
       （session.url へリダイレクト）で、自サイト上で Payment Request API を
       使っていないため。埋め込み Checkout に変えるときは payment を外すこと。
  */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

export default {
  // X-Powered-By: Next.js を出さない。使っている物を教える必要はない。
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  experimental: {
    optimizePackageImports: [
      "@chakra-ui/react",
      "react-icons",
      "react",
      "next",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hhdipgftsrsmmuqyifgt.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};
