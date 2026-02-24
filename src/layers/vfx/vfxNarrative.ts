import type { AppState } from '../../domain/state';

export type FinalBlendMode = 'overlay' | 'screen';

export interface FinalOverlayVisual {
  opacity: number;
  blendMode: FinalBlendMode;
}

export const GHOST_WORDS_MAP: Record<AppState, string[]> = {
  Intro: [],
  Lv1: [],
  Lv2: ['もっと', '色泥棒'],
  Lv3: ['やめられないだろ?', 'もっと', '呪い'],
  Lv4: ['もう戻れない', '返せ', '色泥棒'],
  Lv5: ['色を返', '呪', '返せ'],
  Lv6: ['色を返せ', '返せ', '呪いレベル'],
  Lv7: ['色泥棒', '返せ', '盗むな', '最悪'],
  Lv8: ['返せ', '呪い', 'FREE?'],
  Lv9: ['THE COLORS FREE', '返せ', '色泥棒', 'FREE'],
  Final: ['THE COLORS FREE', 'FREE', '返せ']
};

export function buildGhostWordCount(ghostIntensity: number): number {
  const baseCount = Math.max(4, Math.round(ghostIntensity * 12));
  return Math.min(16, baseCount);
}

export function getFinalOverlayVisual(state: AppState): FinalOverlayVisual {
  if (state === 'Final') {
    return {
      opacity: 1,
      blendMode: 'screen'
    };
  }

  if (state === 'Lv9') {
    return {
      opacity: 0.5,
      blendMode: 'overlay'
    };
  }

  return {
    opacity: 0,
    blendMode: 'overlay'
  };
}

export function stateIncludesColorsFree(state: AppState): boolean {
  return GHOST_WORDS_MAP[state].some((word) => word.toUpperCase().includes('THE COLORS FREE'));
}
