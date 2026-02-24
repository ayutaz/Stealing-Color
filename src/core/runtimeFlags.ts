export interface RuntimeFlags {
  deterministicMode: boolean;
  disableEyeDropper: boolean;
  forceLiteVfx: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface RuntimeFlagInput {
  search?: string;
  reducedMotionMediaMatch?: boolean;
  highContrastMediaMatch?: boolean;
}

const ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function detectRuntimeFlags(input: RuntimeFlagInput = {}): RuntimeFlags {
  const search = input.search ?? (typeof window !== 'undefined' ? window.location.search : '');
  const params = new URLSearchParams(search);

  const queryReducedMotion = isEnabled(params.get('sc_reduced_motion'));
  const queryHighContrast = isEnabled(params.get('sc_high_contrast'));

  const reducedMotionMediaMatch =
    input.reducedMotionMediaMatch ?? matchMediaQuery('(prefers-reduced-motion: reduce)');
  const highContrastMediaMatch =
    input.highContrastMediaMatch ?? matchMediaQuery('(prefers-contrast: more)');

  return {
    deterministicMode: isEnabled(params.get('sc_test')),
    disableEyeDropper: isEnabled(params.get('sc_no_eyedropper')),
    forceLiteVfx: isEnabled(params.get('sc_lite_vfx')),
    reducedMotion: queryReducedMotion || reducedMotionMediaMatch,
    highContrast: queryHighContrast || highContrastMediaMatch
  };
}

function matchMediaQuery(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(query).matches;
}

function isEnabled(value: string | null): boolean {
  if (!value) {
    return false;
  }

  return ENABLED_VALUES.has(value.toLowerCase());
}
