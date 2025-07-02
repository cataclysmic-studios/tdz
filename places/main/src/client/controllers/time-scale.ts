import { Controller, type OnInit, type OnStart } from "@flamework/core";
import Signal from "@rbxts/lemon-signal";

import { Events, Functions } from "client/network";
import { adjustAllSoundSpeeds, initializeDefaultSoundSpeeds } from "shared/utility";

@Controller()
export class TimeScaleController implements OnInit, OnStart {
  public readonly changed = new Signal<(timeScale: number) => void>;
  private timeScale!: number;

  public onInit(): void {
    Events.timeScaleUpdated.connect(timeScale => {
      this.timeScale = timeScale;
      this.changed.Fire(timeScale);
      adjustAllSoundSpeeds(timeScale);
    });
  }

  public async onStart(): Promise<void> {
    initializeDefaultSoundSpeeds();
    this.timeScale = await Functions.getTimeScale();
  }

  public get(): number {
    return this.timeScale;
  }
}