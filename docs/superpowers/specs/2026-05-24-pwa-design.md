# PWA対応 設計ドキュメント

**日付**: 2026-05-24  
**対象アプリ**: Collecie（コインランドリー集金アプリ）

---

## 概要

既存のNext.js 16 + App RouterアプリにPWA機能を追加する。  
目的はスマートフォンのホーム画面へのインストールと、オフライン時の最低限のフィードバック表示。

---

## 要件

| 要件 | 内容 |
|------|------|
| インストール | iOSおよびAndroidのホーム画面に追加できる |
| オフライン対応 | ネット未接続時に「オフライン中」画面を表示する |
| 既存機能への影響 | なし（完全に上書きではなく追加） |
| アイコン | プレースホルダー（後から差し替え可能） |
| 実装方針 | 手動（パッケージ追加なし、turbopack互換を保つ） |

---

## アーキテクチャ

### 追加ファイル

```
public/
├── manifest.json        # Web App Manifest
├── sw.js                # Service Worker
├── offline.html         # オフライン表示ページ
└── icons/
    ├── icon-192.png     # アイコン 192×192（プレースホルダー）
    └── icon-512.png     # アイコン 512×512（プレースホルダー）
```

### 変更ファイル

```
src/app/layout.js        # manifest参照メタタグ + SW登録スクリプト追加
```

---

## 各ファイルの詳細

### manifest.json

```json
{
  "name": "Collecie",
  "short_name": "Collecie",
  "description": "コインランドリー集金管理アプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F0F9FF",
  "theme_color": "#0891B2",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### sw.js（Service Worker）

- **戦略**: Network First
- **キャッシュ対象**: `offline.html` のみ
- **動作**:
  1. インストール時に `offline.html` をキャッシュ
  2. 通常時はネットワークにそのままパス（干渉しない）
  3. ネットワークエラー時のみ `offline.html` を返す

### offline.html

- ティールテーマに合わせたシンプルなHTML
- 「インターネットに接続されていません」メッセージ
- 「再読み込み」ボタン
- Next.jsやChakra UIには依存しない（純粋なHTML/CSS）

### layout.js の変更内容

```js
// 追加するメタタグ
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0891B2" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />

// 追加するスクリプト（SW登録）
<Script id="sw-register" strategy="afterInteractive">
  {`
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  `}
</Script>
```

---

## アイコンについて

プレースホルダーとして、Node.jsスクリプトでティールカラーの無地PNGを生成する。  
後からデザイン素材ができた時点で `public/icons/` 以下のファイルを差し替えるだけでよい。

---

## 対象外（スコープ外）

- プッシュ通知（iOSのPWAでは未対応）
- 完全オフライン対応（データの一時保存・同期）
- バックグラウンド同期
- App Storeへの公開

---

## テスト観点

- [ ] Chromeデベロッパーツール > Application > Manifest でmanifestが認識されるか
- [ ] Chromeデベロッパーツール > Application > Service Workers でSWが登録されるか
- [ ] ネットワークをオフにしたとき `offline.html` が表示されるか
- [ ] iOSの「ホーム画面に追加」でアイコンが表示されるか
- [ ] ホーム画面から起動したとき `standalone` モードで開くか
