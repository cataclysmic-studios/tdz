import Destroyable from "common/shared/classes/destroyable";

import type { MatchService } from "./services/match";
import Signal from "@rbxts/signal";

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
    this.janitor.Add(match.timeScaleChanged.Connect(timeScale => this.timeScale = timeScale));
    this.janitor.Add(this.counted);
    this.janitor.Add(this.ended);
    this.start();
  }

  private start(): void {
    this.counted.Fire(this.length);
    this.janitor.Add(task.spawn(() => {
      while (true) {
        task.wait(1 / this.timeScale);
        this.timeElapsed++;
        this.counted.Fire(this.length - this.timeElapsed);
        if (this.timeElapsed >= this.length) break;
      }
      this.ended.Fire();
      this.destroy();
    }));
  }
}