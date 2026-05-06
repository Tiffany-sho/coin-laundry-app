# Collecie — コインランドリー集金アプリ

コインランドリーの集金業務を効率化する Web アプリケーションです。  
店舗登録・集金記録・在庫/機器状態管理・データ可視化を一元管理できます。

**公開 URL**: https://www.collecie.com/

---

## 機能

- **ユーザー認証** — Supabase Auth によるサインアップ・ログイン。登録データは本人のみ閲覧可能（RLS 有効）
- **店舗管理** — 店舗の登録・編集・削除。機器構成や写真も管理可能
- **集金記録** — 機器ごとの詳細記録と全機器合計の 2 方式に対応。記録の作成・更新・削除が可能
- **在庫・機器状態管理** — 店舗ごとに洗剤などの在庫や機器（洗濯機・乾燥機）の状態を記録・確認
- **データ可視化** — 集金データをグラフで表示し、収益の推移を直感的に把握

---

## 技術スタック

| 役割 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) |
| UI ライブラリ | Chakra UI v3 |
| バックエンド / DB / 認証 | Supabase (RLS 有効) |
| チャート | Recharts |
| デプロイ | Vercel |

---

## ローカルで動かす

```bash
git clone https://github.com/Tiffany-sho/coin-laundry-app.git
cd coin-laundry-app
npm install
npm run dev
```

`.env.local` に以下の環境変数を設定してください。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=aaabbbcccddddxxxxx.....
```

---

## サンプルデータで試す

公開 URL (https://www.collecie.com/) にアクセスし、下記の情報でログインするとサンプルデータを確認できます。

- **メールアドレス**: sample@sample.mail.jp
- **パスワード**: sample

> サンプルデータのため、編集・削除はご遠慮ください。

---

## ライセンス・利用について

本アプリは商用利用不可です。個人でのユーザー登録・利用は歓迎いたします。
