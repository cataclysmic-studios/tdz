import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Events } from "client/network";
import { PlayerGui } from "common/shared/utility/client";

import type { NotificationController } from "common/client/controllers/notification";

@Component({
  tag: "SkipWave",
  ancestorWhitelist: [PlayerGui]
})
export class SkipWave extends BaseComponent<{}, PlayerGui["Main"]["Main"]["SkipWave"]> implements OnStart {
  private voting = false;
  private votedToSkip = false;

  public constructor(
    private readonly notification: NotificationController
  ) { super(); }

  public onStart(): void {
    this.instance.GetPropertyChangedSignal("Visible")
      .Connect(() => {
        const defaultPosition = this.notification.defaultContainerPosition;
        this.notification.moveContainer(this.instance.Visible ? defaultPosition.add(UDim2.fromScale(0, this.instance.Size.Y.Scale)) : defaultPosition)
      });

    Events.updateSkipWaveUI.connect((enabled, votes, playerCount) => {
      this.voting = enabled;
      this.instance.Visible = enabled;
      this.instance.VoteCount.Text = `${votes}/${playerCount}`;
      if (!enabled)
        this.votedToSkip = false;
    });
    this.instance.VoteNo.MouseButton1Click.Connect(() => {
      if (!this.voting) return;
      if (!this.votedToSkip) return;
      this.votedToSkip = false;
      Events.voteSkipWave(this.votedToSkip);
    });
    this.instance.VoteYes.MouseButton1Click.Connect(() => {
      if (!this.voting) return;
      if (this.votedToSkip) return;
      this.votedToSkip = true;
      Events.voteSkipWave(this.votedToSkip);
    });
  }
}