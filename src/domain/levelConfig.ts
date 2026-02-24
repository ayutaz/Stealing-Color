import type { AppState } from './state';

export type TitleIcon = 'none' | 'palette' | 'devil' | 'skull' | 'eye';
export type ButtonIcon = 'none' | 'eye';
export type ChipToken =
  | 'chip.red'
  | 'chip.charcoal'
  | 'chip.cyan'
  | 'chip.pink'
  | 'chip.yellow'
  | 'chip.gray'
  | 'chip.navy'
  | 'chip.blue'
  | 'chip.deep'
  | 'chip.white';

export interface UiConfig {
  width: number;
  height: number;
  radius: number;
  fill: string;
  border: string;
}

export interface EffectConfig {
  noise: number;
  blurPx: number;
  ghostText: number;
  glitchHz: number;
  tiltDeg: number;
  shakePx: number;
  particleRate: number;
  whiteout: number;
  bloom: number;
  chromaticPx: number;
  vignette: number;
}

export interface LevelConfig {
  state: AppState;
  titleText: string;
  titleIcon: TitleIcon;
  buttonText: string;
  buttonIcon: ButtonIcon;
  chips: ChipToken[];
  curseSkulls: number;
  transitionMs: number;
  clickLockMs: number;
  bgGradient: string;
  ui: UiConfig;
  effects: EffectConfig;
}

export const CHIP_COLORS: Record<ChipToken, string> = {
  'chip.red': '#F65A43',
  'chip.charcoal': '#2B2F36',
  'chip.cyan': '#56ABE8',
  'chip.pink': '#F45D97',
  'chip.yellow': '#F1D46C',
  'chip.gray': '#7B736D',
  'chip.navy': '#1A3C8B',
  'chip.blue': '#253BFF',
  'chip.deep': '#12162D',
  'chip.white': '#F8FAFF'
};

export const CHIP_SEQUENCE: ChipToken[] = [
  'chip.red',
  'chip.charcoal',
  'chip.cyan',
  'chip.pink',
  'chip.yellow',
  'chip.gray',
  'chip.navy',
  'chip.blue',
  'chip.deep',
  'chip.white'
];

const LEVELS: LevelConfig[] = [
  {
    state: 'Intro',
    titleText: '色をピックしてね',
    titleIcon: 'palette',
    buttonText: 'スポイトで色を盗む',
    buttonIcon: 'eye',
    chips: [],
    curseSkulls: 0,
    transitionMs: 260,
    clickLockMs: 140,
    bgGradient: 'linear-gradient(180deg, #090A0D 0%, #090A0D 100%)',
    ui: { width: 330, height: 72, radius: 12, fill: '#1F2127', border: '#4A4D55' },
    effects: {
      noise: 0,
      blurPx: 0,
      ghostText: 0,
      glitchHz: 0,
      tiltDeg: 0,
      shakePx: 0,
      particleRate: 0,
      whiteout: 0,
      bloom: 0.04,
      chromaticPx: 0,
      vignette: 0.1
    }
  },
  {
    state: 'Lv1',
    titleText: '',
    titleIcon: 'none',
    buttonText: 'もっと盗む（呪い Lv.1）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 1),
    curseSkulls: 1,
    transitionMs: 320,
    clickLockMs: 150,
    bgGradient: 'linear-gradient(180deg, #EF5A41 0%, #EF5A41 100%)',
    ui: { width: 420, height: 84, radius: 20, fill: '#2A2E37', border: '#9DC4FF' },
    effects: {
      noise: 0.03,
      blurPx: 0.2,
      ghostText: 0,
      glitchHz: 0,
      tiltDeg: 0,
      shakePx: 0.1,
      particleRate: 2,
      whiteout: 0,
      bloom: 0.08,
      chromaticPx: 0,
      vignette: 0.12
    }
  },
  {
    state: 'Lv2',
    titleText: 'もっと',
    titleIcon: 'devil',
    buttonText: 'もっと盗む（呪い Lv.2）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 2),
    curseSkulls: 2,
    transitionMs: 340,
    clickLockMs: 160,
    bgGradient: 'linear-gradient(90deg, #E45740 0%, #2D3037 58%, #2D3037 100%)',
    ui: { width: 430, height: 88, radius: 22, fill: '#2A2E37', border: '#8AB8FF' },
    effects: {
      noise: 0.08,
      blurPx: 0.8,
      ghostText: 0.14,
      glitchHz: 0.4,
      tiltDeg: 0.3,
      shakePx: 0.4,
      particleRate: 6,
      whiteout: 0,
      bloom: 0.12,
      chromaticPx: 0.2,
      vignette: 0.16
    }
  },
  {
    state: 'Lv3',
    titleText: 'やめられないだろ?',
    titleIcon: 'skull',
    buttonText: 'もっと盗む（呪い Lv.3）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 3),
    curseSkulls: 3,
    transitionMs: 360,
    clickLockMs: 170,
    bgGradient: 'linear-gradient(130deg, #E05A45 0%, #30343B 45%, #53A9E4 100%)',
    ui: { width: 440, height: 92, radius: 22, fill: '#2A2E37', border: '#7FB3FF' },
    effects: {
      noise: 0.12,
      blurPx: 1.4,
      ghostText: 0.24,
      glitchHz: 0.8,
      tiltDeg: 0.6,
      shakePx: 0.7,
      particleRate: 10,
      whiteout: 0,
      bloom: 0.16,
      chromaticPx: 0.4,
      vignette: 0.18
    }
  },
  {
    state: 'Lv4',
    titleText: 'もう戻れない',
    titleIcon: 'eye',
    buttonText: 'もっと盗む（呪い Lv.4）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 4),
    curseSkulls: 4,
    transitionMs: 380,
    clickLockMs: 170,
    bgGradient: 'linear-gradient(180deg, #D65244 0%, #2E3B48 42%, #4EA8E2 70%, #F05D93 100%)',
    ui: { width: 450, height: 96, radius: 22, fill: '#EA5A90', border: '#B5D2FF' },
    effects: {
      noise: 0.18,
      blurPx: 1.9,
      ghostText: 0.38,
      glitchHz: 1.3,
      tiltDeg: 1,
      shakePx: 1.1,
      particleRate: 15,
      whiteout: 0,
      bloom: 0.22,
      chromaticPx: 0.7,
      vignette: 0.22
    }
  },
  {
    state: 'Lv5',
    titleText: '色を返',
    titleIcon: 'none',
    buttonText: 'もっと盗む（呪い Lv.5）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 5),
    curseSkulls: 5,
    transitionMs: 400,
    clickLockMs: 180,
    bgGradient: 'linear-gradient(140deg, #EFD57A 0%, #F36899 44%, #58ACE6 73%, #2B343B 100%)',
    ui: { width: 460, height: 98, radius: 22, fill: '#E9CD6E', border: '#87B5FF' },
    effects: {
      noise: 0.23,
      blurPx: 2.4,
      ghostText: 0.5,
      glitchHz: 1.9,
      tiltDeg: 1.4,
      shakePx: 1.4,
      particleRate: 20,
      whiteout: 0,
      bloom: 0.28,
      chromaticPx: 1,
      vignette: 0.24
    }
  },
  {
    state: 'Lv6',
    titleText: '色を返せ',
    titleIcon: 'none',
    buttonText: 'もっと盗む（呪い Lv.6）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 6),
    curseSkulls: 6,
    transitionMs: 420,
    clickLockMs: 180,
    bgGradient: 'linear-gradient(90deg, #706860 0%, #706860 24%, #E6CD79 44%, #F06495 66%, #6D8CBE 100%)',
    ui: { width: 490, height: 108, radius: 26, fill: '#726A64', border: '#87B5FF' },
    effects: {
      noise: 0.29,
      blurPx: 3,
      ghostText: 0.58,
      glitchHz: 2.4,
      tiltDeg: 1.9,
      shakePx: 1.8,
      particleRate: 26,
      whiteout: 0.02,
      bloom: 0.34,
      chromaticPx: 1.2,
      vignette: 0.3
    }
  },
  {
    state: 'Lv7',
    titleText: '色を返せ',
    titleIcon: 'none',
    buttonText: 'もっと盗む（呪い Lv.7）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 7),
    curseSkulls: 7,
    transitionMs: 450,
    clickLockMs: 190,
    bgGradient: 'linear-gradient(140deg, #21418D 0%, #244A9F 38%, #E3C874 73%, #F28A96 100%)',
    ui: { width: 500, height: 108, radius: 28, fill: '#17439E', border: '#B5D2FF' },
    effects: {
      noise: 0.35,
      blurPx: 3.8,
      ghostText: 0.68,
      glitchHz: 3.2,
      tiltDeg: 2.8,
      shakePx: 2.4,
      particleRate: 34,
      whiteout: 0.05,
      bloom: 0.4,
      chromaticPx: 1.5,
      vignette: 0.36
    }
  },
  {
    state: 'Lv8',
    titleText: '',
    titleIcon: 'none',
    buttonText: 'もっと盗む（呪い Lv.8）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 8),
    curseSkulls: 8,
    transitionMs: 480,
    clickLockMs: 200,
    bgGradient: 'linear-gradient(180deg, #253BFF 0%, #1F36D3 52%, #364786 74%, #E4C870 100%)',
    ui: { width: 520, height: 116, radius: 30, fill: '#223BFF', border: '#C7DBFF' },
    effects: {
      noise: 0.43,
      blurPx: 4.6,
      ghostText: 0.76,
      glitchHz: 4,
      tiltDeg: 3.5,
      shakePx: 3,
      particleRate: 42,
      whiteout: 0.1,
      bloom: 0.46,
      chromaticPx: 1.9,
      vignette: 0.42
    }
  },
  {
    state: 'Lv9',
    titleText: '',
    titleIcon: 'none',
    buttonText: 'もっと盗む（呪い Lv.9）',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 9),
    curseSkulls: 9,
    transitionMs: 500,
    clickLockMs: 220,
    bgGradient: 'linear-gradient(160deg, #1F2FE7 0%, #15258E 46%, #0F1434 100%)',
    ui: { width: 530, height: 120, radius: 32, fill: '#151B3F', border: '#AED0FF' },
    effects: {
      noise: 0.53,
      blurPx: 5.8,
      ghostText: 0.88,
      glitchHz: 5.4,
      tiltDeg: 4.6,
      shakePx: 3.8,
      particleRate: 50,
      whiteout: 0.2,
      bloom: 0.54,
      chromaticPx: 2.3,
      vignette: 0.48
    }
  },
  {
    state: 'Final',
    titleText: 'THE COLORS FREE',
    titleIcon: 'none',
    buttonText: '',
    buttonIcon: 'eye',
    chips: CHIP_SEQUENCE.slice(0, 10),
    curseSkulls: 12,
    transitionMs: 500,
    clickLockMs: 240,
    bgGradient: 'linear-gradient(90deg, #2341F0 0%, #1A30A7 46%, #EDEFF4 68%, #FBFCFF 100%)',
    ui: { width: 540, height: 122, radius: 32, fill: '#F4F6FA', border: '#4B8ED1' },
    effects: {
      noise: 0.46,
      blurPx: 4.9,
      ghostText: 1,
      glitchHz: 6.8,
      tiltDeg: 5.8,
      shakePx: 2.6,
      particleRate: 58,
      whiteout: 1,
      bloom: 0.72,
      chromaticPx: 2.8,
      vignette: 0.28
    }
  }
];

export const LEVEL_CONFIG_MAP: Record<AppState, LevelConfig> = LEVELS.reduce(
  (acc, level) => {
    acc[level.state] = level;
    return acc;
  },
  {} as Record<AppState, LevelConfig>
);
