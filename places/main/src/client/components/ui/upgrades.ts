import { Component, BaseComponent } from "@flamework/components";

import { PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import type { TowerInfo } from "shared/entity-components";

@Component({
  tag: "Upgrades",
  ancestorWhitelist: [PlayerGui]
})
export class Upgrades extends BaseComponent<{}, PlayerGui["Main"]["Main"]["TowerUpgrades"]> {
  public updateInfo(info: Omit<TowerInfo, "patch">): void {
    this.instance.Info.Damage.Title.Text = toSuffixedNumber(info.totalDamage);
    this.instance.Info.Worth.Title.Text = `$${toSuffixedNumber(info.worth)}`;
    // TODO: stats (when i make it)
  }
}