import type { Page } from '@playwright/test';

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

interface RuntimeSnapshot {
  state: string;
  stateIndex: number;
  chipCount: number;
  lastPickSource: string | null;
  qualityTier: string;
  actionInFlight: boolean;
}

export async function gotoApp(page: Page, query = 'sc_test=1'): Promise<void> {
  const suffix = query.trim().length > 0 ? `?${query}` : '';
  await page.goto(`/${suffix}`);
  await page.waitForSelector('[data-testid="scene"][data-state]');
}

export async function readSnapshot(page: Page): Promise<RuntimeSnapshot> {
  const snapshot = await page.evaluate(() => window.__STEALING_COLOR__?.getSnapshot() ?? null);
  if (!snapshot) {
    throw new Error('Runtime snapshot bridge is unavailable');
  }

  return snapshot;
}

export async function readStateIndex(page: Page): Promise<number> {
  const snapshot = await readSnapshot(page);
  return snapshot.stateIndex;
}

export async function clickPrimaryAndWaitForAdvance(page: Page): Promise<void> {
  const before = await readStateIndex(page);
  const button = page.getByTestId('ui-primary');
  await button.click();
  await page.waitForFunction(
    (targetIndex) => {
      const scene = document.querySelector<HTMLElement>('[data-testid="scene"]');
      return scene?.dataset.stateIndex === String(targetIndex) && scene?.dataset.actionInFlight === '0';
    },
    before + 1
  );
}

export async function advanceToState(page: Page, targetState: (typeof STATE_SEQUENCE)[number]): Promise<void> {
  const targetIndex = STATE_SEQUENCE.indexOf(targetState);
  if (targetIndex < 0) {
    throw new Error(`Unknown state: ${targetState}`);
  }

  while ((await readStateIndex(page)) < targetIndex) {
    await clickPrimaryAndWaitForAdvance(page);
  }
}
