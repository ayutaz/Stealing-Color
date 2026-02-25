import { expect, test } from '@playwright/test';

import { advanceToState, gotoApp } from './helpers';

const VISUAL_STATES = ['Lv1', 'Lv2', 'Lv3', 'Lv4', 'Lv5', 'Lv6', 'Lv7', 'Lv8', 'Lv9', 'Final'] as const;

test.describe('P4 visual regression', () => {
  test('captures Lv1-Lv9-Final snapshots', async ({ page }) => {
    await gotoApp(page, 'sc_test=1&sc_reduced_motion=1&sc_lite_vfx=1&sc_no_eyedropper=1');
    const scene = page.getByTestId('scene');

    for (const state of VISUAL_STATES) {
      await advanceToState(page, state);
      await expect(scene).toHaveScreenshot(`state-${state.toLowerCase()}.png`, {
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
        maxDiffPixels: state === 'Lv1' ? 9000 : 0,
        timeout: 15_000
      });
    }
  });
});
