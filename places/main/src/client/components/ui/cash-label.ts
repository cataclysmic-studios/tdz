import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Player, PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";

@Component({
  tag: "CashLabel",
  ancestorWhitelist: [PlayerGui]
})
export class CashLabel extends BaseComponent<{}, TextLabel> implements OnStart {
  public onStart(): void {
    const leaderstats = <Leaderstats>Player.WaitForChild("leaderstats");

    this.update(leaderstats.Cash.Value);
    leaderstats.Cash.Changed.Connect(cash => this.update(cash));
  }

  private update(cash: number): void {
    this.instance.Text = `$${toSuffixedNumber(cash)}`;
  }
}