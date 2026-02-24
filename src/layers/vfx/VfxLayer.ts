import { Application, Graphics } from 'pixi.js';
import type { LevelConfig } from '../../domain/levelConfig';

export class VfxLayer {
  private readonly host: HTMLElement;
  private readonly app: Application;
  private readonly background: Graphics;

  public constructor(host: HTMLElement) {
    this.host = host;
    this.app = new Application();
    this.background = new Graphics();
  }

  public async init(): Promise<void> {
    await this.app.init({
      resizeTo: this.host,
      antialias: true,
      backgroundAlpha: 0
    });

    this.host.append(this.app.canvas);
    this.app.stage.addChild(this.background);
  }

  public render(level: LevelConfig): void {
    const color = this.extractFirstColor(level.bgGradient);
    const width = this.host.clientWidth || window.innerWidth;
    const height = this.host.clientHeight || window.innerHeight;

    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill({ color, alpha: 1 });
  }

  private extractFirstColor(gradient: string): number {
    const match = gradient.match(/#[0-9a-fA-F]{6}/);

    if (!match) {
      return 0x090a0d;
    }

    return Number.parseInt(match[0].slice(1), 16);
  }
}
