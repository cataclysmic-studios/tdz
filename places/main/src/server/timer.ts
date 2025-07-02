import Destroyable from "@rbxts/destroyable";

import type { MatchService } from "./services/match";
import Signal from "@rbxts/lemon-signal";

export class Timer extends Destroyable {
  public readonly counted = new Signal<(remainingTime: number) => void>;
  public readonly ended = new Signal;
  private timeScale: number;
  private timeElapsed = 0;

  public constructor(
    match: MatchService,
    public readonly length: number
  ) {
    super();
    this.timeScale = match.timeScale;
    this.trash.add(match.timeScaleChanged.Connect(timeScale => this.timeScale = timeScale));
    this.trash.add(this.counted);
    this.trash.add(this.ended);
    this.trash.add(() => this.timeElapsed = 999_999); // so isActive never returns true if it was destroyed
    this.start();
  }

  public isActive(): boolean {
    return this.timeElapsed < this.length;
  }

  private start(): void {
    this.counted.Fire(this.length);
    this.trash.add(task.spawn(() => {
      while (this.isActive()) {
        task.wait(1 / this.timeScale);
        this.timeElapsed++;
        this.counted.Fire(this.length - this.timeElapsed);
      }
      this.ended.Fire();
      this.destroy();
    }));
  }
}