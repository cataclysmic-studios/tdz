import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { Events } from "client/network";
import { PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import { tween } from "common/shared/utility/ui";

@Component({
  tag: "HealthBar",
  ancestorWhitelist: [PlayerGui]
})
export class HealthBar extends BaseComponent<{}, PlayerGui["Main"]["Main"]["Health"]> implements OnStart {
  private readonly tweenInfo = new TweenInfoBuilder().SetTime(0.15);

  public onStart(): void {
    Events.updateHealthUI.connect((health, maxHealth) => {
      this.instance.Amount.Text = `${toSuffixedNumber(health)} HP`;
      tween(this.instance.Bar, this.tweenInfo, {
        Size: UDim2.fromScale(health / maxHealth, 1)
      });
    });
  }
}