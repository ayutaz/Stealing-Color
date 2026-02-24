import type { ButtonIcon, ChipToken, LevelConfig, TitleIcon } from '../../domain/levelConfig';
import { CHIP_COLORS } from '../../domain/levelConfig';

const TITLE_ICON_MAP: Record<TitleIcon, string> = {
  none: '',
  palette: '🎨',
  devil: '😈',
  skull: '💀',
  eye: '👁️'
};

const BUTTON_ICON_MAP: Record<ButtonIcon, string> = {
  none: '',
  eye: '👁️'
};

const CHIP_FIRST_ROW_LIMIT = 6;

export interface PrimaryActionContext {
  clientX: number;
  clientY: number;
}

export interface UiRenderOptions {
  chipColorOverrides?: readonly string[];
}

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
    this.titleIcon.className = 'ui-title-icon';
    this.titleText.className = 'ui-title-text';
    this.primaryButton.className = 'ui-primary';
    this.buttonIcon.className = 'ui-button-icon';
    this.buttonText.className = 'ui-button-text';
    this.chipRow.className = 'ui-chips';
    this.status.className = 'ui-status';

    this.primaryButton.type = 'button';

    this.title.append(this.titleIcon, this.titleText);
    this.primaryButton.append(this.buttonIcon, this.buttonText);
    this.panel.append(this.title, this.primaryButton, this.chipRow, this.status);
    this.host.append(this.panel);
  }

  public setPrimaryAction(handler: (context: PrimaryActionContext) => void): void {
    this.primaryButton.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) {
        return;
      }

      event.preventDefault();
      handler({
        clientX: event.clientX,
        clientY: event.clientY
      });
    });
  }

  public render(level: LevelConfig, options: UiRenderOptions = {}): void {
    this.panel.style.setProperty('--level-transition-ms', `${level.transitionMs}ms`);

    this.titleIcon.textContent = TITLE_ICON_MAP[level.titleIcon];
    this.titleText.textContent = level.titleText;
    this.title.hidden = level.titleText.trim().length === 0;

    this.buttonIcon.textContent = BUTTON_ICON_MAP[level.buttonIcon];
    this.buttonText.textContent = level.buttonText;
    this.buttonText.hidden = level.buttonText.trim().length === 0;
    this.primaryButton.classList.toggle('is-empty', this.buttonText.hidden);
    this.primaryButton.style.width = `${level.ui.width}px`;
    this.primaryButton.style.height = `${level.ui.height}px`;
    this.primaryButton.style.borderRadius = `${level.ui.radius}px`;
    this.primaryButton.style.background = level.ui.fill;
    this.primaryButton.style.borderColor = level.ui.border;

    this.renderChips(level, options.chipColorOverrides);
    this.status.textContent = this.buildStatus(level.curseSkulls);
  }

  private buildStatus(curseSkulls: number): string {
    if (curseSkulls === 0) {
      return '呪いレベル';
    }

    return `呪いレベル ${'💀'.repeat(curseSkulls)}`;
  }

  private renderChips(level: LevelConfig, chipColorOverrides: readonly string[] = []): void {
    if (level.chips.length === 0) {
      this.chipRow.hidden = true;
      this.chipRow.replaceChildren();
      return;
    }

    this.chipRow.hidden = false;
    const firstRow = document.createElement('div');
    firstRow.className = 'ui-chip-row';
    const secondRow = document.createElement('div');
    secondRow.className = 'ui-chip-row ui-chip-row-second';

    level.chips.slice(0, CHIP_FIRST_ROW_LIMIT).forEach((chip, index) => {
      firstRow.append(this.createChip(chip, chipColorOverrides[index]));
    });

    level.chips.slice(CHIP_FIRST_ROW_LIMIT).forEach((chip, index) => {
      secondRow.append(this.createChip(chip, chipColorOverrides[index + CHIP_FIRST_ROW_LIMIT]));
    });

    const rows: Node[] = [firstRow];
    if (secondRow.childElementCount > 0) {
      rows.push(secondRow);
    }

    this.chipRow.replaceChildren(...rows);
  }

  private createChip(chip: ChipToken, overrideColor?: string): HTMLElement {
    const chipElement = document.createElement('span');
    chipElement.className = 'ui-chip';
    chipElement.style.background = this.resolveChipColor(chip, overrideColor);
    return chipElement;
  }

  private resolveChipColor(chip: ChipToken, overrideColor?: string): string {
    if (overrideColor && /^#[0-9a-fA-F]{6}$/.test(overrideColor)) {
      return overrideColor;
    }

    return CHIP_COLORS[chip];
  }
}
