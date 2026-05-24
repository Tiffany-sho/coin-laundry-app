# Style Unification Design — 全ページへの設定ページスタイル適用

**Goal:** `/settings` ページで確立したティール系デザインシステム（CSS変数・カードスタイル・見出し色）をアプリ全ページに統一する。

**Approach:** ファイルごとに直接修正。Chakraセマンティックトークン（`fg`/`fg.muted`）とハードコード色（`bg="white"`等）をCSS変数に置き換える。

---

## デザイン変更ルール

### テキストカラー
| 変更前 | 変更後 |
|--------|--------|
| `color="fg"` | `color="var(--text-main)"` |
| `color="fg.muted"` | `color="var(--text-muted)"` |
| `color="gray.500"` / `color="gray.600"` (汎用テキスト) | `color="var(--text-muted)"` |
| ページ・セクション見出し（色指定なし） | `color="var(--teal-deeper)"` 追加 |

### 背景・カード
| 変更前 | 変更後 |
|--------|--------|
| `bg="white"` (カード背景) | `bg="var(--card-bg, #FFFFFF)"` |
| Card `variant="elevated"` | `bg="var(--card-bg)"` + `border="1px solid"` + `borderColor="cyan.100"` + `boxShadow="var(--shadow-sm)"` + `borderRadius="xl"` |
| `borderColor="gray.200"` (カードボーダー) | `borderColor="cyan.100"` |

### ボーダー・シャドウ
- カードボーダー: `border="1px solid"` + `borderColor="cyan.100"` に統一
- カードシャドウ: `boxShadow="var(--shadow-sm)"` に統一
- カード角丸: `borderRadius="xl"` (18px相当) に統一

---

## 変更しないもの

- `MachinesState.jsx` / `NowLaundryNum.jsx` の `cyan.*`/`orange.*` 状態カラー（機器の正常/警告/故障表示ロジック）
- エラー表示の `red.*` カラー
- ボタンのティールグラデーション (`linear-gradient(135deg, #0891B2 0%, #0E7490 100%)`)
- `CollectMoneyFooter` の琥珀色ドラフト保存ボタン (`#D97706`)
- 認証ページのグラデーションヘッダー（すでに設定ページスタイルに近い）

---

## 対象ファイル（15ファイル）

### Task 1: 認証コンポーネント（3ファイル）
**Files:**
- `src/app/feacher/auth/components/AuthForm/AuthForm.jsx`
- `src/app/feacher/auth/components/ForgetPassword/ForgetPassword.jsx`
- `src/app/feacher/auth/components/UpdataPassword/UpdatePassword.jsx`

**変更内容:**
- カード背景 `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`
- 見出し `color="var(--teal-deeper)"` 追加（未設定箇所）
- `color="fg.muted"` → `color="var(--text-muted)"`

### Task 2: 店舗一覧（2ファイル）
**Files:**
- `src/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage.jsx`
- `src/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryList.jsx`

**変更内容:**
- 空状態カード `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`
- CoinLaundryList: 軽微なボーダー調整（すでにほぼ対応済み）

### Task 3: 店舗詳細（4ファイル）
**Files:**
- `src/app/feacher/coinLandry/components/MonoCoinLaundry/MonoCard.jsx`
- `src/app/feacher/coinLandry/components/MonoCoinLaundry/MonoDataTotal.jsx`
- `src/app/feacher/coinLandry/components/MonoCoinLaundry/HaveMachines.jsx`
- `src/app/feacher/coinLandry/components/NowLaundryNum.jsx`

**変更内容:**
- MonoCard: `color="fg"` → `var(--text-main)`、`color="fg.muted"` → `var(--text-muted)`
- MonoDataTotal: `bg="white"` → `var(--card-bg)`、`borderColor="gray.200"` → `cyan.100`、`color="green.700"` → `color="var(--teal-deeper)"` (収益額)
- HaveMachines: カード背景 `bg="white"` → `var(--card-bg)`
- NowLaundryNum: メインカード `bg="white"` → `var(--card-bg)`（状態カラーは維持）

### Task 4: 収益レポート（1ファイル）
**Files:**
- `src/app/feacher/collectMoney/components/coinDataList/CoinDataList.jsx`

**変更内容:**
- `color="fg.muted"` → `color="var(--text-muted)"`
- `color="fg"` → `color="var(--text-main)"`
- カード `variant="elevated"` → 明示スタイル（`bg="var(--card-bg)"` + `border="1px solid"` + `borderColor="cyan.100"` + `boxShadow="var(--shadow-sm)"` + `borderRadius="xl"`）
- 見出し「収益レポート」「売上履歴」に `color="var(--teal-deeper)"` 追加

### Task 5: 集金フォーム（5ファイル）
**Files:**
- `src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyForm.jsx`
- `src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyHeader.jsx`
- `src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyFooter.jsx`
- `src/app/feacher/collectMoney/components/collectMoneyForm/CollectMethodCard.jsx`
- `src/app/feacher/collectMoney/components/collectMoneyForm/MachineAndMoney.jsx`

### Task 6: 店舗登録・編集フォーム（1ファイル）
**Files:**
- `src/app/feacher/coinLandry/components/CoinLaundryForm/CoinLaundryForm.jsx`

**変更内容:**
- `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`
- 見出しに `color="var(--teal-deeper)"` 追加
- `color="fg.muted"` → `color="var(--text-muted)"`（あれば）

**変更内容:**
- `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`
- `color="fg.muted"` → `color="var(--text-muted)"`
- セクション見出しに `color="var(--teal-deeper)"` 追加
- CollectMoneyFooter の琥珀色ドラフトボタンは変更しない

---

## 動作確認チェックリスト

- [ ] ライトモードで全ページが正常に表示される
- [ ] ダークモード切替後、全ページの背景・テキスト・カードが適切に変化する
- [ ] 機器状態表示（正常/警告/故障）の色が維持されている
- [ ] 集金フォームの入力・送信が正常に動作する
- [ ] 認証フォームのログイン・サインアップが正常に動作する
