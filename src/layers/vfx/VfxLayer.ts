import { Application, BlurFilter, Container, Graphics, NoiseFilter } from 'pixi.js';

import { applyQualityTier, QualityLadder, type QualityTier } from '../../core/qualityLadder';
import type { EffectConfig, LevelConfig } from '../../domain/levelConfig';
import type { AppState } from '../../domain/state';
import {
  buildGhostWordCount,
  getFinalOverlayVisual,
  GHOST_WORDS_MAP
} from './vfxNarrative';

interface Particle {
  node: Graphics;
  vx: number;
  vy: number;
  ttlMs: number;
  lifeMs: number;
}

const MAX_PARTICLES = 64;
const PARTICLE_COLORS = [0xf65a43, 0x56abe8, 0xf45d97, 0xf1d46c, 0x253bff, 0xf8faff];

interface VfxLayerOptions {
  liteMode?: boolean;
  deterministicMode?: boolean;
  reducedMotion?: boolean;
}

export class VfxLayer {
  private readonly host: HTMLElement;
  private readonly app: Application;
  private readonly root: Container;
  private readonly particleLayer: Container;
  private readonly whiteoutOverlay: Graphics;
  private readonly blurFilter: BlurFilter;
  private readonly noiseFilter: NoiseFilter;
  private readonly qualityLadder: QualityLadder;
  private readonly liteMode: boolean;
  private readonly deterministicMode: boolean;
  private readonly reducedMotion: boolean;
  private readonly randomSource: () => number;
  private readonly overlayRoot: HTMLElement;
  private readonly noiseOverlay: HTMLElement;
  private readonly ghostOverlay: HTMLElement;
  private readonly finalOverlay: HTMLElement;
  private readonly chromaticOverlay: HTMLElement;
  private readonly vignetteOverlay: HTMLElement;

  private readonly particles: Particle[] = [];
  private currentLevel: LevelConfig | null = null;
  private scaledEffects: EffectConfig | null = null;
  private activeTier: QualityTier = 'Q3';
  private lastState: AppState | null = null;
  private elapsedMs = 0;
  private glitchTickMs = 0;
  private noiseSeed = 0;
  private whiteoutWidth = 0;
  private whiteoutHeight = 0;

  public constructor(host: HTMLElement, options: VfxLayerOptions = {}) {
    this.host = host;
    this.liteMode = options.liteMode ?? false;
    this.deterministicMode = options.deterministicMode ?? false;
    this.reducedMotion = options.reducedMotion ?? false;
    this.randomSource = this.deterministicMode ? createDeterministicRandom(0x5e1f1a7) : Math.random;
    this.noiseSeed = this.randomSource();
    this.app = new Application();
    this.root = new Container();
    this.particleLayer = new Container();
    this.whiteoutOverlay = new Graphics();
    this.blurFilter = new BlurFilter({
      strength: 0,
      quality: 4
    });
    this.noiseFilter = new NoiseFilter({
      noise: 0
    });
    this.qualityLadder = new QualityLadder({
      initialFps: this.liteMode || this.reducedMotion ? 48 : 60,
      sampleIntervalMs: this.liteMode || this.reducedMotion ? 180 : 250
    });

    this.overlayRoot = document.createElement('div');
    this.noiseOverlay = document.createElement('div');
    this.ghostOverlay = document.createElement('div');
    this.finalOverlay = document.createElement('div');
    this.chromaticOverlay = document.createElement('div');
    this.vignetteOverlay = document.createElement('div');
  }

  public async init(): Promise<void> {
    await this.app.init({
      resizeTo: this.host,
      antialias: true,
      backgroundAlpha: 0,
      autoStart: !this.deterministicMode
    });

    this.host.classList.add('vfx-host');
    this.host.classList.toggle('vfx-lite', this.liteMode);
    this.host.classList.toggle('vfx-reduced-motion', this.reducedMotion);
    this.host.classList.toggle('vfx-deterministic', this.deterministicMode);
    this.host.append(this.app.canvas);

    this.overlayRoot.className = 'vfx-overlay';
    this.noiseOverlay.className = 'vfx-noise';
    this.ghostOverlay.className = 'vfx-ghost';
    this.finalOverlay.className = 'vfx-final';
    this.finalOverlay.textContent = 'THE COLORS FREE';
    this.chromaticOverlay.className = 'vfx-chromatic';
    this.vignetteOverlay.className = 'vfx-vignette';
    this.overlayRoot.append(
      this.chromaticOverlay,
      this.noiseOverlay,
      this.ghostOverlay,
      this.finalOverlay,
      this.vignetteOverlay
    );
    this.host.append(this.overlayRoot);

    this.root.filters = [this.blurFilter, this.noiseFilter];
    this.root.addChild(this.particleLayer, this.whiteoutOverlay);
    this.app.stage.addChild(this.root);

    if (!this.deterministicMode) {
      this.app.ticker.add(() => {
        this.tick(this.app.ticker.deltaMS);
      });
    }
  }

  public render(level: LevelConfig): void {
    this.currentLevel = level;
    this.host.style.setProperty('--vfx-transition-ms', `${level.transitionMs}ms`);
    this.host.style.background = level.bgGradient;

    if (this.lastState !== level.state) {
      this.lastState = level.state;
      this.populateGhostWords(level.state, level.effects.ghostText);
    }

    if (this.deterministicMode) {
      this.activeTier = 'Q3';
      this.scaledEffects = applyQualityTier(level.effects, this.activeTier);
      this.updateFilters(this.scaledEffects, 0);
      this.updateParticles(this.scaledEffects, 0);
      this.updateWhiteout(this.scaledEffects);
      this.updateOverlays(this.scaledEffects, 0, level.state);
      this.app.render();
      this.host.dataset.qualityTier = this.activeTier;
    }
  }

  public getQualityTier(): QualityTier {
    return this.activeTier;
  }

  private tick(deltaMs: number): void {
    if (!this.currentLevel) {
      return;
    }
    const currentState = this.currentLevel.state;

    this.elapsedMs += deltaMs;
    const snapshot = this.qualityLadder.update(deltaMs);
    this.activeTier = snapshot.tier;
    this.scaledEffects = applyQualityTier(this.currentLevel.effects, this.activeTier);

    this.updateFilters(this.scaledEffects, deltaMs);
    this.updateParticles(this.scaledEffects, deltaMs);
    this.updateWhiteout(this.scaledEffects);
    this.updateOverlays(this.scaledEffects, deltaMs, currentState);
  }

  private updateFilters(effects: EffectConfig, deltaMs: number): void {
    const blurStrength = this.liteMode ? effects.blurPx * 0.72 : effects.blurPx;
    const noiseStrength = this.liteMode ? effects.noise * 0.74 : effects.noise;
    const motionScale = this.reducedMotion ? 0.35 : 1;
    this.blurFilter.strength = blurStrength * motionScale;
    this.noiseFilter.noise = clamp(noiseStrength * motionScale, 0, 1);
    this.noiseSeed = (this.noiseSeed + deltaMs * 0.00045) % 1;
    this.noiseFilter.seed = this.noiseSeed;
  }

  private updateParticles(effects: EffectConfig, deltaMs: number): void {
    const width = this.host.clientWidth || window.innerWidth;
    const height = this.host.clientHeight || window.innerHeight;
    const particleRate = this.liteMode ? effects.particleRate * 0.55 : effects.particleRate;
    const targetCountScale = this.reducedMotion ? 0.25 : 1;
    const targetCount = clampInt(Math.round(particleRate * targetCountScale), 0, MAX_PARTICLES);

    this.ensureParticleCount(targetCount, width, height);

    this.particles.forEach((particle, index) => {
      if (index >= targetCount) {
        particle.node.visible = false;
        return;
      }

      particle.node.visible = true;
      particle.lifeMs += deltaMs;
      if (!this.reducedMotion) {
        particle.node.x += particle.vx * deltaMs;
        particle.node.y += particle.vy * deltaMs;
      }

      if (
        particle.lifeMs >= particle.ttlMs ||
        particle.node.y < -40 ||
        particle.node.x < -60 ||
        particle.node.x > width + 60
      ) {
        this.resetParticle(particle, width, height);
      }

      const pulse = this.reducedMotion ? 1 : 0.85 + Math.sin((this.elapsedMs + index * 90) / 220) * 0.12;
      particle.node.scale.set(pulse);
      particle.node.alpha = 0.2 + effects.bloom * 0.55;
    });
  }

  private ensureParticleCount(targetCount: number, width: number, height: number): void {
    while (this.particles.length < targetCount) {
      const particle = this.createParticle(width, height);
      this.particles.push(particle);
      this.particleLayer.addChild(particle.node);
    }
  }

  private createParticle(width: number, height: number): Particle {
    const node = new Graphics();
    const radius = this.randomRange(8, 20);
    const color = this.pick(PARTICLE_COLORS);
    node.circle(0, 0, radius);
    node.fill({ color, alpha: 0.8 });
    node.alpha = 0.2;

    const particle: Particle = {
      node,
      vx: 0,
      vy: 0,
      ttlMs: 0,
      lifeMs: 0
    };

    this.resetParticle(particle, width, height);
    return particle;
  }

  private resetParticle(particle: Particle, width: number, height: number): void {
    particle.node.x = this.randomRange(width * 0.18, width * 0.82);
    particle.node.y = this.randomRange(height * 0.72, height * 1.1);
    particle.vx = this.reducedMotion ? 0 : this.randomRange(-0.03, 0.03);
    particle.vy = this.reducedMotion ? 0 : this.randomRange(-0.18, -0.07);
    particle.ttlMs = this.randomRange(1800, 5200);
    particle.lifeMs = 0;
  }

  private updateWhiteout(effects: EffectConfig): void {
    const width = this.host.clientWidth || window.innerWidth;
    const height = this.host.clientHeight || window.innerHeight;

    if (width !== this.whiteoutWidth || height !== this.whiteoutHeight) {
      this.whiteoutWidth = width;
      this.whiteoutHeight = height;
      this.whiteoutOverlay.clear();
      this.whiteoutOverlay.rect(0, 0, width, height);
      this.whiteoutOverlay.fill({ color: 0xffffff, alpha: 1 });
    }

    this.whiteoutOverlay.alpha = clamp(effects.whiteout, 0, 1);
  }

  private updateOverlays(effects: EffectConfig, deltaMs: number, currentState: AppState): void {
    const noiseOpacity = this.liteMode ? effects.noise * 0.55 : effects.noise * 0.95;
    const chromaticOpacity = this.liteMode ? effects.chromaticPx / 6.4 : effects.chromaticPx / 4.5;
    const motionScale = this.reducedMotion ? 0.45 : 1;
    this.noiseOverlay.style.opacity = `${clamp(noiseOpacity * motionScale, 0, 0.75)}`;
    this.ghostOverlay.style.opacity = `${clamp(effects.ghostText, 0, 1)}`;
    this.vignetteOverlay.style.opacity = `${clamp(effects.vignette, 0, 0.95)}`;
    this.chromaticOverlay.style.opacity = `${clamp(chromaticOpacity * motionScale, 0, 0.8)}`;
    this.overlayRoot.style.filter = `saturate(${1 + effects.bloom})`;

    const visual = getFinalOverlayVisual(currentState);
    this.finalOverlay.style.opacity = `${visual.opacity}`;
    this.finalOverlay.style.mixBlendMode = visual.blendMode;

    const allowsMotionTransforms = !this.reducedMotion && !this.deterministicMode;
    if (!allowsMotionTransforms) {
      this.host.style.transform = 'translate(0px, 0px) rotate(0deg)';
      this.ghostOverlay.style.transform = 'translate(0px, 0px) rotate(0deg)';
      this.finalOverlay.style.transform = 'translate(0px, 0px) rotate(0deg)';
    } else {
      this.glitchTickMs += deltaMs;
      const intervalMs = 1000 / Math.max(0.25, effects.glitchHz);
      if (this.glitchTickMs >= intervalMs) {
        this.glitchTickMs = 0;
        const shiftX = this.randomRange(-effects.shakePx, effects.shakePx);
        const shiftY = this.randomRange(-effects.shakePx, effects.shakePx);
        const tilt = this.randomRange(-effects.tiltDeg, effects.tiltDeg) * 0.16;
        this.host.style.transform = `translate(${shiftX * 0.25}px, ${shiftY * 0.25}px) rotate(${tilt * 0.4}deg)`;
        this.ghostOverlay.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${tilt}deg)`;
        this.finalOverlay.style.transform = `translate(${-shiftX}px, ${shiftY}px) rotate(${tilt * 0.6}deg)`;
      }
    }

    this.host.dataset.qualityTier = this.activeTier;
  }

  private populateGhostWords(state: AppState, ghostIntensity: number): void {
    this.ghostOverlay.replaceChildren();
    const words = GHOST_WORDS_MAP[state];
    if (words.length === 0) {
      return;
    }

    const totalWords = buildGhostWordCount(ghostIntensity);

    for (let index = 0; index < totalWords; index += 1) {
      const word = document.createElement('span');
      word.className = 'vfx-word';
      word.textContent = words[index % words.length];
      word.style.left = `${this.randomRange(2, 86)}%`;
      word.style.top = `${this.randomRange(8, 84)}%`;
      word.style.fontSize = `${this.randomRange(42, 112)}px`;
      word.style.transform = `rotate(${this.randomRange(-38, 38)}deg)`;
      word.style.opacity = `${this.randomRange(0.28, 0.82)}`;
      this.ghostOverlay.append(word);
    }
  }

  private randomRange(min: number, max: number): number {
    return this.randomSource() * (max - min) + min;
  }

  private pick<T>(items: T[]): T {
    return items[Math.floor(this.randomSource() * items.length)];
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampInt(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max));
}

function createDeterministicRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
