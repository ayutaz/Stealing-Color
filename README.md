# Stealing-Color

Web reproduction project for `QA_bMRZGZOrmkoB5.mp4`.

## Current status
- Repository initialized
- Unified implementation spec prepared
- P0 setup implemented (Vite + TypeScript + CI + skeleton layers)

## Spec
Use this file as the single source of truth:
- `docs/QA_bMRZGZOrmkoB5_Web再現_統合仕様.md`

Implementation roadmap and task list:
- `docs/QA_bMRZGZOrmkoB5_実装ロードマップ_タスク一覧.md`

## Goal
Recreate the interactive loop where each click increases curse level and progressively degrades visuals/UI:
- color progression
- glitch/noise escalation
- chip collection growth
- final whiteout and text collapse

## Planned stack
- UI: DOM
- VFX: PixiJS
- State management: data-driven FSM (`LevelConfig`)
- QA: Playwright visual + state transition tests

## Repository structure
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

## Next steps
1. Expand Level-by-Level visual fidelity from skeleton to full match.
2. Implement EyeDropper + fallback pipeline.
3. Add dynamic QA tests listed in unified spec section 8.2.
4. Tune performance ladder (Q3-Q0) and cross-browser behavior.
