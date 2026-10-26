import Stripe from "stripe";

/*
  ⚠️ **`httpClient` を明示すること。省くと Cloudflare で Stripe の API 呼び出しが
     応答を返さなくなる。**

     stripe パッケージは `exports` の `workerd` 条件で fetch 版の実装に
     切り替わる作りだが、`nodejs_compat` を有効にしていると **Node 版が
     バンドルされる**。Node 版の既定クライアントは `require("http")` を使うので、
     workerd 上では要求が完了せず、画面は**エラーも出さずに回り続ける**
     （2026-10-26、設定ページの「プランを管理する」で発生）。

     ⚠️ **Webhook が動いていても確認にならない。** `constructEvent` は
        ローカルの署名検証だけでネットワークに出ないため、この不具合を踏まない。

     fetch 版は Node 24 でもそのまま動くので、Vercel と Cloudflare で
     同じ経路になる。

  ⚠️ **モジュール評価時に `new Stripe()` を呼ばないこと。**
     鍵が無いと**コンストラクタが**
     `Neither apiKey nor config.authenticator provided` を投げる。
     Next.js のビルドは "Collecting page data" の段で各ルートを import するため、
     ビルド環境に `STRIPE_SECRET_KEY` が無いと**ビルドごと落ちる**
     （2026-10-26、Vercel から Cloudflare へ移したときに実際に発生）。

     秘密鍵はビルドに焼き込まれず実行時に読まれる（`NEXT_PUBLIC_` だけが
     焼き込まれる）ので、**ビルド環境に秘密鍵を置く必要は本来無い。**
     実際に API を叩く瞬間まで生成を遅らせて、その状態を保つ。
*/
let client = null;

export function getStripe() {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return client;
}
