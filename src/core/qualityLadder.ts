import type { EffectConfig } from '../domain/levelConfig';

export type QualityTier = 'Q3' | 'Q2' | 'Q1' | 'Q0';

interface EffectMultiplier {
  particleRate: number;
  blurPx: number;
  glitchHz: number;
  ghostText: number;
  noise: number;
}

const TIER_MULTIPLIERS: Record<QualityTier, EffectMultiplier> = {
  Q3: {
    particleRate: 1,
    blurPx: 1,
    glitchHz: 1,
    ghostText: 1,
    noise: 1
  },
  Q2: {
    particleRate: 0.75,
    blurPx: 0.8,
    glitchHz: 1,
    ghostText: 1,
    noise: 1
  },
  Q1: {
    particleRate: 0.5,
    blurPx: 0.6,
    glitchHz: 0.7,
    ghostText: 1,
    noise: 1
  },
  Q0: {
    particleRate: 0,
    blurPx: 0.5,
    glitchHz: 0.5,
    ghostText: 0.5,
    noise: 0.6
  }
};

export interface QualityLadderOptions {
  initialFps?: number;
  sampleIntervalMs?: number;
}

export interface LadderSnapshot {
  tier: QualityTier;
  averageFps: number;
}

export class QualityLadder {
  private tier: QualityTier = 'Q3';
  private averageFps: number;
  private elapsedMs = 0;
  private readonly sampleIntervalMs: number;

  public constructor(options: QualityLadderOptions = {}) {
    this.averageFps = options.initialFps ?? 60;
    this.sampleIntervalMs = options.sampleIntervalMs ?? 250;
    this.tier = this.pickTier(this.averageFps);
  }

  public update(deltaMs: number): LadderSnapshot {
    if (deltaMs <= 0) {
      return this.snapshot();
    }

    const instantFps = 1000 / deltaMs;
    this.averageFps = this.averageFps * 0.9 + instantFps * 0.1;
    this.elapsedMs += deltaMs;

    if (this.elapsedMs >= this.sampleIntervalMs) {
      this.elapsedMs = 0;
      this.tier = this.pickTier(this.averageFps);
    }

    return this.snapshot();
  }

  public get currentTier(): QualityTier {
    return this.tier;
  }

  private snapshot(): LadderSnapshot {
    return {
      tier: this.tier,
      averageFps: this.averageFps
    };
  }

  private pickTier(fps: number): QualityTier {
    if (fps < 30) {
      return 'Q0';
    }

    if (fps < 45) {
      return 'Q1';
    }

    if (fps <= 55) {
      return 'Q2';
    }

    return 'Q3';
  }
}

export function applyQualityTier(effects: EffectConfig, tier: QualityTier): EffectConfig {
  const multiplier = TIER_MULTIPLIERS[tier];

  return {
    ...effects,
    particleRate: effects.particleRate * multiplier.particleRate,
    blurPx: effects.blurPx * multiplier.blurPx,
    glitchHz: effects.glitchHz * multiplier.glitchHz,
    ghostText: effects.ghostText * multiplier.ghostText,
    noise: effects.noise * multiplier.noise
  };
}
