export interface DeviceProfile {
  isIOS: boolean;
  isSafari: boolean;
  liteVfxMode: boolean;
}

export function detectDeviceProfile(userAgent?: string): DeviceProfile {
  const ua = (userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase();

  const isIOS =
    ua.includes('iphone') ||
    ua.includes('ipad') ||
    ua.includes('ipod') ||
    (ua.includes('macintosh') && ua.includes('mobile'));
  const isSafari =
    ua.includes('safari') &&
    !ua.includes('chrome') &&
    !ua.includes('chromium') &&
    !ua.includes('crios') &&
    !ua.includes('edg') &&
    !ua.includes('firefox') &&
    !ua.includes('fxios') &&
    !ua.includes('opr');

  return {
    isIOS,
    isSafari,
    liteVfxMode: isIOS || isSafari
  };
}
