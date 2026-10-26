# Cloudflare 移行後の環境変数チェックリスト

Vercel から Cloudflare へ移したあと、**ビルドが通っただけでは何も確認できていない**。
このプロジェクトの環境変数は、落としても例外を投げずに「決済は成功しているのにプランが上がらない」
「メールが届かない」という形で静かに壊れるものが多い。

ここに並べたのは、**コードを読んで「落ちたときに何が起きるか」を確定させた項目だけ**。
上から順にやれば、画面に出ない壊れ方まで一通り踏める。

---

## 0. 先に知っておくこと（Cloudflare 固有の落とし穴）

### `NEXT_PUBLIC_` はビルド時に焼き込まれる

`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_APP_URL` の3つは、
Next.js がビルド時に JS へ直接埋め込む。**Workers の実行時バインディング（Variables and Secrets）に
入れても手遅れ**で、Cloudflare の「ビルド構成 > 環境変数」側に入っていないと `undefined` が焼き付く。

⚠️ `NEXT_PUBLIC_APP_URL` は名前に反して**サーバー側でしか読んでいない**
（[checkout/route.js:79](../src/app/api/stripe/checkout/route.js:79)・[portal/route.js:25](../src/app/api/stripe/portal/route.js:25)）。
それでもビルド時に焼き込まれる点は同じなので、ビルド環境に必要。

### `VERCEL_ENV` は存在しなくなる

[layout.js:109](../src/app/layout.js:109) が `process.env.VERCEL_ENV === "production"` で
Cloudflare Web Analytics の出し分けをしている。Cloudflare では常に `undefined` になるので、
**移行しただけでアクセス解析が止まる**。詳細は §5。

---

## 1. ログイン不要でできる非破壊テスト

`<HOST>` は新しいデプロイ先のホスト名に読み替える。

### T1. Supabase のウェブフック秘密鍵が一致しているか

`type` が `INSERT` 以外なら何もせず返るので、本番に撃っても副作用がない。

```bash
curl -s -X POST https://<HOST>/api/webhooks/supabase -H "content-type: application/json" -H "x-webhook-secret: <SUPABASE_WEBHOOK_SECRET の値>" -d '{"type":"UPDATE","table":"laundry_store"}'
```

| 結果 | 意味 |
|---|---|
| `{"ok":true}` | ✅ `SUPABASE_WEBHOOK_SECRET` が一致している |
| `{"error":"Unauthorized"}` | ❌ 値が違う、または未設定 |

⚠️ **わざと間違った秘密鍵で 401 を確認しても意味がない。** 未設定でも 401 になるので、
「正しい値で 200 が返ること」まで見ないと確認にならない（[route.js:9](../src/app/api/webhooks/supabase/route.js:9)）。

### T2. Stripe の鍵がそもそも読めているか

署名が無効なのは承知のうえで撃つ。見たいのは**ステータスコードの違い**。

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<HOST>/api/stripe/webhook -H "stripe-signature: t=1,v1=deadbeef" -d "{}"
```

| 結果 | 意味 |
|---|---|
| `400` | ✅ `STRIPE_SECRET_KEY` も `STRIPE_WEBHOOK_SECRET` も読めている（署名検証まで到達した） |
| `500` | ❌ `STRIPE_SECRET_KEY` が未設定。[client.js:3](../src/utils/stripe/client.js:3) の `new Stripe(undefined)` が **import 時点で** `Neither apiKey nor config.authenticator provided` を投げ、ルート自体が読み込めていない |

### T3. アクセス解析のスクリプトが入っているか

```bash
curl -s https://<HOST>/ | grep -c "cloudflareinsights"
```

`0` なら §5 の修正が要る（移行直後は必ず `0` になるはず）。

---

## 2. ログインして行う機能テスト

| # | 操作 | 効いている変数 | NG のときの症状 |
|---|---|---|---|
| T4 | ログインする | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ブラウザのコンソールに `supabaseUrl is required.` / `supabaseKey is required.`。**ページが真っ白になるので必ず気づける** |
| T5 | 集金を1件登録して一覧に出る | サーバー側 Supabase クライアント | 保存できない |
| T6 | 店舗の写真をアップロードする | Supabase Storage | アップロードが失敗する |
| T7 | パスワード再設定メールのリンクを踏む | `NODE_ENV` / `x-forwarded-host` | **旧ドメインや localhost に飛ばされる**（[callback/route.js:31](../src/app/auth/callback/route.js:31)）。Cloudflare はヘッダの付き方が Vercel と違うのでここは必ず踏む |
| T8 | 新規ユーザーを1つ作る | `SUPABASE_WEBHOOK_SECRET` + `SUPABASE_SERVICE_KEY` + `RESEND_API_KEY` | ウェルカムメールが来ない。**画面には何も出ない**ので Supabase → Database → Webhooks の送信ログで 200 か 401 かを見る |
| T9 | メンバーを招待する | `RESEND_API_KEY` | ⚠️ **送信失敗が `catch (_) {}` で握り潰されている**（[organization/action.js:424](../src/app/api/supabaseFunctions/supabaseDatabase/organization/action.js:424)）。画面は成功したように見える。**Resend のダッシュボード → Logs に送信記録があるかで判断するしかない** |

---

## 3. 決済を一周させる（いちばん壊れやすい）

Stripe をテストモードに向けた状態で、**Pro・Pro+・Max の3つすべて**について回す。
`STRIPE_PROPLUS_PRICE_ID` は手元の `.env.local` に無かった変数なので、
**Pro だけ確認して終わると Pro+ の欠落に気づけない。**

| # | 手順 | 期待する結果 | 外れたときの原因 |
|---|---|---|---|
| T10 | 設定 → プラン → 各プランを選ぶ | Stripe の決済画面に遷移する | `{"error":"Price not configured"}` (500) なら該当の `STRIPE_*_PRICE_ID` が未設定（[checkout/route.js:52](../src/app/api/stripe/checkout/route.js:52)） |
| T11 | Pro の決済画面の文言を見る | **「183日間の無料」と出る** | 出ないなら `STRIPE_PRO_TRIAL_DAYS` が未設定。⚠️ エラーにならず**トライアル無しで即課金**になる（[checkout/route.js:84](../src/app/api/stripe/checkout/route.js:84)） |
| T12 | テストカード `4242 4242 4242 4242` で支払う | `https://<HOST>/settings?checkout=success` に戻る | 旧ドメイン・`localhost`・`*.vercel.app` に戻ったら `NEXT_PUBLIC_APP_URL` が古い |
| T13 | 支払い後に DB を見る（下記SQL） | `plan` が `pro` / `proplus` / `max` になっている | ⚠️ **`free` のままなら該当の価格IDが不一致。** 決済は成立しているのでエラーもログも出ない（[webhook/route.js:131](../src/app/api/stripe/webhook/route.js:131)） |
| T14 | 設定 → お支払い方法の管理 → Stripe のポータルから戻る | `https://<HOST>/settings` に戻る | `NEXT_PUBLIC_APP_URL` が古い |
| T15 | Stripe ダッシュボード → Webhooks → 「テストイベントを送信」 | `200` が返る | `400` なら `STRIPE_WEBHOOK_SECRET` の値が違う。移行でエンドポイントURLを作り直した場合、**署名シークレットは新しいものに変わっている** |

T13 で見る SQL:

```sql
select id, name, plan, stripe_customer_id, stripe_subscription_id, trial_ends_at
from organizations
order by created_at desc
limit 5;
```

---

## 4. 静かに壊れるものの一覧（ここだけは必ず踏む）

画面にもログにもエラーが出ないので、**その操作を実際にやる以外に気づく方法が無い**もの。

| 変数 | 落ちたときに起きること | 気づける唯一の方法 |
|---|---|---|
| `STRIPE_PROPLUS_PRICE_ID` | Pro+ の決済は成功するのにプランが `free` のまま | T13（Pro+ を実際に購入して DB を見る） |
| `STRIPE_PRO_TRIAL_DAYS` | 6か月無料のはずが初月から課金される | T11（決済画面の文言） |
| `NEXT_PUBLIC_APP_URL` | 決済後に旧ドメインへ戻される | T12 / T14（URLバー） |
| `RESEND_API_KEY` | 招待メールが届かない。画面は成功表示 | T9（Resend の Logs） |
| `SUPABASE_WEBHOOK_SECRET` | 新規登録のウェルカムメールが来ない | T8（Supabase の Webhook 送信ログ） |
| `APPLE_APP_APPLE_ID` | **本番の App Store 課金だけ**検証に失敗する。Sandbox は未設定でも通るのでテスト中は気づけない | 実機の製品版で購入（[verify.js:37](../src/utils/apple/verify.js:37)） |
| `VERCEL_ENV` | Web のアクセス解析が止まる | T3 |

---

## 5. Vercel 固有で持っていけないもの

| 変数 | 扱い |
|---|---|
| `VERCEL_ENV` | **コード修正が必要。** [layout.js:109](../src/app/layout.js:109) の判定を `process.env.NODE_ENV === "production"` か自前の `NEXT_PUBLIC_ENV` に差し替える。あるいは collecie.com を Cloudflare のプロキシ経由（オレンジ雲）にして自動挿入に任せる手もあるが、[CloudflareAnalytics.jsx](../src/app/feacher/analytics/CloudflareAnalytics.jsx) のコメントのとおり現状は DNS only なので今のままでは効かない |
| `VERCEL_OIDC_TOKEN` | `vercel env pull` が書き込む一時トークン。移行先には不要 |

一方で持っていかなくてよいもの（既定値で正しく動く）:

| 変数 | 理由 |
|---|---|
| `APPLE_BUNDLE_ID` | 既定値 `com.collecie.app` が Apple の商品IDのプレフィックスと一致（[applePlans.js:22](../src/functions/applePlans.js:22)） |
| `APPLE_IAP_ONLINE_CHECKS` | 未設定＝`true`＝失効確認あり。本番として望ましい挙動（[verify.js:29](../src/utils/apple/verify.js:29)） |

---

## 6. 環境変数ではないが、同時に壊れるもの

ドメインが変わるなら、変数を正しく移しても以下で同じように壊れる。

| 対象 | どこで直すか |
|---|---|
| Supabase Auth のリダイレクト許可 | Supabase → Authentication → URL Configuration の Site URL / Redirect URLs に新ドメインを追加。**漏らすとログインのコールバックだけが失敗する** |
| Stripe の Webhook エンドポイント | Stripe → Webhooks のURLを新ドメインに。作り直したら T15 で署名シークレットを再確認 |
| Supabase の Database Webhook の宛先 | Supabase → Database → Webhooks のURLを新ドメインに |
| Apple の App Store Server Notifications | App Store Connect の通知URLを `https://<HOST>/api/apple/notifications` に |

---

## 7. 最後に：漏れが無いことの機械的な確認

コードが読んでいる変数名を全部出し、Cloudflare 側の一覧と突き合わせる。

```bash
grep -rhno "process\.env\.[A-Z0-9_]*" src/ next.config.* | sed 's/.*process\.env\.//' | sort -u
```

2026-10-26 時点では次の17個が出る。`NODE_ENV` はフレームワークが入れるので設定不要、
`VERCEL_ENV` / `VERCEL_OIDC_TOKEN` は §5 のとおり移行しない。

```
APPLE_APP_APPLE_ID
APPLE_BUNDLE_ID
APPLE_IAP_ONLINE_CHECKS
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL
NODE_ENV
RESEND_API_KEY
STRIPE_MAX_PRICE_ID
STRIPE_PROPLUS_PRICE_ID
STRIPE_PRO_PRICE_ID
STRIPE_PRO_TRIAL_DAYS
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SUPABASE_SERVICE_KEY
SUPABASE_WEBHOOK_SECRET
VERCEL_ENV
```
