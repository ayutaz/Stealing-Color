import { StateMachine } from '../core/stateMachine';
import { UiLayer } from '../layers/ui/UiLayer';
import { VfxLayer } from '../layers/vfx/VfxLayer';

export class App {
  private readonly stateMachine = new StateMachine();
  private readonly scene: HTMLElement;
  private readonly vfxHost: HTMLElement;
  private readonly uiHost: HTMLElement;
  private readonly uiLayer: UiLayer;
  private readonly vfxLayer: VfxLayer;
  private readonly mountNode: HTMLElement;

  private lockUntil = 0;

  public constructor(mountNode: HTMLElement) {
    this.mountNode = mountNode;
    this.scene = document.createElement('main');
    this.vfxHost = document.createElement('div');
    this.uiHost = document.createElement('div');
    this.uiLayer = new UiLayer(this.uiHost);
    this.vfxLayer = new VfxLayer(this.vfxHost);
  }

  public async init(): Promise<void> {
    this.scene.className = 'scene';
    this.vfxHost.className = 'layer-vfx';
    this.uiHost.className = 'layer-ui';
    this.scene.append(this.vfxHost, this.uiHost);
    this.mountNode.append(this.scene);

    this.uiLayer.init();
    await this.vfxLayer.init();
    this.uiLayer.setPrimaryAction(() => {
      this.advanceState();
    });
    this.render();
  }

  private advanceState(): void {
    const now = performance.now();
    if (now < this.lockUntil) {
      return;
    }

    const current = this.stateMachine.currentConfig;
    this.lockUntil = now + current.clickLockMs;
    this.stateMachine.advance();
    this.render();
  }

  private render(): void {
    const level = this.stateMachine.currentConfig;
    this.uiLayer.render(level);
    this.vfxLayer.render(level);
  }
}
