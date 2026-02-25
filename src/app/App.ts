import { ColorPickPipeline } from '../color/colorPickPipeline';
import { detectDeviceProfile } from '../core/deviceProfile';
import { ProgressionController } from '../core/progressionController';
import { detectRuntimeFlags } from '../core/runtimeFlags';
import { type PrimaryActionContext, UiLayer } from '../layers/ui/UiLayer';
import { VfxLayer } from '../layers/vfx/VfxLayer';

declare global {
  interface Window {
    __STEALING_COLOR__?: {
      getSnapshot(): {
        state: string;
        stateIndex: number;
        chipCount: number;
        lastPickSource: string | null;
        qualityTier: string;
        actionInFlight: boolean;
      };
    };
  }
}

export class App {
  private readonly progressionController = new ProgressionController();
  private readonly runtimeFlags = detectRuntimeFlags();
  private readonly colorPickPipeline = new ColorPickPipeline({
    disableEyeDropper: this.runtimeFlags.disableEyeDropper
  });
  private readonly deviceProfile = detectDeviceProfile();
  private readonly scene: HTMLElement;
  private readonly vfxHost: HTMLElement;
  private readonly uiHost: HTMLElement;
  private readonly uiLayer: UiLayer;
  private readonly vfxLayer: VfxLayer;
  private readonly mountNode: HTMLElement;
  private readonly pickedChipColors: string[] = [];

  private actionInFlight = false;

  public constructor(mountNode: HTMLElement) {
    this.mountNode = mountNode;
    this.scene = document.createElement('main');
    this.vfxHost = document.createElement('div');
    this.uiHost = document.createElement('div');
    this.uiLayer = new UiLayer(this.uiHost);
    this.vfxLayer = new VfxLayer(this.vfxHost, {
      liteMode: this.deviceProfile.liteVfxMode || this.runtimeFlags.forceLiteVfx,
      reducedMotion: this.runtimeFlags.reducedMotion,
      deterministicMode: this.runtimeFlags.deterministicMode
    });
  }

  public async init(): Promise<void> {
    this.applyRuntimeClasses();
    this.scene.className = 'scene';
    this.scene.setAttribute('data-testid', 'scene');
    this.vfxHost.className = 'layer-vfx';
    this.vfxHost.setAttribute('data-testid', 'vfx-layer');
    this.uiHost.className = 'layer-ui';
    this.uiHost.setAttribute('data-testid', 'ui-layer');
    this.scene.append(this.vfxHost, this.uiHost);
    this.mountNode.append(this.scene);

    this.uiLayer.init();
    await this.vfxLayer.init();
    this.uiLayer.setPrimaryAction((actionContext) => {
      void this.advanceState(actionContext);
    });
    this.installTestBridge();
    this.render();
  }

  private async advanceState(actionContext: PrimaryActionContext): Promise<void> {
    if (this.actionInFlight) {
      return;
    }

    if (!this.progressionController.tryAdvance()) {
      return;
    }

    this.actionInFlight = true;
    this.render();

    const currentLevel = this.progressionController.currentConfig;
    const chipIndex = currentLevel.chips.length - 1;

    try {
      if (chipIndex >= 0) {
        const picked = await this.colorPickPipeline.pickColor({
          clientX: actionContext.clientX,
          clientY: actionContext.clientY,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          bgGradient: currentLevel.bgGradient
        });

        this.pickedChipColors[chipIndex] = picked.hex;
        this.scene.dataset.lastPickSource = picked.source;
      }
    } finally {
      this.actionInFlight = false;
      this.render();
    }
  }

  private buildUiRenderOptions(): { chipColorOverrides: readonly string[] } {
    return {
      chipColorOverrides: this.pickedChipColors
    };
  }

  private render(): void {
    const level = this.progressionController.currentConfig;
    this.scene.dataset.state = level.state;
    this.scene.dataset.stateIndex = `${this.progressionController.stateIndex}`;
    this.scene.dataset.chipCount = `${level.chips.length}`;
    this.scene.dataset.actionInFlight = this.actionInFlight ? '1' : '0';
    if (!this.scene.dataset.lastPickSource) {
      this.scene.dataset.lastPickSource = 'none';
    }
    this.uiLayer.render(level, this.buildUiRenderOptions());
    this.vfxLayer.render(level);
  }

  private installTestBridge(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.__STEALING_COLOR__ = {
      getSnapshot: () => ({
        state: this.progressionController.currentState,
        stateIndex: this.progressionController.stateIndex,
        chipCount: this.progressionController.currentConfig.chips.length,
        lastPickSource: this.scene.dataset.lastPickSource ?? null,
        qualityTier: this.vfxLayer.getQualityTier(),
        actionInFlight: this.actionInFlight
      })
    };
  }

  private applyRuntimeClasses(): void {
    document.body.classList.toggle('a11y-reduced-motion', this.runtimeFlags.reducedMotion);
    document.body.classList.toggle('a11y-high-contrast', this.runtimeFlags.highContrast);
  }
}
