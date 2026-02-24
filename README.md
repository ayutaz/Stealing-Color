# Stealing-Color

`Stealing-Color` は、`QA_bMRZGZOrmkoB5.mp4` の演出をブラウザ上で再現するインタラクティブ作品です。  
ユーザーが「色を盗む」操作を 1 回行うごとに状態が 1 段階進み、背景色・グリッチ/ノイズ・テキスト・UI が徐々に崩壊していき、最終的に白飛びと文字崩壊へ到達する体験を実装します。

## 現在の状況
- リポジトリ初期化済み
- 統合実装仕様の作成済み
- P0 セットアップ実装済み（Vite + TypeScript + CI + スケルトンレイヤ）
- `npm audit` 対応済み（脆弱性 0 件）
- ベースラインチェック通過（`lint`, `test`, `build`）

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

## 採用技術（予定）
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
|-- eslint.config.mjs
|-- .github/workflows/ci.yml
|-- docs/
|   `-- QA_bMRZGZOrmkoB5_Web再現_統合仕様.md
|   `-- QA_bMRZGZOrmkoB5_実装ロードマップ_タスク一覧.md
|-- src/
|   |-- app/
|   |-- core/
|   |-- domain/
|   |-- layers/
|   `-- styles/
`-- .gitignore
```

## 次のステップ
1. レベル別の表現精度をスケルトン実装から完全再現に引き上げる
2. EyeDropper + フォールバックパイプラインを実装する
3. 統合仕様 8.2 に記載の動的 QA テストを追加する
4. パフォーマンス品質段階（Q3-Q0）とクロスブラウザ挙動を調整する
