# AGENT.md

## 目的
このリポジトリは、`QA_bMRZGZOrmkoB5.mp4` のインタラクションを Web 体験として再現します。

## 正本ドキュメント
実装の単一参照先（Single Source of Truth）は次のドキュメントです。
- `docs/QA_bMRZGZOrmkoB5_Web再現_統合仕様.md`

明示的な指示がない限り、分割仕様を再導入しないでください。

## 現在の実装ステータス（2026-02-24）
1. P0 は完了。
2. P1 Core Loop は完了。
- 逐次状態遷移（Intro -> Final）
- `clickLockMs` による連打ガード
- Finalでのボタン文言消失
3. P2 Visual Build は完了。
- レベル別 `effects` 固定値のVFX反映（noise/blur/glitch/whiteout 等）
- 背景語彙レイヤーと `THE COLORS FREE` レイヤー実装
- Q3-Q0 品質ラダーによる自動降格
4. P3 Input/Compat は完了。
- 色取得3段フォールバック（EyeDropper -> Canvas sampling -> `input[type=color]`）
- 取得色のチップ反映（クリック座標を使ったサンプリング）
- iOS/Safari向け `liteVfxMode`（VFX強度・アニメーション負荷を軽減）
- `colorPickPipeline` / `deviceProfile` のUnit Test実装
5. P4 QA Hardening は完了。
- Playwright静止比較（Lv1-Lv9-Final）
- E2E動的テスト5本（Q01-Q05）
- パフォーマンス計測スクリプト（`npm run perf:measure`）
- a11y対応（`prefers-reduced-motion` / `prefers-contrast`）
6. 未完了は P5（RC判定、自動化最終調整）。

## プロダクト上の必須ルール
1. 状態遷移フローは次を厳守すること。
`Intro -> Lv1 -> Lv2 -> Lv3 -> Lv4 -> Lv5 -> Lv6 -> Lv7 -> Lv8 -> Lv9 -> Final`
2. 1 クリックで必ず 1 状態のみ進むこと。
3. Final 状態では次を維持すること。
- 白飛びピーク
- テキスト崩壊
- ボタンテキストの消失
4. チップ順序は次で固定すること。
`red -> charcoal -> cyan -> pink -> yellow -> gray -> navy -> blue -> deep -> white`

## 技術ガードレール
1. アーキテクチャは仕様に合わせること。
- VFX は PixiJS を使用する
- 中央 UI は DOM で実装する
- 状態管理は `LevelConfig` によるデータ駆動 FSM とする
2. 全状態で `transitionMs` は `<= 500` を維持すること。
3. EyeDropper のフォールバック連鎖は維持すること。
- EyeDropper
- canvas pixel sampling
- `input[type=color]`
4. フォールバック時も `1 action = 1 state advance` を満たすこと。

## QA ガードレール
必要な最低テストカバレッジ:
1. クリックごとの状態進行
2. 連打時にスキップしないこと
3. Final 状態が終端であること
4. チップ数が状態と一致すること
5. フォールバック時の等価性

現状:
- 1-5 は Unit Test で実装済み
- 1-5 は E2E（Playwright）でも実装済み

## リポジトリ運用ルール
1. 実装変更前:
- `docs/QA_bMRZGZOrmkoB5_Web再現_統合仕様.md` を読む
2. 振る舞い変更時:
- 同一変更セットで統合仕様を更新する
3. コミット粒度は小さく追跡可能に保つ:
- 仕様変更とコード変更を対応づける
