# AGENT.md

## Purpose
This repository reproduces the interaction in `QA_bMRZGZOrmkoB5.mp4` as a web experience.

## Source of truth
Use this document as the single implementation reference:
- `docs/QA_bMRZGZOrmkoB5_Web再現_統合仕様.md`

Do not reintroduce split specs unless explicitly requested.

## Non-negotiable product rules
1. State flow must be strictly:
`Intro -> Lv1 -> Lv2 -> Lv3 -> Lv4 -> Lv5 -> Lv6 -> Lv7 -> Lv8 -> Lv9 -> Final`
2. Exactly one click advances exactly one state.
3. Final state must keep:
- whiteout peak
- text collapse
- button text removed
4. Chip order must stay fixed:
`red -> charcoal -> cyan -> pink -> yellow -> gray -> navy -> blue -> deep -> white`

## Technical guardrails
1. Keep architecture aligned with spec:
- PixiJS for VFX
- DOM for central UI
- data-driven FSM via `LevelConfig`
2. `transitionMs` must remain `<= 500` for all states.
3. EyeDropper fallback chain must be preserved:
- EyeDropper
- canvas pixel sampling
- `input[type=color]`
4. Fallback behavior must still satisfy `1 action = 1 state advance`.

## QA guardrails
Required test coverage (minimum):
1. state progression per click
2. no skip under rapid click
3. final state is terminal
4. chip count matches state
5. fallback equivalence

## Repo workflow
1. Before implementation changes:
- read `docs/QA_bMRZGZOrmkoB5_Web再現_統合仕様.md`
2. If behavior changes:
- update the unified spec in the same change set
3. Keep commit scope small and traceable:
- spec change and code change should be linked

