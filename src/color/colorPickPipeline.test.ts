import { describe, expect, test, vi } from 'vitest';

import { ColorPickPipeline, type ColorPickContext, type ColorPickResult } from './colorPickPipeline';

const BASE_CONTEXT: ColorPickContext = {
  clientX: 320,
  clientY: 220,
  viewportWidth: 920,
  viewportHeight: 720,
  bgGradient: 'linear-gradient(180deg, #EF5A41 0%, #EF5A41 100%)'
};

describe('ColorPickPipeline', () => {
  test('uses EyeDropper when supported', async () => {
    const eyeDropper = {
      isSupported: () => true,
      pick: vi.fn<() => Promise<string>>().mockResolvedValue('#112233')
    };
    const canvasSampler = {
      sample: vi.fn(() => '#445566')
    };
    const inputColor = {
      pick: vi.fn<() => Promise<string>>().mockResolvedValue('#778899')
    };

    const pipeline = new ColorPickPipeline({
      eyeDropper,
      canvasSampler,
      inputColor
    });

    const result = await pipeline.pickColor(BASE_CONTEXT);

    expect(result).toEqual<ColorPickResult>({
      hex: '#112233',
      source: 'eye-dropper'
    });
    expect(canvasSampler.sample).not.toHaveBeenCalled();
    expect(inputColor.pick).not.toHaveBeenCalled();
  });

  test('falls back to canvas when EyeDropper fails', async () => {
    const eyeDropper = {
      isSupported: () => true,
      pick: vi.fn<() => Promise<string>>().mockRejectedValue(new Error('aborted'))
    };
    const canvasSampler = {
      sample: vi.fn(() => '#ABCDEF')
    };
    const inputColor = {
      pick: vi.fn<() => Promise<string>>().mockResolvedValue('#778899')
    };

    const pipeline = new ColorPickPipeline({
      eyeDropper,
      canvasSampler,
      inputColor
    });

    const result = await pipeline.pickColor(BASE_CONTEXT);

    expect(result).toEqual<ColorPickResult>({
      hex: '#ABCDEF',
      source: 'canvas'
    });
    expect(canvasSampler.sample).toHaveBeenCalledTimes(1);
    expect(inputColor.pick).not.toHaveBeenCalled();
  });

  test('falls back to input color when canvas sampling fails', async () => {
    const eyeDropper = {
      isSupported: () => false,
      pick: vi.fn<() => Promise<string>>().mockResolvedValue('#112233')
    };
    const canvasSampler = {
      sample: vi.fn(() => {
        throw new Error('canvas unavailable');
      })
    };
    const inputColor = {
      pick: vi.fn<() => Promise<string>>().mockResolvedValue('#778899')
    };

    const pipeline = new ColorPickPipeline({
      eyeDropper,
      canvasSampler,
      inputColor
    });

    const result = await pipeline.pickColor(BASE_CONTEXT);

    expect(result).toEqual<ColorPickResult>({
      hex: '#778899',
      source: 'input-color'
    });
    expect(canvasSampler.sample).toHaveBeenCalledTimes(1);
    expect(inputColor.pick).toHaveBeenCalledTimes(1);
  });
});
