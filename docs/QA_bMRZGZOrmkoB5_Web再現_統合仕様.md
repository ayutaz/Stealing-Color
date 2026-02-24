# QA_bMRZGZOrmkoB5 Web再現 統合仕様（実装反映版 v5）

更新日: 2026-02-25  
適用範囲: Web実装（P2実装済み）  
本書の位置づけ: 以下3文書（現在は削除済み）を統合し、矛盾を解消した最新版
- `docs/QA_bMRZGZOrmkoB5_Web再現_技術調査.md`
- `docs/QA_bMRZGZOrmkoB5_Web再現_レベル別パラメータ表.md`
- `docs/QA_bMRZGZOrmkoB5_Web再現_技術調査レビュー_5agents.md`

本書はこのプロジェクトのWeb再現仕様における単一正本（Single Source of Truth）とする。

---

## 0. 解析対象と体験要件（統合）

### 0.1 解析対象
- 対象動画: `QA_bMRZGZOrmkoB5.mp4`
- 尺: 約52.4秒
- 解像度: 920x720
- 映像: H.264
- 音声: なし

### 0.2 体験の核
- クリック1回ごとに呪いレベルが1段階上がる。
- 進行と同時に、背景色/ノイズ/グリッチ/文字崩壊/色チップ/ドクロ表示が強化される。
- 終盤は「THE COLORS FREE」出現後、白化と可読性崩壊でクライマックスに到達する。

### 0.3 フェーズ要約
| フェーズ | 主要変化 |
|---|---|
| Intro | 黒背景、導入文言、チップ0 |
| Lv1-Lv3 | 赤から青成分が混ざり始め、ノイズ増加 |
| Lv4-Lv6 | ピンク/黄/灰へ展開、文言圧が増加 |
| Lv7-Lv9 | 傾き・グリッチ強化、`THE COLORS FREE` 出現 |
| Final | ボタン文言消失、白化最大、白チップ追加 |

### 0.4 必須要件
- `Intro -> Lv1 -> ... -> Lv9 -> Final` の逐次ステート遷移
- 各レベルで背景/テキスト/UI色/チップ/ドクロ/VFXを同時更新
- Finalで「白化 + 文字崩壊 + ボタン文字消失」を再現

### 0.5 実装状況（2026-02-25時点）
- 実装済み:
 - Vite + TypeScript基盤
 - ESLint/Prettier設定
 - GitHub Actions（lint/test/build）
 - UI層とVFX層の分離
 - StateMachine / LevelConfig（固定値反映）
 - ProgressionController（1クリック=1遷移 + clickLock）
 - Finalでのボタン文言消失
 - レベル別VFX反映（noise/blur/glitch/whiteout/particle等）
 - 背景語彙レイヤー + `THE COLORS FREE` レイヤー
 - Q3-Q0品質ラダー（FPSベース自動降格）
- 検証済み:
 - `npm run lint` 成功
 - `npm run test` 成功
 - `npm run build` 成功
 - `npm audit` 0 vulnerabilities
 - 動的テスト4項目（状態進行/連打/Final固定/チップ数一致）をUnit Testで実装
 - 品質ラダー（Q3-Q0）のUnit Testを実装
- 未実装:
 - EyeDropper + フォールバック連携
 - Playwright静止/動的E2E
 - フォールバック同等性テスト

---

## 1. レビュー反映サマリー（Fix Log）

| ID | 指摘 | 反映内容 |
|---|---|---|
| F1 | 色チップ定義不整合 | 10チップを正とし統一（Lv9で9個、Finalで白追加=10個） |
| F2 | 遷移時間の上限超過 | 全レベル `transitionMs <= 500` に修正 |
| F3 | QAが静止比較中心 | 動的検証（クリック回数とState一致）を必須追加 |
| F4 | EyeDropperフォールバック同等性不明 | 同等体験の受け入れ基準を明文化 |
| F5 | 絵文字依存テキスト | アイコンをテキストから分離（`titleIcon`, `buttonIcon`） |

---

## 2. 実装方針（確定）

- 構成: `PixiJS(VFX) + DOM(UI) + FSM(LevelConfig駆動)`
- 状態遷移: `Intro -> Lv1 -> Lv2 -> Lv3 -> Lv4 -> Lv5 -> Lv6 -> Lv7 -> Lv8 -> Lv9 -> Final`
- 進行ルール: 1クリックで1段階進行、逆戻りなし、スキップなし
- 基準解像度: `920x720`（実装時は相対スケール）

---

## 3. 互換性と入力設計（確定）

### 3.1 入力
- Pointer Eventsで統一（`pointerdown`）
- 多重入力防止は `clickLockMs` で制御

### 3.2 色取得（優先順）
1. `EyeDropper`（対応環境）
2. Canvasピクセルサンプリング（非対応環境）
3. `input[type=color]`（最終フォールバック）

### 3.3 フォールバック同等性の受け入れ基準
- 1回のユーザー操作で必ず1レベルだけ進む
- 色選択結果がチップへ反映される
- 中央導線（見出し/ボタン/チップ/呪い表示）のレイアウトが崩れない
- 体験時間が基準実装比で `±15%` 以内

---

## 4. LevelConfigスキーマ（実装入力）

| キー | 型 | 説明 |
|---|---|---|
| `state` | string | `Intro/Lv1.../Final` |
| `titleText` | string | 見出し本文（絵文字なし） |
| `titleIcon` | enum | `none/palette/devil/skull/eye` |
| `buttonText` | string | ボタン本文（絵文字なし） |
| `buttonIcon` | enum | `none/eye` |
| `chips` | string[] | チップトークン配列 |
| `curseSkulls` | number | 右下ドクロ数 |
| `bgGradient` | string | 背景グラデーション |
| `ui` | object | ボタンサイズ・色 |
| `effects` | object | ノイズ/ブラー等の強度 |
| `transitionMs` | number | レベル切替時間（最大500） |
| `clickLockMs` | number | 連打防止ロック時間 |

---

## 5. 固定トークン（色/レイアウト）

### 5.1 チップ順（統一版）
`red -> charcoal -> cyan -> pink -> yellow -> gray -> navy -> blue -> deep -> white`

| Token | Hex | 初出 |
|---|---|---|
| `chip.red` | `#F65A43` | Lv1 |
| `chip.charcoal` | `#2B2F36` | Lv2 |
| `chip.cyan` | `#56ABE8` | Lv3 |
| `chip.pink` | `#F45D97` | Lv4 |
| `chip.yellow` | `#F1D46C` | Lv5 |
| `chip.gray` | `#7B736D` | Lv6 |
| `chip.navy` | `#1A3C8B` | Lv7 |
| `chip.blue` | `#253BFF` | Lv8 |
| `chip.deep` | `#12162D` | Lv9 |
| `chip.white` | `#F8FAFF` | Final |

### 5.2 レイアウト固定値（920x720）
- 見出しY: `centerY - 110`
- ボタン中心Y: `centerY + 10`
- チップ列Y: `centerY + 115`
- 右下ラベル: `right:16`, `bottom:10`
- チップ径: `44`
- チップ間隔: `50`
- 1段目最大: `6`
- 2段目オフセット: `+52`

---

## 6. レベル別確定値（v2）

| State | titleText | titleIcon | buttonText | buttonIcon | Chip数 | Skull数 | transitionMs | clickLockMs |
|---|---|---|---|---|---:|---:|---:|---:|
| Intro | 色をピックしてね | palette | スポイトで色を盗む | eye | 0 | 0 | 260 | 140 |
| Lv1 |  | none | もっと盗む（呪い Lv.1） | eye | 1 | 1 | 320 | 150 |
| Lv2 | もっと | devil | もっと盗む（呪い Lv.2） | eye | 2 | 2 | 340 | 160 |
| Lv3 | やめられないだろ? | skull | もっと盗む（呪い Lv.3） | eye | 3 | 3 | 360 | 170 |
| Lv4 | もう戻れない | eye | もっと盗む（呪い Lv.4） | eye | 4 | 4 | 380 | 170 |
| Lv5 | 色を返 | none | もっと盗む（呪い Lv.5） | eye | 5 | 5 | 400 | 180 |
| Lv6 | 色を返せ | none | もっと盗む（呪い Lv.6） | eye | 6 | 6 | 420 | 180 |
| Lv7 | 色を返せ | none | もっと盗む（呪い Lv.7） | eye | 7 | 7 | 450 | 190 |
| Lv8 |  | none | もっと盗む（呪い Lv.8） | eye | 8 | 8 | 480 | 200 |
| Lv9 |  | none | もっと盗む（呪い Lv.9） | eye | 9 | 9 | 500 | 220 |
| Final | THE COLORS FREE | none |  | eye | 10 | 12 | 500 | 240 |

---

## 7. 背景とVFX確定値（v2）

### 7.1 背景グラデーション

| State | Gradient |
|---|---|
| Intro | `linear-gradient(180deg, #090A0D 0%, #090A0D 100%)` |
| Lv1 | `linear-gradient(180deg, #EF5A41 0%, #EF5A41 100%)` |
| Lv2 | `linear-gradient(90deg, #E45740 0%, #2D3037 58%, #2D3037 100%)` |
| Lv3 | `linear-gradient(130deg, #E05A45 0%, #30343B 45%, #53A9E4 100%)` |
| Lv4 | `linear-gradient(180deg, #D65244 0%, #2E3B48 42%, #4EA8E2 70%, #F05D93 100%)` |
| Lv5 | `linear-gradient(140deg, #EFD57A 0%, #F36899 44%, #58ACE6 73%, #2B343B 100%)` |
| Lv6 | `linear-gradient(90deg, #706860 0%, #706860 24%, #E6CD79 44%, #F06495 66%, #6D8CBE 100%)` |
| Lv7 | `linear-gradient(140deg, #21418D 0%, #244A9F 38%, #E3C874 73%, #F28A96 100%)` |
| Lv8 | `linear-gradient(180deg, #253BFF 0%, #1F36D3 52%, #364786 74%, #E4C870 100%)` |
| Lv9 | `linear-gradient(160deg, #1F2FE7 0%, #15258E 46%, #0F1434 100%)` |
| Final | `linear-gradient(90deg, #2341F0 0%, #1A30A7 46%, #EDEFF4 68%, #FBFCFF 100%)` |

### 7.2 VFX強度

| State | noise | blurPx | ghostText | glitchHz | tiltDeg | shakePx | particleRate | whiteout | bloom | chromaticPx | vignette |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Intro | 0.00 | 0.0 | 0.00 | 0.0 | 0.0 | 0.0 | 0 | 0.00 | 0.04 | 0.0 | 0.10 |
| Lv1 | 0.03 | 0.2 | 0.00 | 0.0 | 0.0 | 0.1 | 2 | 0.00 | 0.08 | 0.0 | 0.12 |
| Lv2 | 0.08 | 0.8 | 0.14 | 0.4 | 0.3 | 0.4 | 6 | 0.00 | 0.12 | 0.2 | 0.16 |
| Lv3 | 0.12 | 1.4 | 0.24 | 0.8 | 0.6 | 0.7 | 10 | 0.00 | 0.16 | 0.4 | 0.18 |
| Lv4 | 0.18 | 1.9 | 0.38 | 1.3 | 1.0 | 1.1 | 15 | 0.00 | 0.22 | 0.7 | 0.22 |
| Lv5 | 0.23 | 2.4 | 0.50 | 1.9 | 1.4 | 1.4 | 20 | 0.00 | 0.28 | 1.0 | 0.24 |
| Lv6 | 0.29 | 3.0 | 0.58 | 2.4 | 1.9 | 1.8 | 26 | 0.02 | 0.34 | 1.2 | 0.30 |
| Lv7 | 0.35 | 3.8 | 0.68 | 3.2 | 2.8 | 2.4 | 34 | 0.05 | 0.40 | 1.5 | 0.36 |
| Lv8 | 0.43 | 4.6 | 0.76 | 4.0 | 3.5 | 3.0 | 42 | 0.10 | 0.46 | 1.9 | 0.42 |
| Lv9 | 0.53 | 5.8 | 0.88 | 5.4 | 4.6 | 3.8 | 50 | 0.20 | 0.54 | 2.3 | 0.48 |
| Final | 0.46 | 4.9 | 1.00 | 6.8 | 5.8 | 2.6 | 58 | 1.00 | 0.72 | 2.8 | 0.28 |

補足:
- `Lv9` で `THE COLORS FREE` グリッチレイヤーを有効化
- `Final` でボタン本文を空にし、白化を最大化

---

## 8. QA仕様（静止 + 動的）

### 8.1 静止比較（ビジュアル回帰）
- Lv1-Lv9-Final を `toHaveScreenshot()` で比較
- 差分許容は環境固定の上で `maxDiffPixels` を管理

### 8.2 動的テスト（新規必須）
- `test_state_progression_single_click`
 - 各クリック後に `stateIndex` が +1 される
- `test_no_skip_under_rapid_click`
 - 100ms間隔連打でも状態スキップしない
- `test_final_stays_final`
 - Final到達後のクリックでStateが増えない
- `test_chip_count_matches_state`
 - `chips.length` が状態に対応（0..10）
- `test_fallback_equivalence`
 - EyeDropper無効時でも1操作=1進行を満たす

実装進捗（2026-02-25）:
- `test_state_progression_single_click`: 実装済み（Unit）
- `test_no_skip_under_rapid_click`: 実装済み（Unit）
- `test_final_stays_final`: 実装済み（Unit）
- `test_chip_count_matches_state`: 実装済み（Unit）
- `test_fallback_equivalence`: 未実装
- `test_vfx_lv9_final_activation`: 実装済み（Unit）
- `test_whiteout_peak_at_final`: 実装済み（Unit）
- `test_ghost_vocabulary_stage_diff`: 実装済み（Unit）

---

## 9. パフォーマンス仕様

| 品質 | 条件 | ルール |
|---|---|---|
| Q3 | 55fps以上 | 表の値を100%適用 |
| Q2 | 45fps以上55fps未満 | `particleRate x0.75`, `blurPx x0.8` |
| Q1 | 30-45fps | `particleRate x0.5`, `blurPx x0.6`, `glitchHz x0.7` |
| Q0 | 30fps未満 | 粒子停止、`ghostText x0.5`, `noise x0.6`, `whiteout`維持 |

---

## 10. 実装チェックリスト（進捗）

- [x] チップ定義が10色順で全ドキュメント一致
- [x] `transitionMs` が全状態で500ms以下
- [x] アイコンとテキストの分離実装方針を採用
- [x] 動的QAテスト4項目を実装（状態進行/連打/Final固定/チップ数）
- [x] VFXパラメータ（7.2）を実装へ反映
- [x] 背景語彙と `THE COLORS FREE` レイヤーを実装
- [x] 品質ラダー（Q3-Q0）を実装
- [x] P2視覚要件（Lv9/Final有効化、whiteout最大、語彙段階差）のUnit Testを実装
- [ ] EyeDropperフォールバック同等性を実装で担保

---

## 11. 旧文書の扱い

- 以下の統合元文書は本統合版への集約後に削除済み
 - `docs/QA_bMRZGZOrmkoB5_再現要件.md`
 - `docs/QA_bMRZGZOrmkoB5_Web再現_技術調査.md`
 - `docs/QA_bMRZGZOrmkoB5_Web再現_レベル別パラメータ表.md`
 - `docs/QA_bMRZGZOrmkoB5_Web再現_技術調査レビュー_5agents.md`
