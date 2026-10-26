import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/*
  OpenNext の設定。

  キャッシュ（incremental cache / tag cache）は**意図的に未設定**。
  このアプリのルートはビルドログのとおりほぼ全部 `ƒ (Dynamic)` で、
  静的生成しているのは `/icon.png` `/apple-icon.png` `/sitemap.xml` だけ。
  ISR も使っていないので、KV や D1 を増やす意味がない。

  静的生成や `revalidate` を使い始めたらここでキャッシュを設定すること。
  https://opennext.js.org/cloudflare/caching
*/
export default defineCloudflareConfig();
