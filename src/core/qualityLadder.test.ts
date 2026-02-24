import { describe, expect, test } from 'vitest';

import { applyQualityTier, QualityLadder } from './qualityLadder';

describe('QualityLadder', () => {
  test('drops to Q2 when average fps is in 45-55 range', () => {
    const ladder = new QualityLadder({
      initialFps: 50,
      sampleIntervalMs: 1
    });

    const snapshot = ladder.update(20);

    expect(snapshot.tier).toBe('Q2');
    expect(snapshot.averageFps).toBeGreaterThanOrEqual(45);
  });

  test('drops to Q0 under 30 fps', () => {
    const ladder = new QualityLadder({
      initialFps: 20,
      sampleIntervalMs: 1
    });

    const snapshot = ladder.update(40);

    expect(snapshot.tier).toBe('Q0');
  });

  test('treats 55 fps as Q3 boundary', () => {
    const ladder = new QualityLadder({
      initialFps: 55,
      sampleIntervalMs: 1
    });

    const snapshot = ladder.update(1000 / 55);

    expect(snapshot.tier).toBe('Q3');
  });
});

describe('applyQualityTier', () => {
  test('scales particle/blur/glitch for Q1', () => {
    const effects = {
      noise: 0.4,
      blurPx: 5,
      ghostText: 0.8,
      glitchHz: 5,
      tiltDeg: 3,
      shakePx: 2,
      particleRate: 50,
      whiteout: 0.6,
      bloom: 0.5,
      chromaticPx: 1.5,
      vignette: 0.3
    };

    const scaled = applyQualityTier(effects, 'Q1');

    expect(scaled.particleRate).toBe(25);
    expect(scaled.blurPx).toBe(3);
    expect(scaled.glitchHz).toBe(3.5);
    expect(scaled.noise).toBe(0.4);
    expect(scaled.whiteout).toBe(0.6);
  });
});
