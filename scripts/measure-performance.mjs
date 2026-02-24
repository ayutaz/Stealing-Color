import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { stdout } from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

import { chromium } from '@playwright/test';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const OUTPUT_DIR = 'artifacts';

const STATE_SEQUENCE = ['Intro', 'Lv1', 'Lv2', 'Lv3', 'Lv4', 'Lv5', 'Lv6', 'Lv7', 'Lv8', 'Lv9', 'Final'];
const CHECKPOINTS = ['Intro', 'Lv3', 'Lv6', 'Lv9', 'Final'];

async function main() {
  const server = spawn('npm', ['run', 'dev', '--', '--host', HOST, '--port', `${PORT}`, '--strictPort'], {
    shell: true,
    stdio: 'ignore'
  });

  try {
    await waitForServer(BASE_URL, 20_000);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 920, height: 720 } });
      await page.goto(`${BASE_URL}/?sc_no_eyedropper=1`);
      await page.waitForSelector('[data-testid="scene"][data-state]');

      const rows = [];
      for (const state of CHECKPOINTS) {
        await advanceToState(page, state);
        await delay(250);
        const fps = await sampleFps(page, 1_600);
        const qualityTier = await page.getAttribute('[data-testid="vfx-layer"]', 'data-quality-tier');
        rows.push({
          state,
          fps: Number(fps.toFixed(2)),
          qualityTier: qualityTier ?? 'unknown'
        });
      }

      emitReports(rows);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill();
  }
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await globalThis.fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting until timeout.
    }

    await delay(250);
  }

  throw new Error(`Server did not become ready within ${timeoutMs}ms: ${url}`);
}

async function sampleFps(page, durationMs) {
  return await page.evaluate(async (sampleDurationMs) => {
    return await new Promise((resolve) => {
      let frameCount = 0;
      let startedAt = 0;

      const step = (timestamp) => {
        if (startedAt === 0) {
          startedAt = timestamp;
        }

        frameCount += 1;
        const elapsed = timestamp - startedAt;
        if (elapsed >= sampleDurationMs) {
          resolve((frameCount * 1000) / Math.max(1, elapsed));
          return;
        }

        globalThis.requestAnimationFrame(step);
      };

      globalThis.requestAnimationFrame(step);
    });
  }, durationMs);
}

async function advanceToState(page, targetState) {
  const targetIndex = STATE_SEQUENCE.indexOf(targetState);
  if (targetIndex < 0) {
    throw new Error(`Unknown target state: ${targetState}`);
  }

  while (true) {
    const before = await readStateIndex(page);
    if (before >= targetIndex) {
      break;
    }

    await page.getByTestId('ui-primary').click();
    await page.waitForFunction(
      (index) => {
        const scene = globalThis.document.querySelector('[data-testid="scene"]');
        return scene?.dataset.stateIndex === String(index);
      },
      before + 1
    );
  }
}

async function readStateIndex(page) {
  return await page.evaluate(() => {
    const scene = globalThis.document.querySelector('[data-testid="scene"]');
    return Number(scene?.dataset.stateIndex ?? 0);
  });
}

function emitReports(rows) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    checkpoints: rows
  };

  const markdownLines = [
    '# Performance Report',
    '',
    '| State | FPS | Quality Tier |',
    '|---|---:|---|',
    ...rows.map((row) => `| ${row.state} | ${row.fps.toFixed(2)} | ${row.qualityTier} |`)
  ];

  writeFileSync(`${OUTPUT_DIR}/perf-report.json`, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(`${OUTPUT_DIR}/perf-report.md`, `${markdownLines.join('\n')}\n`);
  stdout.write(`${markdownLines.join('\n')}\n`);
}

void main();
