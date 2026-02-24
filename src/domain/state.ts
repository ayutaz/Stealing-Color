export const STATE_SEQUENCE = [
  'Intro',
  'Lv1',
  'Lv2',
  'Lv3',
  'Lv4',
  'Lv5',
  'Lv6',
  'Lv7',
  'Lv8',
  'Lv9',
  'Final'
] as const;

export type AppState = (typeof STATE_SEQUENCE)[number];
