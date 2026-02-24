import { describe, expect, test } from 'vitest';

import { detectDeviceProfile } from './deviceProfile';

describe('detectDeviceProfile', () => {
  test('detects iOS Safari as lite mode', () => {
    const profile = detectDeviceProfile(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    );

    expect(profile.isIOS).toBe(true);
    expect(profile.isSafari).toBe(true);
    expect(profile.liteVfxMode).toBe(true);
  });

  test('detects desktop Safari as lite mode', () => {
    const profile = detectDeviceProfile(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    );

    expect(profile.isIOS).toBe(false);
    expect(profile.isSafari).toBe(true);
    expect(profile.liteVfxMode).toBe(true);
  });

  test('does not mark Chromium browsers as lite mode', () => {
    const profile = detectDeviceProfile(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    );

    expect(profile.isIOS).toBe(false);
    expect(profile.isSafari).toBe(false);
    expect(profile.liteVfxMode).toBe(false);
  });
});
