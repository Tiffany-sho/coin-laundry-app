# collectMoney PC 2カラムレイアウト設計

## 目的

PC画面でグラフが全体表示されない問題を解決する。
チャートを左列に固定（sticky）し、右列に売上履歴を配置することで
チャートを見ながら履歴をスクロールできるようにする。

## 変更ファイル

`src/app/feacher/collectMoney/components/coinDataList/CoinDataList.jsx` のみ。

## レイアウト構造

### モバイル（base）

現状の VStack 縦積みをそのまま維持。

### PC（md+）

```
┌─────────────────────────────────────┐
│ ヘッダー行（フル幅）                   │
├──────────────────────┬──────────────┤
│ 集金総額カード（3fr）  │ 売上履歴（2fr）│
│                      │ ↕ スクロール  │
│ チャートカード         │              │
│ sticky               │              │
└──────────────────────┴──────────────┘
```

- グリッド: `templateColumns={{ base: "1fr", md: "3fr 2fr" }}`
- 左列: `position="sticky" top="16" alignSelf="start"`（top=64px＝ナビバー高さ）
- 右列: 通常フロー

## 実装変更点

1. `Grid`, `GridItem` を `@chakra-ui/react` からインポートに追加
2. 集金総額カード＋チャートカード → 左 `GridItem`（sticky）
3. 売上履歴セクション → 右 `GridItem`
4. Drawer は Portal ベースのため変更不要

## 非変更事項

- 子コンポーネント（CoinManyDataTable、CoinMonoDataTable、AddDataBtn等）は変更しない
- モバイルレイアウトは現状維持
