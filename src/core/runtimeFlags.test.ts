import { describe, expect, test } from 'vitest';

import { detectRuntimeFlags } from './runtimeFlags';

describe('detectRuntimeFlags', () => {
  test('reads query flags', () => {
    const flags = detectRuntimeFlags({
      search: '?sc_test=1&sc_no_eyedropper=true&sc_lite_vfx=yes&sc_reduced_motion=on&sc_high_contrast=1',
      reducedMotionMediaMatch: false,
      highContrastMediaMatch: false
    });

    expect(flags.deterministicMode).toBe(true);
    expect(flags.disableEyeDropper).toBe(true);
    expect(flags.forceLiteVfx).toBe(true);
    expect(flags.reducedMotion).toBe(true);
    expect(flags.highContrast).toBe(true);
  });

  test('uses media query fallback when query is absent', () => {
    const flags = detectRuntimeFlags({
      search: '',
      reducedMotionMediaMatch: true,
      highContrastMediaMatch: true
    });

    expect(flags.reducedMotion).toBe(true);
    expect(flags.highContrast).toBe(true);
    expect(flags.deterministicMode).toBe(false);
    expect(flags.disableEyeDropper).toBe(false);
  });
});
