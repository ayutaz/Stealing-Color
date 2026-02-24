import type { LevelConfig } from '../domain/levelConfig';
import type { AppState } from '../domain/state';
import { StateMachine } from './stateMachine';

type NowFn = () => number;

interface ProgressionControllerOptions {
  stateMachine?: StateMachine;
  now?: NowFn;
}

export class ProgressionController {
  private readonly stateMachine: StateMachine;
  private readonly now: NowFn;
  private lockUntil = 0;

  public constructor(options: ProgressionControllerOptions = {}) {
    this.stateMachine = options.stateMachine ?? new StateMachine();
    this.now = options.now ?? (() => performance.now());
  }

  public get currentState(): AppState {
    return this.stateMachine.currentState;
  }

  public get currentConfig(): LevelConfig {
    return this.stateMachine.currentConfig;
  }

  public get stateIndex(): number {
    return this.stateMachine.stateIndex;
  }

  public tryAdvance(): boolean {
    if (!this.stateMachine.canAdvance) {
      return false;
    }

    const now = this.now();
    if (now < this.lockUntil) {
      return false;
    }

    this.lockUntil = now + this.stateMachine.currentConfig.clickLockMs;
    this.stateMachine.advance();
    return true;
  }

  public reset(): void {
    this.stateMachine.reset();
    this.lockUntil = 0;
  }
}
