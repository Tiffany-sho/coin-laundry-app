import Stripe from "stripe";

/*
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
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}
