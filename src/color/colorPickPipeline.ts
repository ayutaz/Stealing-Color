export type ColorPickSource = 'eye-dropper' | 'canvas' | 'input-color';

export interface ColorPickContext {
  clientX: number;
  clientY: number;
  viewportWidth: number;
  viewportHeight: number;
  bgGradient: string;
}

export interface ColorPickResult {
  hex: string;
  source: ColorPickSource;
}

export interface EyeDropperPort {
  isSupported(): boolean;
  pick(): Promise<string>;
}

export interface CanvasSamplerPort {
  sample(context: ColorPickContext): string;
}

export interface InputColorPort {
  pick(): Promise<string>;
}

interface EyeDropperLike {
  open(): Promise<{ sRGBHex: string }>;
}

interface EyeDropperCtor {
  new (): EyeDropperLike;
}

interface BrowserWindowWithEyeDropper extends Window {
  EyeDropper?: EyeDropperCtor;
}

export class ColorPickPipeline {
  private readonly eyeDropper: EyeDropperPort;
  private readonly canvasSampler: CanvasSamplerPort;
  private readonly inputColor: InputColorPort;

  public constructor(options: {
    eyeDropper?: EyeDropperPort;
    canvasSampler?: CanvasSamplerPort;
    inputColor?: InputColorPort;
  } = {}) {
    this.eyeDropper = options.eyeDropper ?? new BrowserEyeDropperPort();
    this.canvasSampler = options.canvasSampler ?? new CanvasGradientSampler();
    this.inputColor = options.inputColor ?? new InputColorPortImpl();
  }

  public async pickColor(context: ColorPickContext): Promise<ColorPickResult> {
    if (this.eyeDropper.isSupported()) {
      try {
        const eyeDropperHex = await this.eyeDropper.pick();
        return {
          hex: normalizeHexColor(eyeDropperHex),
          source: 'eye-dropper'
        };
      } catch {
        // fall through to canvas sampling
      }
    }

    try {
      const canvasHex = this.canvasSampler.sample(context);
      return {
        hex: normalizeHexColor(canvasHex),
        source: 'canvas'
      };
    } catch {
      // fall through to input[type=color]
    }

    const inputHex = await this.inputColor.pick();
    return {
      hex: normalizeHexColor(inputHex),
      source: 'input-color'
    };
  }
}

export class BrowserEyeDropperPort implements EyeDropperPort {
  public isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const eyeDropperWindow = window as BrowserWindowWithEyeDropper;
    return typeof eyeDropperWindow.EyeDropper === 'function';
  }

  public async pick(): Promise<string> {
    const eyeDropperWindow = window as BrowserWindowWithEyeDropper;
    if (!eyeDropperWindow.EyeDropper) {
      throw new Error('EyeDropper is unavailable');
    }

    const eyeDropper = new eyeDropperWindow.EyeDropper();
    const picked = await eyeDropper.open();
    return picked.sRGBHex;
  }
}

export class CanvasGradientSampler implements CanvasSamplerPort {
  private readonly canvas: HTMLCanvasElement | OffscreenCanvas;
  private readonly context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  public constructor(canvasSize = 160) {
    if (typeof OffscreenCanvas !== 'undefined') {
      const offscreen = new OffscreenCanvas(canvasSize, canvasSize);
      const context = offscreen.getContext('2d');
      if (!context) {
        throw new Error('Failed to create OffscreenCanvas context');
      }

      this.canvas = offscreen;
      this.context = context;
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to create Canvas 2D context');
    }

    this.canvas = canvas;
    this.context = context;
  }

  public sample(context: ColorPickContext): string {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ratioX = clamp(context.clientX / Math.max(1, context.viewportWidth), 0, 1);
    const ratioY = clamp(context.clientY / Math.max(1, context.viewportHeight), 0, 1);

    this.drawGradient(context.bgGradient, width, height);

    const sampleX = clamp(Math.round(ratioX * (width - 1)), 0, width - 1);
    const sampleY = clamp(Math.round(ratioY * (height - 1)), 0, height - 1);
    const pixel = this.context.getImageData(sampleX, sampleY, 1, 1).data;
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
  }

  private drawGradient(gradientText: string, width: number, height: number): void {
    const parsed = parseLinearGradient(gradientText);
    const gradient = this.context.createLinearGradient(parsed.x0 * width, parsed.y0 * height, parsed.x1 * width, parsed.y1 * height);

    parsed.stops.forEach((stop) => {
      gradient.addColorStop(stop.position, stop.color);
    });

    this.context.clearRect(0, 0, width, height);
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, width, height);
  }
}

export class InputColorPortImpl implements InputColorPort {
  private input: HTMLInputElement | null = null;

  public async pick(): Promise<string> {
    const input = this.ensureInput();

    return await new Promise<string>((resolve) => {
      let settled = false;
      const timeoutId = window.setTimeout(() => {
        settle(input.value);
      }, 1200);

      const settle = (value: string): void => {
        if (settled) {
          return;
        }

        settled = true;
        window.clearTimeout(timeoutId);
        input.removeEventListener('input', onInput);
        input.removeEventListener('change', onChange);
        input.removeEventListener('blur', onBlur);
        resolve(value);
      };

      const onInput = (): void => {
        settle(input.value);
      };

      const onChange = (): void => {
        settle(input.value);
      };

      const onBlur = (): void => {
        settle(input.value);
      };

      input.addEventListener('input', onInput, { once: true });
      input.addEventListener('change', onChange, { once: true });
      input.addEventListener('blur', onBlur, { once: true });
      input.click();
    });
  }

  private ensureInput(): HTMLInputElement {
    if (this.input) {
      return this.input;
    }

    const input = document.createElement('input');
    input.type = 'color';
    input.value = '#56ABE8';
    input.className = 'color-fallback-input';
    document.body.append(input);
    this.input = input;
    return input;
  }
}

interface ParsedGradient {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  stops: Array<{
    color: string;
    position: number;
  }>;
}

function parseLinearGradient(gradientText: string): ParsedGradient {
  const defaultParsed: ParsedGradient = {
    x0: 0.5,
    y0: 0,
    x1: 0.5,
    y1: 1,
    stops: [
      { color: '#090A0D', position: 0 },
      { color: '#090A0D', position: 1 }
    ]
  };

  const match = gradientText.match(/^linear-gradient\((.+)\)$/i);
  if (!match) {
    return defaultParsed;
  }

  const tokens = splitTopLevelCommas(match[1]);
  if (tokens.length < 2) {
    return defaultParsed;
  }

  const angleToken = tokens[0].trim();
  const angleMatch = angleToken.match(/(-?\d+(?:\.\d+)?)deg/i);
  const angleDeg = angleMatch ? Number.parseFloat(angleMatch[1]) : 180;
  const { x0, y0, x1, y1 } = resolveGradientVector(angleDeg);

  const rawStops = tokens.slice(1).map((token, index, allStops) => {
    const colorMatch = token.match(/#[0-9a-fA-F]{6}/);
    if (!colorMatch) {
      return null;
    }

    const positionMatch = token.match(/(-?\d+(?:\.\d+)?)\s*%/);
    const fallbackPosition = allStops.length <= 1 ? 0 : index / (allStops.length - 1);
    const position = positionMatch ? Number.parseFloat(positionMatch[1]) / 100 : fallbackPosition;

    return {
      color: colorMatch[0].toUpperCase(),
      position: clamp(position, 0, 1)
    };
  });

  const stops = rawStops.filter((value): value is { color: string; position: number } => value !== null);
  if (stops.length < 2) {
    return defaultParsed;
  }

  stops.sort((a, b) => a.position - b.position);
  return {
    x0,
    y0,
    x1,
    y1,
    stops
  };
}

function resolveGradientVector(angleDeg: number): { x0: number; y0: number; x1: number; y1: number } {
  const radian = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(radian);
  const dy = -Math.cos(radian);
  const x0 = clamp(0.5 - dx * 0.5, 0, 1);
  const y0 = clamp(0.5 - dy * 0.5, 0, 1);
  const x1 = clamp(0.5 + dx * 0.5, 0, 1);
  const y1 = clamp(0.5 + dy * 0.5, 0, 1);

  return { x0, y0, x1, y1 };
}

function splitTopLevelCommas(text: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of text) {
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    }

    if (char === ',' && depth === 0) {
      tokens.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim().length > 0) {
    tokens.push(current.trim());
  }

  return tokens;
}

function normalizeHexColor(input: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(input)) {
    return '#56ABE8';
  }

  return input.toUpperCase();
}

function componentToHex(value: number): string {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
