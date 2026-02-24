import type { LevelConfig, TitleIcon } from '../../domain/levelConfig';
import { CHIP_COLORS } from '../../domain/levelConfig';

const TITLE_ICON_MAP: Record<TitleIcon, string> = {
  none: '',
  palette: '🎨',
  devil: '😈',
  skull: '💀',
  eye: '👁️'
};

export class UiLayer {
  private readonly host: HTMLElement;
  private readonly panel: HTMLElement;
  private readonly title: HTMLElement;
  private readonly titleIcon: HTMLElement;
  private readonly titleText: HTMLElement;
  private readonly primaryButton: HTMLButtonElement;
  private readonly buttonIcon: HTMLElement;
  private readonly buttonText: HTMLElement;
  private readonly chipRow: HTMLElement;
  private readonly status: HTMLElement;

  public constructor(host: HTMLElement) {
    this.host = host;
    this.panel = document.createElement('section');
    this.title = document.createElement('h1');
    this.titleIcon = document.createElement('span');
    this.titleText = document.createElement('span');
    this.primaryButton = document.createElement('button');
    this.buttonIcon = document.createElement('span');
    this.buttonText = document.createElement('span');
    this.chipRow = document.createElement('div');
    this.status = document.createElement('p');
  }

  public init(): void {
    this.panel.className = 'ui-panel';
    this.title.className = 'ui-title';
    this.primaryButton.className = 'ui-primary';
    this.chipRow.className = 'ui-chips';
    this.status.className = 'ui-status';

    this.primaryButton.type = 'button';

    this.title.append(this.titleIcon, this.titleText);
    this.primaryButton.append(this.buttonIcon, this.buttonText);
    this.panel.append(this.title, this.primaryButton, this.chipRow, this.status);
    this.host.append(this.panel);
  }

  public setPrimaryAction(handler: () => void): void {
    this.primaryButton.addEventListener('pointerdown', () => {
      handler();
    });
  }

  public render(level: LevelConfig): void {
    this.titleIcon.textContent = TITLE_ICON_MAP[level.titleIcon];
    this.titleText.textContent = level.titleText;
    this.title.hidden = level.titleText.length === 0;

    this.buttonIcon.textContent = level.buttonIcon === 'eye' ? '👁️' : '';
    this.buttonText.textContent = level.buttonText;
    this.primaryButton.style.width = `${level.ui.width}px`;
    this.primaryButton.style.height = `${level.ui.height}px`;
    this.primaryButton.style.borderRadius = `${level.ui.radius}px`;
    this.primaryButton.style.background = level.ui.fill;
    this.primaryButton.style.borderColor = level.ui.border;

    this.renderChips(level);
    this.status.textContent = `呪いレベル ${'💀'.repeat(level.curseSkulls)}`;
  }

  private renderChips(level: LevelConfig): void {
    this.chipRow.innerHTML = '';

    level.chips.forEach((chip) => {
      const chipElement = document.createElement('span');
      chipElement.className = 'ui-chip';
      chipElement.style.background = CHIP_COLORS[chip];
      this.chipRow.append(chipElement);
    });
  }
}
