# Stealing-Color

Web reproduction project for `QA_bMRZGZOrmkoB5.mp4`.

## Current status
- Repository initialized
- Unified implementation spec prepared
- Implementation not started yet

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
|-- docs/
|   `-- QA_bMRZGZOrmkoB5_Web再現_統合仕様.md
|   `-- QA_bMRZGZOrmkoB5_実装ロードマップ_タスク一覧.md
`-- .gitignore
```

## Next steps
1. Bootstrap web app project (Vite + TypeScript).
2. Implement `LevelConfig` and strict state machine.
3. Build UI layer and VFX layer separately.
4. Add required dynamic tests and screenshot tests.
