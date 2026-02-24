# Stealing-Color

`Stealing-Color` は、`QA_bMRZGZOrmkoB5.mp4` の演出をブラウザ上で再現するインタラクティブ作品です。  
ユーザーが「色を盗む」操作を 1 回行うごとに状態が 1 段階進み、背景色・グリッチ/ノイズ・テキスト・UI が徐々に崩壊していき、最終的に白飛びと文字崩壊へ到達する体験を実装します。

## 現在の状況
- リポジトリ初期化済み
- 統合実装仕様の作成済み
- P0 セットアップ実装済み（Vite + TypeScript + CI + スケルトンレイヤ）
- P1 Core Loop 実装済み（FSM/クリックロック/UI同期/Final文言消失）
- P2 Visual Build 実装済み（VFXパラメータ適用/背景語彙レイヤー/品質ラダー）
- P3 Input/Compat 実装済み（EyeDropper + Canvas + `input[type=color]` フォールバック、iOS/Safari軽量化）
- P4 QA Hardening 実装済み（Playwright静止比較/E2E動的5本/性能計測/a11y対応）
- `npm audit` 対応済み（脆弱性 0 件）
- ベースラインチェック通過（`lint`, `test`, `build`, `test:e2e`）
- P1受け入れテスト通過（1クリック1遷移、連打スキップ防止、Final固定、チップ数一致）
- Q3-Q0品質ラダーのUnit Test実装済み
- フォールバックパイプラインと互換判定（P3）のUnit Test実装済み
- P4のE2E基準画像（Lv1-Lv9-Final）実装済み

## 仕様
実装の正本（Single Source of Truth）は次のファイルです。
- `docs/QA_bMRZGZOrmkoB5_Web再現_統合仕様.md`

実装ロードマップとタスク一覧は次のファイルです。
- `docs/QA_bMRZGZOrmkoB5_実装ロードマップ_タスク一覧.md`

## 目標
クリックごとに呪いレベルが上がり、ビジュアル/UI が段階的に崩壊していくインタラクションループを再現します。
- 色の推移
- グリッチ/ノイズの増幅
- カラーチップの増加
- 最終段階の白飛びとテキスト崩壊

## 採用技術
- UI: DOM
- VFX: PixiJS
- 状態管理: データ駆動 FSM（`LevelConfig`）
- QA: Playwright によるビジュアルテスト + 状態遷移テスト

## リポジトリ構成
```text
.
|-- AGENT.md
|-- README.md
|-- package.json
|-- tsconfig.json
|-- vite.config.ts
|-- playwright.config.ts
|-- eslint.config.mjs
|-- .github/workflows/ci.yml
|-- scripts/
|   `-- measure-performance.mjs
|-- docs/
|   `-- QA_bMRZGZOrmkoB5_Web再現_統合仕様.md
|   `-- QA_bMRZGZOrmkoB5_実装ロードマップ_タスク一覧.md
|-- src/
|   |-- app/
|   |-- color/
|   |-- core/
|   |-- domain/
|   |-- layers/
|   `-- styles/
|-- tests/
|   `-- e2e/
`-- .gitignore
```

## 次のステップ
1. P5として、既知課題の修正と微調整を進める
2. P5として、RC判定基準に沿った最終レビューを実施する
3. P5として、リリース候補の確定と運用手順を整理する
