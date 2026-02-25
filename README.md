# Stealing-Color

`QA_bMRZGZOrmkoB5.mp4` をWeb上で再現するインタラクティブ作品です。  
クリックごとに `Intro -> Lv1 -> ... -> Lv9 -> Final` と進行し、背景/VFX/UI/テキストが段階的に崩壊します。

- Demo: https://ayutaz.github.io/Stealing-Color/

## 概要
- 1クリックで1状態だけ進行（スキップなし）
- Finalで白化・文字崩壊・ボタン文言消失
- 色取得は `EyeDropper -> Canvas -> input[type=color]` の3段フォールバック
- UIはDOM、VFXはPixiJS、状態管理はデータ駆動FSM（`LevelConfig`）

## セットアップ
前提:
- Node.js 22

```bash
npm ci
npm run dev
```

ローカルURL:
- `http://localhost:5173`

## 主要コマンド
- `npm run build`: 型チェック + 本番ビルド
- `npm run lint`: ESLint
- `npm run test`: Unit Test（Vitest）
- `npm run test:e2e`: E2E（Playwright）
- `npm run perf:measure`: FPS計測レポート生成
- `npm run rc:check`: リリース前チェック一括実行

## ランタイムフラグ
- `sc_test=1`: テスト向け deterministic mode
- `sc_no_eyedropper=1`: EyeDropper無効化
- `sc_lite_vfx=1`: 軽量VFXモード強制
- `sc_reduced_motion=1`: reduced motion 強制
- `sc_high_contrast=1`: high contrast 強制

例:
- `http://localhost:5173/?sc_test=1&sc_lite_vfx=1&sc_no_eyedropper=1`

## ドキュメント
- 仕様正本: `docs/QA_bMRZGZOrmkoB5_Web再現_統合仕様.md`
- 実装ロードマップ: `docs/QA_bMRZGZOrmkoB5_実装ロードマップ_タスク一覧.md`
- 既知課題台帳: `docs/known-issues.json`

## License
[Apache License 2.0](./LICENSE)  
Copyright 2026 ayutaz
