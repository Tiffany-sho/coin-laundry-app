# 11. デザインシステムの移植

> [← 目次に戻る](README.md)

`globals.css` の CSS 変数を TS のトークンに 1:1 で移す。Chakra UI は使わず（RN 非対応）、**トークン + 自前の薄いプリミティブ**で構築する。

```ts
// apps/mobile/src/theme/tokens.ts
export const color = {
  teal:       "#0891B2",   // プライマリ
  tealDark:   "#0E7490",   // ホバー・アクティブ
  tealDeeper: "#155E75",   // ロゴ・見出し
  tealPale:   "#CFFAFE",   // 薄い背景
  appBg:      "#F0F9FF",   // 画面背景
  cardBg:     "#FFFFFF",
  textMain:   "#1E3A5F",
  textMuted:  "#64748B",
  textFaint:  "#94A3B8",
  divider:    "#F1F5F9",
} as const;

export const radius = { card: 18, pill: 999 } as const;

export const shadow = {
  sm:   { shadowColor: "#0891B2", shadowOpacity: 0.08, shadowRadius: 12,
          shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  hero: { shadowColor: "#0E7490", shadowOpacity: 0.28, shadowRadius: 40,
          shadowOffset: { width: 0, height: 12 }, elevation: 8 },
} as const;

export const font = {
  ui:    "NotoSansJP_400Regular",
  uiBold:"NotoSansJP_700Bold",
  mono:  "SpaceMono_700Bold",     // 金額・数値表示
} as const;

/** ヒーローカード: linear-gradient(140deg, #0E7490, #0891B2 55%, #06B6D4) */
export const heroGradient = {
  colors: ["#0E7490", "#0891B2", "#06B6D4"] as const,
  locations: [0, 0.55, 1] as const,
  start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
};
```

## Web との対応表

| Web（Chakra / CSS）| iOS（RN）|
|---|---|
| `borderRadius="xl"` (18px) | `radius.card` |
| `boxShadow="sm"` / `var(--shadow-sm)` | `shadow.sm` |
| `@keyframes fadeSlideUp` | `react-native-reanimated` の `FadeInDown` |
| タップ領域 48×48px | **iOS HIG に合わせ 44×44pt 以上、実装は 48pt を維持**（現場のグローブ操作を優先）|
| `position: fixed` ボトムナビ | `expo-router` Tabs + `useSafeAreaInsets()` |
| Recharts | `victory-native` (Skia) |
| `Noto Sans JP` / `Space Mono`（Google Fonts）| `@expo-google-fonts/noto-sans-jp` / `@expo-google-fonts/space-mono` |

## RN 固有の注意

- **ダークモード**：現行 Web はライト固定。アプリも v1 はライト固定（`app.json` の `userInterfaceStyle: "light"`）。中途半端な対応は現場で読みづらくなる。
- **フォント読み込み**：日本語フォントは容量が大きい。`NotoSansJP` は Regular / Bold の 2 ウェイトのみ同梱し、サブセット化を検討。
- **金額表示**：`Space Mono` + `toLocaleString()` は現行と同じ。`¥{total.toLocaleString()}` の見た目を保つ。

---

**関連章**: [7. 画面設計](07-screens.md) / [12. ライブラリ選定](12-libraries.md) / [付録: 既存コード対応表](99-mapping.md)
