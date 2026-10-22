# セキュリティ運用手順（Collecie）

脆弱性への備えを「**早く知る → すぐ直せる → 被害を小さくする → 起きたときに備える → 契約で決めておく**」の5つに分けて書いてある。手順はすべてコピペできるコマンドにしてある。

最終更新: 2026-10-23

## この構成で守るもの

| 層 | 使っている物 | 入口 |
|---|---|---|
| コード | GitHub `Tiffany-sho/coin-laundry-app`（**public**・既定ブランチ `main`） | https://github.com/Tiffany-sho/coin-laundry-app |
| ホスティング | Vercel プロジェクト `coin-laundry-app`（team `shoseis-projects-92458718`） | https://vercel.com/shoseis-projects-92458718/coin-laundry-app |
| DNS | Cloudflare（`cory.ns.cloudflare.com` / `kimora.ns.cloudflare.com`）→ Vercel へ向く | https://dash.cloudflare.com/ |
| DB・認証・ストレージ | Supabase `hhdipgftsrsmmuqyifgt`（ap-northeast-1 / Postgres 17） | https://supabase.com/dashboard/project/hhdipgftsrsmmuqyifgt |
| 決済 | Stripe（サブスクリプション・Webhook） | https://dashboard.stripe.com/ |
| メール | Resend（招待・通知メール） | https://resend.com/ |
| アクセス解析 | Cloudflare Web Analytics（beacon のみ） | https://dash.cloudflare.com/ |
| iOS アプリ | App Store Connect（Apple IAP・Server Notifications） | https://appstoreconnect.apple.com/ |

**`main` への push で Vercel の本番デプロイが走る。** GitHub に push できる人は本番を差し替えられる。ここが一番の入口。

---

## 1. 早く知る

### 1-1. 自動で知る仕組み（リポジトリに入れてある）

| 仕組み | ファイル | 何をするか |
|---|---|---|
| Dependabot | `.github/dependabot.yml` | 毎週月曜 09:00 (JST) に npm と GitHub Actions の更新 PR を出す |
| CI | `.github/workflows/ci.yml` | `main` への push と全 PR で `npm ci` → `npm test` → `npm run build` → `npm audit --omit=dev --audit-level=high` |

CI の最後の段で、**本番に乗る依存に high 以上の脆弱性が1件でもあれば落ちる**。マージ前に気づけるのはここ。

Dependabot のグループ分けは「一緒に上げないと壊れる物」を基準にしてある。`next` と `react` を別々にマージすると peerDependencies が合わず build が落ちるため、`next-react` グループで1つの PR にまとめている。`chakra`（`@chakra-ui/*` と `@emotion/*`）と `supabase`（`@supabase/*`）も同じ理由。

### 1-2. GitHub の画面で有効化すること（コードでは設定できない）

**メニューの場所は変わるので、見つからなければ画面上部の検索窓にそのキーワードを入れる。**

1. **Dependabot alerts と Dependabot security updates**

   直接開く: https://github.com/Tiffany-sho/coin-laundry-app/settings/security_analysis

   - `Dependabot alerts` を Enable → 脆弱性が公表された時点で通知が来る（毎週を待たない）
   - `Dependabot security updates` を Enable → 修正版が出た時点で PR が自動で立つ
   - `Secret scanning` と `Push protection` も Enable（public リポジトリなので無料。API キーを誤って push したとき止めてくれる）

2. **自分宛てに通知が届くようにする**

   - リポジトリ右上の `Watch` → `Custom` → **`Security alerts`** にチェック
   - https://github.com/settings/notifications で、`Dependabot alerts` の通知先に**メールを含める**（画面内の通知だけだと見ない）

3. **`main` を直接 push で壊せないようにする**（任意だが推奨）

   https://github.com/Tiffany-sho/coin-laundry-app/settings/branches

   - `main` にルールを追加し、`Require status checks to pass` で CI を必須にする
   - ⚠️ 1人で開発しているなら `Require a pull request` までやると自分の作業が止まる。**CI 必須だけ**にしておくのが現実的

4. **Collaborators を見直す**

   https://github.com/Tiffany-sho/coin-laundry-app/settings/access

   push できる人は本番を差し替えられる。心当たりのない人がいたら外す。

### 1-3. 人間が見に行くところ

公表された脆弱性は、自分のリポジトリの外で先に出る。

| 見るもの | URL | 頻度 |
|---|---|---|
| Next.js の Security Advisories | https://github.com/vercel/next.js/security/advisories | Dependabot が拾うので受け身でよい |
| Node.js のセキュリティリリース | https://nodejs.org/en/blog/vulnerability | 月1回 |
| Vercel の変更とインシデント | https://vercel.com/changelog ・ https://www.vercel-status.com/ | 障害時 |
| Supabase の変更 | https://github.com/orgs/supabase/discussions/categories/changelog | 月1回 |
| Stripe の API 変更 | https://docs.stripe.com/changelog | 月1回 |
| JPCERT/CC 注意喚起 | https://www.jpcert.or.jp/at/ | 週1回 |
| IPA 重要なセキュリティ情報 | https://www.ipa.go.jp/security/alert.html | 週1回 |

**Next.js は狙われる。** 2026-10-23 の対応時点で `next` 16.2.4 には 30 件の advisory が溜まっており、Windows ホストでの未認証 RCE や middleware の認証バイパスを含んでいた。Next.js の通知だけは必ず受け取っておくこと。

---

## 2. すぐ直せる状態にしておく

### 2-1. バージョン方針

| 対象 | 方針 |
|---|---|
| Node.js | **LTS のメジャーに固定**。`.nvmrc` に `24`、`package.json` の `engines.node` に `24.x`。⚠️ `engines` は Vercel の Project Settings を**上書きする**。Project Settings 側は 22.x のままなので、この固定を外すと 22 に戻る |
| 依存パッケージ | `^` で入れて、Dependabot のマイナー・パッチは基本マージ |
| メジャー更新 | 手で上げる。`next` と `react` は必ず同じ PR で |
| `overrides` | 推移的な依存に修正版が届かないときだけ使う（§6 参照） |

### 2-2. 普段の更新手順

```bash
npm outdated                 # 何が古いか
npm audit                    # 既知の脆弱性
npm update                   # ^ の範囲でマイナー・パッチを上げる
npm test && npm run build    # ここを通らないものはマージしない
```

Dependabot の PR は、CI が緑でマイナー・パッチならそのままマージしてよい。

**アイコン（`react-icons`）やチャート（`recharts`）の更新は、ブラウザで実際に表示を見てからマージする。** 見た目が崩れても CI は緑のまま通る。

Dependabot の PR が複数来ると `package-lock.json` が必ず衝突する。ローカルで順に片付ける。

```bash
git switch main && git pull
git merge --no-ff origin/dependabot/npm_and_yarn/<ブランチ名>
# lockfile が衝突したら、マージせず作り直す
git checkout --ours package-lock.json && npm install
npm test && npm run build
git add package-lock.json && git commit
# 全部済んでから push すると、GitHub 上でも PR が Merged になる
```

### 2-3. プレビュー（ステージング）で確かめる

Vercel は `main` 以外のブランチを push すると自動でプレビュー URL を作る。

```bash
git switch -c fix/next-security
# 直す
npm test && npm run build
git commit -am "fix(deps): next を上げる"
git push -u origin fix/next-security
```

push すると Vercel が PR にプレビュー URL をコメントする。

**このプロジェクトはプレビュー URL が Vercel の SSO で保護されている**（`ssoProtection` が `all_except_custom_domains`）ので、ログインしていない第三者は開けない。確認は自分の Vercel アカウントでログインした状態で行う。

### 2-4. 緊急時の手順（目標: 公表から数時間で本番）

critical / high が公表され、自分のバージョンが対象のとき。

```bash
# 1. 影響範囲を確かめる（5分）
cd ~/code-factory/dev/coin-laundry-app
git switch main && git pull
npm audit --omit=dev --audit-level=high
```

```bash
# 2. 修正版に上げる（10分）
#    ⚠️ --force は使わない。メジャー更新や古い版への巻き戻しが起きる
npm install next@<修正版>
npm audit fix
npm audit --omit=dev --audit-level=high   # 0 件になったか
```

```bash
# 3. 検証する（15分）
npm test
npm run build
```

```bash
# 4. ブランチで本番と同じ形を見る（15分）
git switch -c hotfix/<advisory-id>
git commit -am "fix(deps): <advisory-id> に対応する"
git push -u origin hotfix/<advisory-id>
#    → Vercel のプレビュー URL で、ログイン・集金登録・グラフ表示を実際に触る
```

```bash
# 5. 本番へ（5分）
git switch main && git merge --no-ff hotfix/<advisory-id>
git push        # ここで Vercel の本番デプロイが走る
```

**手順4を飛ばさない。** メジャー更新でないのに壊れることはある。

### 2-5. 戻す（ロールバック）

本番が壊れたら、直すより先に戻す。

**いちばん速い方法（コードを触らない・1分）**

Vercel の Deployments で、1つ前の `Ready` なデプロイを開き `...` メニューから `Promote to Production`（表記が `Rollback` のこともある）。

直接開く: https://vercel.com/shoseis-projects-92458718/coin-laundry-app/deployments

CLI でもできる。

```bash
npx vercel rollback --scope shoseis-projects-92458718
```

**コードを戻す方法**

```bash
git revert <壊したコミット>   # reset --hard ではなく revert（履歴を残す）
npm test && npm run build
git push
```

⚠️ **DB のマイグレーションを含む変更は、コードを戻しても DB は戻らない。** スキーマを変える前に §4-1 のバックアップを確認すること。

---

## 3. 被害を小さくする設計

### 3-1. 静的生成の現状

`npm run build` の出力で、**ほぼ全ルートが `ƒ Dynamic`**。静的なのは `/icon.png` `/apple-icon.png` `/sitemap.xml` などだけ。

これは直すべき問題ではない。ログインしたユーザーごとに中身が変わるアプリで、Supabase のセッションを見てから描いているため静的化はできない。

「静的なら壊れない」という守りは使えないので、代わりに**認可をアプリ層で必ず二重にかける**方針を取っている（`CLAUDE.md` の「セキュリティ（Server Actions）」を参照）。

### 3-2. 秘密情報の扱い

| 決め事 | 現状（2026-10-23 に確認） |
|---|---|
| `.env*` を git に入れない | `.gitignore` で除外済み。`git ls-files` に env ファイルは無い |
| 秘密を `NEXT_PUBLIC_` にしない | 現在 `NEXT_PUBLIC_` は `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `APP_URL` の3つだけ。**どれも公開前提の値** |
| 本物の値はホスティングに置く | Vercel の Environment Variables に置く。リポジトリにも CI にも本物は無い |
| CI には本物を渡さない | `ci.yml` の build はダミー値だけで通る。GitHub Secrets に本番の鍵を置く必要はない |
| 鍵は用途ごとに最小権限 | `SUPABASE_SERVICE_KEY` は RLS を完全にバイパスする。サーバーのみ・`createServiceClient()` 経由だけで使う |

⚠️ **`NEXT_PUBLIC_` を付けた変数はブラウザに埋め込まれる。** 一度デプロイしたら、変数を消しても配信済みの JS からは消えない。秘密を誤って付けたときは、**変数を消すだけでなく発行元で鍵を無効化する**。

#### 使っていない環境変数を消すとき

以前使っていたサービスの鍵が Vercel に残っていることがある。消す前に、今のコードが読んでいないことを確かめる。

```bash
grep -rn "変数名" src scripts     # コードが読んでいないか
git log -S "変数名" --oneline     # いつ使われなくなったか
```

確認できたら **Vercel から消し、さらに発行元（Stripe・Resend・Supabase など）でもその鍵を無効化する。** Vercel から消すだけでは鍵は生きたまま。

### 3-3. セキュリティヘッダー

`next.config.mjs` の `headers()` で全パス（`/:path*`）に付けている。

| ヘッダー | 値 | なぜ |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Supabase Storage に任意のファイルが入る。アップロードされた画像が HTML として解釈されるのを防ぐ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | URL に店舗 ID が入るページがある。外部へパスとクエリを送らない |
| `X-Frame-Options` | `SAMEORIGIN` | クリックジャッキング対策。iframe 埋め込みは1つも無いので塞いでよい |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | いずれも未使用 |
| `X-Powered-By` | **出さない**（`poweredByHeader: false`） | 使っている物を教える必要はない |

⚠️ **`payment=()` を外す条件**: Stripe Checkout がホスト型（`session.url` へリダイレクト）で、自サイト上で Payment Request API を使っていないから切れている。**埋め込み Checkout や Apple Pay ボタンを自サイトに置くときは `payment` を消すこと。** 入れたままだと決済ボタンが黙って動かない。

#### CSP（Content-Security-Policy）は入れていない

意図的に入れていない。許可リストに `static.cloudflareinsights.com`（Cloudflare Web Analytics）・`fonts.googleapis.com`・`hhdipgftsrsmmuqyifgt.supabase.co`・Stripe を全部書く必要があり、1つ漏らすと**本番で静かに壊れる**（CI もブラウザのエラーも出ないことがある）。

入れるなら必ずこの順で。

1. `Content-Security-Policy-Report-Only` で入れる（違反しても**ブロックしない**。レポートだけ出る）
2. 1〜2週間、実際の利用で違反レポートを集める
3. 漏れを足す
4. `-Report-Only` を外す

### 3-4. ヘッダーの確認方法

本番と同じ実行環境（`next start`）で見る。`npm run dev` では確認にならない。

```bash
npm run build
npm start
```

別のターミナルで叩く。

```bash
for p in / /auth/login /privacy /terms /tokushoho /help /settings /coinLaundry /app/privacy; do
  echo "--- $p $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p) ---"
  curl -sI "http://localhost:3000$p" | grep -iE 'x-content-type-options|referrer-policy|x-frame-options|permissions-policy|x-powered-by'
done
```

本番に対しても同じことをする。

```bash
curl -sI https://www.collecie.com/ | grep -iE 'x-content-type-options|referrer-policy|x-frame-options|permissions-policy|strict-transport'
```

### 3-5. ホスティングと外部サービスの設定チェックリスト

**ダッシュボードの画面は頻繁に変わる。メニューが見つからなければ、画面上部の検索窓にキーワードを入れる。**

#### A. アカウントを守る（最優先）

鍵を何本替えても、アカウントを取られたら終わり。ここから。

| 確認すること | 場所 |
|---|---|
| GitHub の2段階認証 | https://github.com/settings/security |
| GitHub の Collaborators に知らない人がいないか | https://github.com/Tiffany-sho/coin-laundry-app/settings/access |
| GitHub の Personal access tokens（使っていない物を消す） | https://github.com/settings/tokens |
| Vercel の2段階認証 | https://vercel.com/account/security |
| Vercel の Members に知らない人がいないか | Vercel → team の Settings → `Members` |
| Supabase の2段階認証 | https://supabase.com/dashboard/account/security |
| Supabase の Organization members | https://supabase.com/dashboard/org/_/team |
| Stripe の2段階認証とチームメンバー | https://dashboard.stripe.com/settings/team |
| Cloudflare の2段階認証と Members | https://dash.cloudflare.com/profile/authentication |

⚠️ **知らないメンバーは、正体が分からなくても先に外す。** 仲間なら招待し直せば戻る。外したあとにパスワードを変え、トークンを確認し、監査ログでそのメンバーの操作を見る。

#### B. HTTPS（Cloudflare が DNS を持っている）

DNS は Cloudflare、配信は Vercel という構成。TLS は Vercel が終端する。

| 確認すること | 場所 |
|---|---|
| HTTP → HTTPS のリダイレクト | Vercel が自動で行う（§4-4 のコマンドで確認する） |
| HSTS | Vercel が自動で付ける。`includeSubDomains` と `preload` が付いていないか §4-4 で確認する |
| Cloudflare のプロキシ設定 | `dash.cloudflare.com` → `collecie.com` → `DNS`。Vercel 向けのレコードは **DNS only（グレーの雲）** にする。プロキシを有効（オレンジ）にすると二重キャッシュと証明書の問題が起きる |

⚠️ **HSTS の `preload` を安易に有効にしない。** ブラウザに焼き込まれるため、取り消しに数か月かかる。`includeSubDomains` も、サブドメインで HTTPS を張れない物があると全部落ちる。

#### C. Vercel

| 確認すること | 場所・値 |
|---|---|
| Deployment Protection | Settings → `Deployment Protection`。現在 `Vercel Authentication` が `All Except Custom Domains` で有効。**この設定を切らない**（切るとブランチのプレビュー URL が誰でも開ける） |
| Environment Variables | Settings → `Environment Variables`。使っていない変数が残っていないか（§3-2 の手順で確認してから消す） |
| Node.js Version | Settings → `Node.js Version`。現在 22.x だが `package.json` の `engines` が 24.x で上書きする。**揃えておくと混乱が少ない** |
| Git の自動デプロイ対象 | Settings → `Git`。`main` だけが Production になっているか |
| Log Drains / Observability | 障害時にログを見る場所。§4-4 参照 |

##### `.vercel.app` の扱い（2026-10-23 に実測）

| URL | 状態 |
|---|---|
| `https://coin-laundry-app.vercel.app/` | **200。本番アプリをそのまま配信している** |
| `https://coin-laundry-app-git-main-....vercel.app/` | 302。Vercel の SSO に飛ぶ（保護されている） |
| `https://collecie.com/` | 307 で `https://www.collecie.com/` へ |

`Deployment Protection` の `All Except Custom Domains` はブランチのプレビューを守るが、**本番エイリアスの `coin-laundry-app.vercel.app` は守らない。**

**これは認証の抜け穴ではない。** Cloudflare は DNS のみ（`www.collecie.com` は Vercel の IP に直接解決する）で、前段に WAF は無い。つまりこの URL が迂回する防御は無く、middleware も認証も `next.config.mjs` のヘッダーも同じように効く。実質的な問題は**公開入口が2つあること**（検索結果の重複、利用者の混乱）。

⚠️ **塞ぐかどうかは判断が要る。** `collecie.com` の DNS が壊れたとき、この URL が本番を確認できる唯一の経路になる。塞ぐとその退路も消える。

塞ぐなら `next.config.mjs` にホスト指定のリダイレクトを足す。

```js
async redirects() {
  return [
    {
      source: "/:path*",
      has: [{ type: "host", value: "coin-laundry-app.vercel.app" }],
      destination: "https://www.collecie.com/:path*",
      permanent: false,   // 308 にしない。ブラウザに焼き付くと DNS 障害時に戻せない
    },
  ];
}
```

#### D. Supabase

| 確認すること | 場所 |
|---|---|
| RLS が全テーブルで有効か | Database → `Tables`、または Advisors |
| Security Advisor の指摘 | https://supabase.com/dashboard/project/hhdipgftsrsmmuqyifgt/advisors/security |
| API キーの棚卸し | Settings → `API Keys`。`service_role` キーが漏れたら即ローテーション |
| Auth の漏洩パスワード保護 | Authentication → `Policies`（または `Password`）で HaveIBeenPwned 照合を有効にする |
| バックアップ | §4-1 参照 |

2026-10-23 時点の Security Advisor の指摘と判断は §6 に書いてある。

#### E. Stripe

| 確認すること | 場所 |
|---|---|
| 本番キーが `sk_live_` か | https://dashboard.stripe.com/apikeys |
| Webhook の宛先 | https://dashboard.stripe.com/webhooks 。`https://www.collecie.com/api/stripe/webhook` が登録されているか |
| Webhook 署名の検証 | コード側で `STRIPE_WEBHOOK_SECRET` を使って検証していること（検証を外すと誰でも偽の決済成功を送れる） |

---

## 4. 起きたときの備え

### 4-1. バックアップと復旧

**守るべきデータは全部 Supabase にある。** コードは GitHub にあるので失っても復元できるが、集金記録は失ったら戻らない。

| 対象 | どこにあるか | 復旧方法 |
|---|---|---|
| DB（集金記録・店舗・組織） | Supabase Postgres | Supabase の Database → `Backups` から復元 |
| ストレージ（店舗写真・アバター） | Supabase Storage | **自動バックアップの対象外のことがある。要確認** |
| コード | GitHub | `git clone` |
| 環境変数 | Vercel | **どこにも控えが無い。手元に暗号化して保管しておく** |

⚠️ **Supabase の自動バックアップは有料プランの機能。Free プランでは日次バックアップが無いか保持期間が短い。** 自分のプランで何日分残るのかを一度確認し、足りなければ手元にダンプを取る習慣をつける。

手元にダンプを取る。

```bash
# Supabase の接続文字列は Dashboard → Settings → Database → Connection string
pg_dump "<接続文字列>" -Fc -f collecie-$(date +%Y%m%d).dump
```

**取ったダンプは「戻せること」を一度試す。** 試していないバックアップはバックアップではない。

### 4-2. 侵害されたときの手順

順番が大事。**調べる前に止める。鍵を替える前に止める。**

**1. 止める（数分）**

被害を広げないことが先。原因究明は後。

```bash
# 本番を直前の正常なデプロイに戻す
npx vercel rollback --scope shoseis-projects-92458718
```

それでも止まらない、または侵入が続いていると思われるとき。

- Vercel → Settings → `Deployment Protection` で全体に認証をかけ、一時的に閉じる
- Supabase → Settings → `API Keys` で `service_role` キーをローテーションする（アプリは止まるが、攻撃者も止まる）

**2. 鍵を替える（この順番で）**

先に替えると攻撃者に気づかれて証跡を消される、ということはこの規模では考えにくい。被害の大きい順に替える。

| 順 | 鍵 | 替える場所 | 替えたら |
|---|---|---|---|
| 1 | Supabase `service_role` キー | Supabase → Settings → API Keys | Vercel の `SUPABASE_SERVICE_KEY` を更新して再デプロイ |
| 2 | Stripe の Secret key | https://dashboard.stripe.com/apikeys | Vercel の `STRIPE_SECRET_KEY` を更新。Webhook secret も再発行 |
| 3 | GitHub のトークンと SSH 鍵 | https://github.com/settings/tokens | push 経路を塞ぐ |
| 4 | Resend の API キー | https://resend.com/api-keys | Vercel の `RESEND_API_KEY` を更新 |
| 5 | Supabase の DB パスワード | Supabase → Settings → Database | 手元の接続文字列も更新 |
| 6 | 各サービスのログインパスワード | 各サービス | 2段階認証も見直す |

**3. 調べる**

| 見るもの | 場所 |
|---|---|
| 誰が何をしたか（Vercel） | team の Settings → `Audit Log`（プランによる） |
| デプロイ履歴 | https://vercel.com/shoseis-projects-92458718/coin-laundry-app/deployments 。見知らぬデプロイが無いか |
| 実行時のエラーとログ | Vercel の `Logs` / `Observability` |
| DB への不審なクエリ | Supabase → `Logs` → `Postgres` / `API` |
| 認証の異常 | Supabase → `Logs` → `Auth`。見知らぬサインアップや大量の失敗 |
| GitHub の操作履歴 | https://github.com/Tiffany-sho/coin-laundry-app/activity |
| 本番の改ざん | 下のコマンド |

本番の HTML に見知らぬ外部スクリプトが入っていないか。

```bash
curl -s https://www.collecie.com/ | grep -oE '<script[^>]*src="[^"]*"' | sort -u
curl -s https://www.collecie.com/ | grep -oE '<iframe[^>]*src="[^"]*"' | sort -u
```

出てよいのは自分のドメインと `static.cloudflareinsights.com` だけ。それ以外が出たら改ざんを疑う。

**4. 直す**

原因を直してから鍵を戻す。原因が分からないまま再開すると同じことが起きる。

**5. 報告する**

個人情報（メールアドレス・氏名）が漏れた可能性があるときは、報告義務がある。

- 個人情報保護委員会への報告: https://www.ppc.go.jp/personalinfo/legal/leakAction/
  - **速報は「知った時点から概ね3〜5日以内」**、確報は原則30日以内
- 影響を受けた利用者への通知
- クレジットカード情報は Stripe が持っていて自分のサーバーを通らないので、カード番号漏洩の経路は無い（この構成の利点）

### 4-3. ログの見方

| 見たいもの | 場所 |
|---|---|
| アプリの実行時エラー | Vercel → プロジェクト → `Logs`。Runtime のエラーはここ |
| ビルドの失敗 | Vercel → `Deployments` → 該当デプロイ → Build Logs |
| DB のエラーと遅いクエリ | Supabase → `Logs` → `Postgres` |
| 認証の失敗 | Supabase → `Logs` → `Auth` |
| 決済の失敗 | https://dashboard.stripe.com/events |
| メール送信の失敗 | https://resend.com/emails |
| アクセス数の異常 | Cloudflare Web Analytics |

**月1回、Vercel の Logs と Cloudflare の Analytics を見る。** 普段の形を知らないと、異常が異常に見えない。

### 4-4. 外から確認するコマンド

設定画面の値と実際の応答は食い違うことがある。**設定したら必ず外から叩いて確かめる。**

| 確認 | コマンド | 期待値 |
|---|---|---|
| HTTP → HTTPS | `curl -sI http://www.collecie.com/` | 301 / 308 で `Location: https://` |
| HSTS | `curl -sI https://www.collecie.com/ \| grep -i strict` | `max-age=63072000` のみ。`includeSubDomains` と `preload` は**付けない方針**（付くと取り消しに数か月かかる） |
| 古い TLS の拒否 | `curl --tls-max 1.1 https://www.collecie.com/` | 接続失敗 |
| セキュリティヘッダー | `curl -sI https://www.collecie.com/ \| grep -iE 'x-content-type\|referrer-policy\|x-frame\|permissions-policy'` | §3-3 の4種 |
| もう1つの公開入口 | `curl -s -o /dev/null -w '%{http_code}' https://coin-laundry-app.vercel.app/` | **現状 200（素通し）**。§3-5 C の「`.vercel.app` の扱い」を参照 |
| ブランチのプレビュー | `curl -s -o /dev/null -w '%{http_code}' https://coin-laundry-app-git-main-shoseis-projects-92458718.vercel.app/` | 302（Vercel の SSO に飛ぶ）。素通しなら Deployment Protection を確認 |
| `X-Powered-By` が出ていないか | `curl -sI https://www.collecie.com/ \| grep -i powered` | 何も出ない |
| 改ざんの有無 | §4-2 の `<script src>` / `<iframe>` の grep | 自分のドメインと `static.cloudflareinsights.com` 以外が無い |
| DNS | `nslookup -type=NS collecie.com` | Cloudflare の NS 2本 |

#### 2026-10-23 の実測結果（この時点の基準値）

| 確認 | 結果 |
|---|---|
| HTTP → HTTPS | ✅ 308 → `https://www.collecie.com/` |
| HSTS | ✅ `max-age=63072000`（subdomains / preload なし） |
| TLS 1.1 | ✅ 接続失敗（拒否されている） |
| apex → www | ✅ 307 → `https://www.collecie.com/` |
| セキュリティヘッダー | ⚠️ **まだ無い**。`X-Powered-By: Next.js` も出ている。§3-3 の変更を**デプロイすると付く** |
| `coin-laundry-app.vercel.app` | ⚠️ 200（素通し）。§3-5 C 参照 |
| ブランチのプレビュー | ✅ 302（SSO に飛ぶ） |
| 本番 HTML の外部スクリプト | ✅ 全て `/_next/static/...` の自ドメイン。`<iframe>` は0件。改ざんの形跡なし |

**デプロイ後、セキュリティヘッダーの行をもう一度確認すること。**

---

## 5. 保守契約に入れる条項のひな形

受託で保守を請けるとき、または請われるときの文面の下敷き。**数字はすべて例。実際の料金と体制に合わせて書き換える。**

### 5-1. 対象範囲

本契約の保守対象は、以下に限る。

1. 本件アプリケーションのソースコード（リポジトリ `coin-laundry-app`）
2. 上記が依存する npm パッケージの更新
3. Vercel・Supabase の設定のうち、本件アプリケーションの動作に必要なもの

### 5-2. 対象外

以下は本契約の対象に含まない。

1. 第三者サービス（Vercel・Supabase・Stripe・Resend・Cloudflare・Apple）自体の障害および仕様変更への追随（別途見積り）
2. 新機能の開発、既存機能の仕様変更
3. 甲が第三者に行わせた変更に起因する不具合
4. 甲のアカウント管理の不備（パスワードの共有・2段階認証の未設定など）に起因する事象
5. 利用者のデータ入力の誤りに起因する事象

### 5-3. 定期更新

1. 乙は月1回、依存パッケージの更新および脆弱性の確認を行い、結果を甲に報告する。
2. マイナーバージョンおよびパッチバージョンの更新は、乙の判断で適用できる。
3. メジャーバージョンの更新は、事前に甲の承認を得る。

### 5-4. 緊急更新（セキュリティ）

1. 本件アプリケーションに影響する脆弱性が公表され、その深刻度が CVSS v3.1 で 7.0 以上（High 以上）の場合、乙は以下を目標時間とする。

| 区分 | 着手 | 本番反映 |
|---|---|---|
| Critical（CVSS 9.0 以上） | 公表を認識してから **4時間以内** | 認識してから **24時間以内** |
| High（CVSS 7.0 以上） | 認識してから **1営業日以内** | 認識してから **3営業日以内** |
| Medium 以下 | 次回の定期更新に含める | 次回の定期更新 |

2. 「認識」とは、GitHub Dependabot alerts その他の手段により乙が当該脆弱性を知った時点をいう。
3. 上記は努力目標であり、第三者サービス側に修正版が提供されていない場合など、乙の責に帰すことのできない事由による遅延については責任を負わない。

### 5-5. 費用

| 項目 | 金額（例） |
|---|---|
| 月額保守料（定期更新・緊急更新・問い合わせ対応を含む） | 月額 ○○,○○○円（税別） |
| 対象外作業・新機能開発 | 時間単価 ○,○○○円（税別）。事前に見積りを提示し、承認を得てから着手する |
| 第三者サービスの利用料（Vercel・Supabase・Stripe・Resend・Apple） | 甲の負担。乙は立て替えない |

### 5-6. 夜間・休日の対応

1. 乙の対応時間は平日 10:00〜18:00（日本時間、土日祝日および年末年始を除く）とする。
2. 上記時間外の対応は、本件アプリケーションが全面的に停止している場合、または進行中の情報漏洩が疑われる場合に限り、努力義務として行う。
3. 時間外対応を常時可能とする場合は、別途「時間外対応オプション」として月額 ○○,○○○円（税別）を加算する。

### 5-7. 連絡方法

1. 平常時の連絡は ○○（メール / Slack 等）とし、乙は1営業日以内に応答する。
2. 緊急時（§5-4 の Critical、または全面停止・情報漏洩が疑われる場合）の連絡は ○○（電話等）とし、甲乙双方が連絡先を維持する。
3. 連絡先に変更があった場合、変更した当事者は速やかに相手方に通知する。

### 5-8. 侵害が起きたときの対応

1. 乙は、侵害またはその疑いを認識したとき、速やかに甲に通知する。
2. 乙は、被害の拡大を防ぐために必要な緊急措置（ロールバック、鍵のローテーション、サービスの一時停止を含む）を、甲の事前承認を得ずに実施できる。実施後、速やかに甲に報告する。
3. 個人情報保護委員会への報告および本人への通知は、個人情報取扱事業者である**甲の義務**とする。乙は、そのために必要な技術的情報（影響範囲・件数・原因）を提供して協力する。
4. 原因調査の結果は、認識から ○営業日以内に書面で甲に報告する。

### 5-9. 免責

1. 乙は、本契約に基づく保守を善良な管理者の注意をもって行うが、**本件アプリケーションに脆弱性が存在しないことを保証しない**。
2. 乙の責に帰すべき事由による損害賠償の上限は、**直近12か月間に甲が乙に支払った保守料の総額**とする。
3. 第三者サービスの障害・仕様変更・提供終了に起因する損害について、乙は責任を負わない。
4. 甲が §5-2 第4号のアカウント管理義務を履行しなかったことに起因する事象について、乙は責任を負わない。

### 5-10. アカウントの名義

**これを曖昧にしたまま始めない。** 契約終了時に揉める。

1. 以下のアカウントは**甲の名義**で作成し、甲が最終的な管理権限（Owner）を持つ。乙には必要最小限の権限を付与する。

| サービス | 名義 | 乙の権限（例） |
|---|---|---|
| GitHub（リポジトリ） | 甲 | Write（Admin は甲） |
| Vercel | 甲 | Member |
| Supabase | 甲 | Developer |
| Stripe | 甲 | Developer（決済情報の閲覧は最小限） |
| Cloudflare | 甲 | Member |
| Apple Developer Program | 甲 | App Manager |
| ドメイン（collecie.com） | 甲 | なし |

2. 乙は、本契約の終了後 ○日以内に、上記すべてのアカウントから自らの権限を外し、保有する甲の秘密情報（API キー・接続文字列・バックアップを含む）を破棄し、その旨を書面で報告する。
3. 乙の名義で作成されたアカウントがある場合、契約終了時に甲へ移管する。移管できないものは、その旨を契約時に明記する。

---

## 6. 既知の残課題

### 6-1. 入れている `overrides`

`package.json`:

```json
"overrides": {
  "cosmiconfig": {
    "yaml": "^2.8.1"
  }
}
```

**なぜ必要か**: `@emotion/react` → `@emotion/babel-plugin` → `babel-plugin-macros` → `cosmiconfig@7` が `yaml ^1.10.0` を指定している。`yaml@1` には GHSA-48c2-rrv3-qjmp（深くネストした YAML でスタックオーバーフロー）があり、`npm audit fix` では直らない。さらに `yaml@1` が root に巻き上げられ、`vite` が要求する `^2.4.2` を満たせない壊れたツリーになっていた。

**安全な理由**: `cosmiconfig` は `yaml.parse()` しか使っておらず、v2 と互換。かつ YAML を読むのは、`babel-plugin-macros` の設定を YAML で書いた場合だけで、このプロジェクトには該当する設定ファイルが無い。

**消してよい条件**: `cosmiconfig` が `yaml ^2` を指す版（8 以降）に上がったとき。確認方法。

```bash
npm ls cosmiconfig          # 入っている版
npm view cosmiconfig@latest dependencies
```

上がっていたら `overrides` を消して `npm install && npm audit` を実行し、0 件なら消したままでよい。

### 6-2. 修正版が無い脆弱性

**2026-10-23 時点で該当なし。** `npm audit` は 0 件（dev 依存を含む）。

### 6-3. Supabase Security Advisor の指摘（リポジトリ外・未対応）

https://supabase.com/dashboard/project/hhdipgftsrsmmuqyifgt/advisors/security

2026-10-23 に確認した5件。**いずれも DB 側の設定なので、このリポジトリのコードでは直せない。**

| # | 指摘 | 深刻度 | 調べた結果 | やること |
|---|---|---|---|---|
| 1 | `public.get_org_members()` の `search_path` が未設定 | WARN | `SECURITY DEFINER` 関数で `search_path` が可変なのは、呼び出し側が同名のテーブルを別スキーマに作って差し替える経路になりうる。Supabase では `authenticated` にスキーマ作成権限が無いため実際の悪用は難しいが、直すのは1行 | **直すべき**（下の SQL） |
| 2 | `get_org_members()` が `anon` から実行できる | WARN | 関数の中身を確認した。`org_id = (SELECT org_id FROM organization_members WHERE user_id = auth.uid())` で絞っており、`anon` では `auth.uid()` が NULL になるため `org_id = NULL` が成立せず **0 行を返す**。データは漏れない | 対応不要。ただし `anon` から `EXECUTE` を剥がしておくと指摘が消える |
| 3 | `get_org_members()` が `authenticated` から実行できる | WARN | 同上。アプリが `supabase.rpc("get_org_members")` で意図的に呼んでいる（`organization/action.js:231`） | **意図どおり。対応不要** |
| 4 | `public.apple_notifications` は RLS 有効・ポリシー0件 | INFO | ポリシーが無いので `anon` / `authenticated` からは1行も読めない。Apple の Server Notifications を `service_role` で書き込むログテーブルとしては正しい状態 | **意図どおり。対応不要** |
| 5 | 漏洩パスワード保護が無効 | WARN | Supabase Auth が HaveIBeenPwned と照合して、流出済みパスワードでの登録を防ぐ機能 | **有効にすべき**（画面の操作） |

**#1 を直す SQL**（Supabase の SQL Editor で実行する）:

```sql
alter function public.get_org_members() set search_path = public, pg_temp;
```

**#5 を有効にする**: Supabase Dashboard → `Authentication` → `Policies`（または `Password` / `Sign In / Up`）→ 漏洩パスワードの確認を有効化。見つからなければ画面の検索窓に `leaked` と入れる。

### 6-4. CSP が無い

§3-3 のとおり意図的。入れるなら Report-Only から。

### 6-5. ESLint が無い

このプロジェクトには ESLint の設定も `lint` スクリプトも無い。CI は `npm test`（431 件）と `npm run build` を品質ゲートにしている。

脆弱性対策の範囲では入れないと判断した（`eslint` と `eslint-config-next` で依存が大きく増え、既存コード全体に初回の警告が大量に出るため）。入れるなら別の作業として切り出す。
