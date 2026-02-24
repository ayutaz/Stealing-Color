import { expect, test } from '@playwright/test';

import {
  advanceToState,
  clickPrimaryAndWaitForAdvance,
  gotoApp,
  readSnapshot,
  readStateIndex,
  STATE_SEQUENCE
} from './helpers';

test.describe('P4 dynamic flow', () => {
  test('Q01: single click advances exactly one state', async ({ page }) => {
    await gotoApp(page);

    const before = await readSnapshot(page);
    await clickPrimaryAndWaitForAdvance(page);
    const after = await readSnapshot(page);

    expect(before.state).toBe('Intro');
    expect(after.state).toBe('Lv1');
    expect(after.stateIndex - before.stateIndex).toBe(1);
  });

  test('Q02: rapid repeated clicks do not skip states', async ({ page }) => {
    await gotoApp(page);

    for (let loop = 0; loop < 6; loop += 1) {
      await page.waitForTimeout(260);
      const before = await readStateIndex(page);
      await dispatchRapidPrimaryPointerBurst(page, 3);

      await expect
        .poll(async () => {
          return await readStateIndex(page);
        })
        .toBe(before + 1);
    }
  });

  test('Q03: Final state remains terminal', async ({ page }) => {
    await gotoApp(page);
    await advanceToState(page, 'Final');

    await dispatchRapidPrimaryPointerBurst(page, 3);
    await page.waitForTimeout(80);

    const snapshot = await readSnapshot(page);
    expect(snapshot.state).toBe('Final');
    expect(snapshot.stateIndex).toBe(STATE_SEQUENCE.indexOf('Final'));
  });

  test('Q04: chip count matches state index progression', async ({ page }) => {
    await gotoApp(page);

    for (let expectedIndex = 0; expectedIndex < STATE_SEQUENCE.length; expectedIndex += 1) {
      const chipCount = await page.getByTestId('ui-chip').count();
      expect(chipCount).toBe(expectedIndex);

      if (expectedIndex < STATE_SEQUENCE.length - 1) {
        await clickPrimaryAndWaitForAdvance(page);
      }
    }
  });

  test('Q05: fallback mode keeps equivalence without EyeDropper', async ({ page }) => {
    await gotoApp(page, 'sc_test=1&sc_no_eyedropper=1');

    await clickPrimaryAndWaitForAdvance(page);
    await clickPrimaryAndWaitForAdvance(page);
    await clickPrimaryAndWaitForAdvance(page);

    const snapshot = await readSnapshot(page);
    expect(snapshot.state).toBe('Lv3');
    expect(snapshot.stateIndex).toBe(3);
    expect(snapshot.chipCount).toBe(3);
    expect(snapshot.lastPickSource).not.toBe('eye-dropper');
    expect(['canvas', 'input-color']).toContain(snapshot.lastPickSource);

    await expect(page.getByTestId('ui-panel')).toBeVisible();
    await expect(page.getByTestId('ui-primary')).toBeVisible();
    await expect(page.getByTestId('ui-chips')).toBeVisible();
  });
});

async function dispatchRapidPrimaryPointerBurst(page: import('@playwright/test').Page, count: number): Promise<void> {
  await page.evaluate((burstCount) => {
    const button = document.querySelector<HTMLButtonElement>('[data-testid="ui-primary"]');
    if (!button) {
      throw new Error('Primary button not found');
    }

    for (let index = 0; index < burstCount; index += 1) {
      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        isPrimary: true,
        button: 0,
        clientX: 460,
        clientY: 360
      });
      button.dispatchEvent(event);
    }
  }, count);
}
