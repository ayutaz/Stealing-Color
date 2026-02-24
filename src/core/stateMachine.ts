import { LEVEL_CONFIG_MAP } from '../domain/levelConfig';
import type { LevelConfig } from '../domain/levelConfig';
import { STATE_SEQUENCE, type AppState } from '../domain/state';

export class StateMachine {
  private index = 0;

  public get currentState(): AppState {
    return STATE_SEQUENCE[this.index];
  }

  public get stateIndex(): number {
    return this.index;
  }

  public get totalStates(): number {
    return STATE_SEQUENCE.length;
  }

  public get canAdvance(): boolean {
    return this.index < STATE_SEQUENCE.length - 1;
  }

  public get isFinal(): boolean {
    return !this.canAdvance;
  }

  public get nextState(): AppState {
    if (!this.canAdvance) {
      return this.currentState;
    }

    return STATE_SEQUENCE[this.index + 1];
  }

  public get currentConfig(): LevelConfig {
    return LEVEL_CONFIG_MAP[this.currentState];
  }

  public advance(): AppState {
    if (!this.canAdvance) {
      return this.currentState;
    }

    this.index += 1;
    return this.currentState;
  }

  public reset(): void {
    this.index = 0;
  }
}
