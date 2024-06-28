import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Events } from "client/network";
import { PlayerGui } from "common/shared/utility/client";
import { toTimerFormat } from "common/shared/utility/time";

@Component({
  tag: "TimerLabel",
  ancestorWhitelist: [PlayerGui]
})
export class TimerLabel extends BaseComponent<{}, TextLabel> implements OnStart {
  public onStart(): void {
    Events.updateTimerUI.connect(remainingTime => this.instance.Text = toTimerFormat(remainingTime));
  }
}