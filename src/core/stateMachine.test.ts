import { describe, expect, test } from 'vitest';

import { StateMachine } from './stateMachine';

describe('StateMachine', () => {
  test('advances one state per call', () => {
    const fsm = new StateMachine();

    expect(fsm.currentState).toBe('Intro');
    fsm.advance();
    expect(fsm.currentState).toBe('Lv1');
    fsm.advance();
    expect(fsm.currentState).toBe('Lv2');
  });

  test('does not advance past Final', () => {
    const fsm = new StateMachine();

    for (let i = 0; i < 30; i += 1) {
      fsm.advance();
    }

    expect(fsm.currentState).toBe('Final');
    const before = fsm.currentState;
    fsm.advance();
    expect(fsm.currentState).toBe(before);
  });
});
