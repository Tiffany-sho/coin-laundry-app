# CLAUDE.md — Collecie (コインランドリー集金アプリ)

## プロジェクト概要

コインランドリーの集金業務を効率化するWebアプリ。  
店舗登録・集金記録・在庫/機器状態管理・データ可視化を一元管理する。

- **公開URL**: https://www.collecie.com/
- **リポジトリ**: https://github.com/Tiffany-sho/coin-laundry-app

---

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| UIライブラリ | Chakra UI v3 |
| バックエンド/DB/認証 | Supabase (RLS有効) |
| チャート | Recharts |
| デプロイ | Vercel |
| スタイリング | Chakra UI優先（`module.css`は最小限） |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   └── supabaseFunctions/
│   │       ├── supabaseDatabase/   # DB操作（CRUD）はここに集約
│   │       └── supabaseStorage/    # ストレージ操作
│   ├── feacher/                    # 機能別UIコンポーネント群
│   │   ├── partials/               # レイアウト共通部品（Navbar, Footer等）
│   │   ├── coinLandry/             # 店舗関連UI
│   │   ├── collectMoney/           # 集金関連UI
│   │   ├── dialog/                 # ダイアログ群
│   │   └── ...
│   ├── coinLaundry/                # 店舗ページ（一覧・詳細・新規）
│   ├── collectMoney/               # 集金ページ
│   ├── auth/                       # 認証ページ
│   └── account/                    # アカウントページ
├── components/
│   └── ui/                         # 汎用UIコンポーネント（Chakra UI拡張）
├── functions/                      # ユーティリティ関数
└── seeds/                          # シードデータ
```

---

## 開発ルール

### DB操作
- Supabase の CRUD は必ず `src/app/api/supabaseFunctions/` 配下に書く。ページや components 内に直書きしない。
- RLS が有効なので、ポリシーを意識してクエリを書く。

### スタイリング
- **Chakra UI を優先**。`module.css` は Chakra で対応できないレイアウト調整のみ使用。
- ダークモード対応を将来的に行うため、ハードコードの色（`#ffffff` など）は使わず、Chakra のトークン（`colorPalette`、`bg`、`color` props）を使う。

### コンポーネント設計
- コンポーネントは積極的に分割する（1ファイル1責務を意識）。
- 共通UIは `src/components/ui/` に、機能固有UIは `src/app/feacher/<機能名>/` に配置。
- ファイル形式は `.jsx` で統一。TypeScript移行予定なし。
- **React Server Components (RSC) をデフォルト**とする。`useState`・`useEffect`・イベントハンドラが必要な場合のみ `"use client"` を使用する。
  - データフェッチは Server Component で行い、Client Component にはデータをプロパティとして渡す。
  - インタラクティブな部分だけを切り出して Client Component にする（ページ全体を `"use client"` にしない）。

### パフォーマンス
- ページ遷移速度を最優先にする。
- `next/link` による prefetch を活用。重いデータフェッチは Server Component 側で行う。
- 不要な `useEffect` や再レンダリングを避ける。

### コーディングスタイル
- 変数名・関数名に特定の言語規則なし（英語推奨）。
- コメントは日本語でも英語でも可。
- 状態管理はグローバル管理なし（Context API / Zustand は使わない）。各ページのローカル state で管理。

---

## 作業後のフロー

- 機能単位・ファイル単位でこまめにコミットすること。大きな変更をまとめて1コミットにしない。
- 変更を加えたら必ず **git push** すること（Vercel への自動デプロイが走る）。

```bash
git add <変更ファイル>
git commit -m "変更内容を簡潔に"
git push origin main
```

---

## リファクタリング方針

- 勝手にリファクタリングしてよい。
- 大きなコンポーネントは積極的に分割する。
- ただし、DB操作・認証・RLSに関わる変更は動作確認を優先する。

---

## 今後の実装予定

1. **集金時の一時データ保存** — 集金途中のデータをローカルまたはDBに一時保存
2. **役割・権限管理** — 管理者 / 集金担当者 / 閲覧者などのロール追加
3. **サブスクリプション機能** — 有料プランによる機能制限

---

## 環境変数

`.env.local` に以下を設定（Vercel の環境変数にも同様に設定済み）:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=aaabbbcccddddxxxxx.....
```

---

## よく使うコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm start        # 本番サーバー起動
```
