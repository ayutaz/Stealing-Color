import { describe, expect, test } from 'vitest';

import { LEVEL_CONFIG_MAP } from '../../domain/levelConfig';
import {
  buildGhostWordCount,
  getFinalOverlayVisual,
  GHOST_WORDS_MAP,
  stateIncludesColorsFree
} from './vfxNarrative';

describe('vfxNarrative', () => {
  test('activates THE COLORS FREE layer at Lv9 and Final', () => {
    expect(stateIncludesColorsFree('Intro')).toBe(false);
    expect(stateIncludesColorsFree('Lv8')).toBe(false);
    expect(stateIncludesColorsFree('Lv9')).toBe(true);
    expect(stateIncludesColorsFree('Final')).toBe(true);
  });

  test('final overlay visual is stage-specific', () => {
    expect(getFinalOverlayVisual('Lv8')).toEqual({
      opacity: 0,
      blendMode: 'overlay'
    });
    expect(getFinalOverlayVisual('Lv9')).toEqual({
      opacity: 0.5,
      blendMode: 'overlay'
    });
    expect(getFinalOverlayVisual('Final')).toEqual({
      opacity: 1,
      blendMode: 'screen'
    });
  });

  test('ghost vocabulary differs across phases', () => {
    expect(GHOST_WORDS_MAP.Intro).toHaveLength(0);
    expect(GHOST_WORDS_MAP.Lv3).not.toEqual(GHOST_WORDS_MAP.Lv5);
    expect(GHOST_WORDS_MAP.Lv5).not.toEqual(GHOST_WORDS_MAP.Lv9);
  });

  test('ghost word count follows intensity ladder', () => {
    expect(buildGhostWordCount(0.14)).toBeGreaterThanOrEqual(4);
    expect(buildGhostWordCount(0.5)).toBe(6);
    expect(buildGhostWordCount(1)).toBe(12);
  });

  test('whiteout reaches peak at Final', () => {
    const lv8 = LEVEL_CONFIG_MAP.Lv8.effects.whiteout;
    const lv9 = LEVEL_CONFIG_MAP.Lv9.effects.whiteout;
    const final = LEVEL_CONFIG_MAP.Final.effects.whiteout;

    expect(lv9).toBeGreaterThan(lv8);
    expect(final).toBeGreaterThan(lv9);
    expect(final).toBe(1);
  });
});
