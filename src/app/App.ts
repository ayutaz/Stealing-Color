import { ColorPickPipeline } from '../color/colorPickPipeline';
import { detectDeviceProfile } from '../core/deviceProfile';
import { ProgressionController } from '../core/progressionController';
import { type PrimaryActionContext, UiLayer } from '../layers/ui/UiLayer';
import { VfxLayer } from '../layers/vfx/VfxLayer';

export class App {
  private readonly progressionController = new ProgressionController();
  private readonly colorPickPipeline = new ColorPickPipeline();
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
      liteMode: this.deviceProfile.liteVfxMode
    });
  }

  public async init(): Promise<void> {
    this.scene.className = 'scene';
    this.vfxHost.className = 'layer-vfx';
    this.uiHost.className = 'layer-ui';
    this.scene.append(this.vfxHost, this.uiHost);
    this.mountNode.append(this.scene);

    this.uiLayer.init();
    await this.vfxLayer.init();
    this.uiLayer.setPrimaryAction((actionContext) => {
      void this.advanceState(actionContext);
    });
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
    this.uiLayer.render(level, this.buildUiRenderOptions());
    this.vfxLayer.render(level);
  }
}
