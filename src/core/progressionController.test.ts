import { describe, expect, test } from 'vitest';

import { STATE_SEQUENCE } from '../domain/state';
import { ProgressionController } from './progressionController';

describe('ProgressionController', () => {
  test('advances once and blocks input until clickLockMs passes', () => {
    let now = 0;
    const controller = new ProgressionController({
      now: () => now
    });

    expect(controller.currentState).toBe('Intro');
    expect(controller.tryAdvance()).toBe(true);
    expect(controller.currentState).toBe('Lv1');

    now = 100;
    expect(controller.tryAdvance()).toBe(false);
    expect(controller.currentState).toBe('Lv1');

    now = 140;
    expect(controller.tryAdvance()).toBe(true);
    expect(controller.currentState).toBe('Lv2');
  });

  test('rapid attempts do not skip states', () => {
    let now = 0;
    const controller = new ProgressionController({
      now: () => now
    });
    const visitedStates = [controller.currentState];

    for (let i = 0; i < 200; i += 1) {
      if (controller.tryAdvance()) {
        visitedStates.push(controller.currentState);
      }

      now += 50;
    }

    expect(visitedStates).toEqual(STATE_SEQUENCE);
  });

  test('stays at Final after reaching terminal state', () => {
    let now = 0;
    const controller = new ProgressionController({
      now: () => now
    });

    for (let i = 0; i < STATE_SEQUENCE.length; i += 1) {
      controller.tryAdvance();
      now += 1000;
    }

    expect(controller.currentState).toBe('Final');
    expect(controller.tryAdvance()).toBe(false);
    expect(controller.currentState).toBe('Final');
  });

  test('chip count follows state progression', () => {
    let now = 0;
    const controller = new ProgressionController({
      now: () => now
    });

    expect(controller.currentConfig.chips).toHaveLength(0);

    for (let expectedChipCount = 1; expectedChipCount <= 10; expectedChipCount += 1) {
      controller.tryAdvance();
      now += 1000;
      expect(controller.currentConfig.chips).toHaveLength(expectedChipCount);
    }
  });
});
